import { ApplicationRef, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Square } from "@app/classes/interfaces/board-game-interfaces";
import { IDictionary } from "@app/classes/interfaces/dictionary";
import { DictionaryDetails } from "@app/classes/interfaces/dictionary-details";
import { MultiPlayerGameInfos } from "@app/classes/interfaces/multi-player-game-infos";
import { Objective } from "@app/classes/interfaces/objectives";
import { Placement } from "@app/classes/interfaces/placement-interfaces";
import { PlayerName } from "@app/classes/interfaces/player-name";
import { PlayerScore } from "@app/classes/interfaces/player-score";
import { Reserve, Tile } from "@app/classes/interfaces/tile";
import { Time } from "@app/classes/interfaces/time";
import { WaitingGame } from "@app/classes/interfaces/waiting-game";
import { DisplayMessageService } from "@app/services/display-message.service";
import { DisplayWaitingGamesService } from "@app/services/display-waiting-games.service";
import { InputChatService } from "@app/services/input-chat.service";
import { PlayerSettingsService } from "@app/services/local-players/current-player/player-settings.service";
import { PlayAreaService } from "@app/services/play-area.service";
import { MousePlacementService } from "@app/services/players-placements/current/mouse/mouse-placement.service";
import { Subject } from "rxjs";
import { io, Socket } from "socket.io-client";
// import { environment } from 'src/environments/environment.prod'; // Pour AWS
import { environment } from "src/environments/environment"; // Pour localhost:3000
import { DictionaryService } from "./dictionary.service";
import { ConsolePlacementService } from "./players-placements/current/console/console-placement.service";
import { SelectGameModeService } from "./select-game-mode.service";
import { TurnHandlerService } from "./turn-handler.service";

interface Player {
  name: string;
  socketID: string;
}
interface GameRoom {
  gameCreatorName: string;
  joiningPlayerName: string;
}

@Injectable({
  providedIn: "root",
})
export class ClientSocketService {
  socket: Socket;
  id: string = "";
  player: Player = { name: "", socketID: "" };
  gameRoom: GameRoom = { gameCreatorName: "", joiningPlayerName: "" };
  areHomeSubscribesInitialized: boolean = false;
  areAdminSubscribesInitialized: boolean = false;
  callSelectNameObservable: Subject<boolean> = new Subject<boolean>();
  timeChange: Subject<Time> = new Subject<Time>();
  playerScoreObservable: Subject<number> = new Subject<number>();
  opponentScoreObservable: Subject<number> = new Subject<number>();
  playerRackSizeObservable: Subject<number> = new Subject<number>();
  opponentRackSizeObservable: Subject<number> = new Subject<number>();
  hasToPlayObservable: Subject<boolean> = new Subject<boolean>();
  updateReserveTotalSizeObservable: Subject<number> = new Subject<number>();
  alertMessageObservable: Subject<string> = new Subject<string>();
  playerScoreListObservable: Subject<PlayerScore[]> = new Subject<
    PlayerScore[]
  >();
  playerNameListObservable: Subject<PlayerName[]> = new Subject<PlayerName[]>();
  connectedServerObservable: Subject<boolean> = new Subject();
  updateDictionariesObservable: Subject<DictionaryDetails[]> = new Subject<
    DictionaryDetails[]
  >();
  dictionaryDownloadObservable: Subject<IDictionary> =
    new Subject<IDictionary>();
  roomEndedByDictionaryRemoval: Subject<unknown> = new Subject();

  multiToSoloObservable: Subject<MultiPlayerGameInfos> =
    new Subject<MultiPlayerGameInfos>();

  dictionaryImportObservable: Subject<IDictionary> = new Subject<IDictionary>();

  constructor(
    private displayWaitingGamesService: DisplayWaitingGamesService,
    private router: Router,
    private matDialog: MatDialog,
    private appRef: ApplicationRef,
    private displayMessageService: DisplayMessageService,
    private inputChatService: InputChatService,
    private playAreaService: PlayAreaService,
    private playerSettingsService: PlayerSettingsService,
    private selectGameModeService: SelectGameModeService,
    private turnHandlerService: TurnHandlerService,
    private consolePlacementService: ConsolePlacementService,
    private mousePlacementService: MousePlacementService,
    private dictionaryService: DictionaryService
  ) {
    this.socket = io(environment.url, {
      transports: ["websocket"],
      upgrade: false,
    });
  }

  initSubscribes(): void {
    this.inputChatService.messageObservable.subscribe((value: string) => {
      this.sendChatMessage(value);
    });

    this.consolePlacementService.lettersToPlaceObservable.subscribe((value) => {
      this.placeLetter(value[0], value[1], value[2]);
    });

    this.mousePlacementService.lettersToPlaceObservable.subscribe((value) => {
      this.placeLetter(value[0], value[1], value[2]);
    });

    this.inputChatService.lettersToExchangeObservable.subscribe((value) => {
      this.exchangeLettersUsingInputChat(value);
    });

    this.inputChatService.skipTurnMultiObservable.subscribe(() => {
      this.skipTurn();
    });

    this.inputChatService.sendReserveObservable.subscribe(() => {
      this.sendReserve();
    });
  }

  initializeHomeListeners(): void {
    if (this.areHomeSubscribesInitialized) return;
    this.initSubscribes();

    this.socket.on("connect", () => {
      this.id = this.socket.id;
    });
    this.socket.on("disconnect", () => {
      this.id = "";
      this.connectedServerObservable.next(false);
    });
    this.socket.on("resetTimer", (timer: Time) => {
      this.turnHandlerService.obtainTime(timer);
      this.turnHandlerService.resetTimer();
    });
    this.socket.on("clearTimer", () => {
      this.turnHandlerService.clearTimer();
    });
    this.socket.on("updateIsMyTurnToPlay", (socketID: string) => {
      this.selectGameModeService.onlinePlayerTurnObservable.next(
        socketID === this.socket.id
      );
    });
    this.socket.on(
      "hereIsTheReserveSize",
      (letterReserveTotalOfRoom: number) => {
        this.updateReserveTotalSizeObservable.next(letterReserveTotalOfRoom);
      }
    );
    this.socket.on("hereIsYourLetterRack", (letterRack: Tile[]) => {
      this.playerSettingsService.letters = letterRack;
      this.playerSettingsService.lettersChange.next(letterRack);
    });
    this.socket.on(
      "hereIsAPlayerScore",
      (playerScore: number, playerSocketID: string) => {
        this.updatePlayerScore(playerScore, playerSocketID);
      }
    );
    this.socket.on(
      "hereIsLetterRackSize",
      (playerRackSize: number, playerSocketID: string) => {
        this.updatePlayerRackSize(playerRackSize, playerSocketID);
      }
    );
    this.socket.on("hereIsTheBoardUpdated", (boardGame: Square[][]) => {
      this.playAreaService.boardGame = boardGame;
      this.playAreaService.boardGameUpdatedObservable.next();
    });
    this.socket.on("launchGame", (boardGame: Square[][]) => {
      this.playAreaService.boardGame = boardGame;
      this.router.navigate(["/game"]);
      this.displayMessageService.clearCommunicationBox();

      this.matDialog.closeAll();
      this.appRef.tick();
    });
    this.socket.on("hereIsTheReserve", (reserve: string) => {
      const reserveMap: Map<string, Reserve> = new Map(JSON.parse(reserve));
      for (const letter of reserveMap.keys()) {
        const quantity = this.getLetterQuantityMulti(letter, reserveMap);
        this.displayMessageService.addMessageList(
          "system",
          letter + `: ${quantity}` + "\n"
        );
      }
    });
    this.socket.on(
      "hereAreTheObjectives",
      (privateObjective: string, publicObjectives: string) => {
        const privateObjectiveMap: Map<number, Objective> =
          JSON.parse(privateObjective);
        const publicObjectivesMap: Map<number, Objective> =
          JSON.parse(publicObjectives);
        this.playerSettingsService.privatePlayerObjectiveObservable.next(
          privateObjectiveMap
        );
        this.playerSettingsService.publicObjectivesObservable.next(
          publicObjectivesMap
        );
      }
    );
    this.socket.on("objectiveCompleted", (message: string) => {
      this.displayMessageService.addMessageList("system", message);
    });
    this.socket.on("otherPlayerLeft", (gameInfos: MultiPlayerGameInfos) => {
      this.multiToSoloObservable.next(gameInfos);
    });
    this.socket.on(
      "hereAreTheWaitingGames",
      (waitingGames: WaitingGame[], isALog2990Game: boolean) => {
        /* istanbul ignore else */
        if (isALog2990Game === this.selectGameModeService.isLOG2990ModeChosen) {
          this.displayWaitingGamesService.addCreatedGame(waitingGames);
        }
      }
    );
    this.socket.on("cannotJoinGame", () => {
      this.matDialog.closeAll();
      const errorMsg =
        "Vous ne pouvez pas rejoindre cette partie : soit l'hôte l'a annulée, soit un autre joueur l'a rejointe avant vous.";
      alert(errorMsg);
    });
    this.socket.on("sendBothPlayerNames", (bothPlayerNames: string[]) => {
      this.gameRoom.gameCreatorName = bothPlayerNames[0];
      this.gameRoom.joiningPlayerName = bothPlayerNames[1];
      const isCurrentPlayerTheGameCreator =
        this.player.name === this.gameRoom.gameCreatorName;
      this.callSelectNameObservable.next(isCurrentPlayerTheGameCreator);
    });
    this.socket.on("hereIsANewMessage", (message: string, userName: string) => {
      this.displayMessageService.addMessageList(userName, message);
    });
    this.socket.on("LettersToExchangeNotPossible", (message: string) => {
      this.displayMessageService.addMessageList("system", message);
    });
    this.socket.on("cancelPlacement", () => {
      this.mousePlacementService.cancelPlacement();
      this.appRef.tick();
    });
    this.socket.on("preventPlayerFromPlaying", () => {
      this.selectGameModeService.isOnlinePlayerTurn = false;
    });
    this.socket.on("allowPlayerToPlay", () => {
      this.selectGameModeService.isOnlinePlayerTurn = true;
    });
    this.socket.on("endGame", (winnerPlayerName: string) => {
      this.selectGameModeService.endGameObservable.next(winnerPlayerName);
    });
    this.socket.on("deletedRoomDictionary", () => {
      this.roomEndedByDictionaryRemoval.next();
    });
    this.socket.on("sendDictionaryToClient", (result: IDictionary) => {
      this.dictionaryImportObservable.next(result);
    });
    this.socket.on("scoreList", (scoreList: PlayerScore[]) => {
      this.playerScoreListObservable.next(scoreList);
    });
    this.initializeDatabaseListeners();
    this.areHomeSubscribesInitialized = true;
  }

  initializeAdminListeners(): void {
    if (this.areAdminSubscribesInitialized) return;

    this.socket.on("connect", () => {
      this.id = this.socket.id;
    });

    this.socket.on("disconnect", () => {
      this.id = "";
      this.connectedServerObservable.next(false);
    });

    this.socket.on("receiveDictionary", (result: IDictionary) => {
      this.dictionaryDownloadObservable.next(result);
    });
    this.initializeDatabaseListeners();
    this.areAdminSubscribesInitialized = true;
  }

  initializeDatabaseListeners(): void {
    this.socket.on("errorMessage", (value) => {
      this.alertMessageObservable.next(value);
    });
    this.socket.on(
      "updateClientDictionary",
      (dictionaryList: DictionaryDetails[]) => {
        this.updateDictionariesObservable.next(dictionaryList);
      }
    );
    this.socket.on("nameList", (nameList: PlayerName[]) => {
      this.playerNameListObservable.next(nameList);
    });
  }
  createRoom(waitingGame: WaitingGame): void {
    this.player.name = waitingGame.playerName;
    this.player.socketID = this.socket.id;
    this.socket.emit("createRoom", waitingGame);
  }
  joinRoom(gameHostSocketID: string, joiningPlayerName: string): void {
    this.player.name = joiningPlayerName;
    this.player.socketID = this.socket.id;
    this.socket.emit("joinRoom", gameHostSocketID, joiningPlayerName);
  }
  sendReserve(): void {
    this.socket.emit("sendReserve");
  }
  placeLetter(
    placement: Placement,
    playerLetterRack: Tile[],
    message: string
  ): void {
    this.socket.emit("LettersToPlace", placement, playerLetterRack, message);
  }
  exchangeLettersUsingInputChat(lettersToExchange: string): void {
    this.socket.emit("LettersToExchangeUsingInputChat", lettersToExchange);
  }
  exchangeLettersUsingMouseSelection(lettersToExchange: string): void {
    this.socket.emit("LettersToExchangeUsingMouseSelection", lettersToExchange);
  }
  skipTurn(): void {
    this.socket.emit("PasserTourMulti");
  }
  leaveGame(): void {
    this.socket.emit("leaveGame");
  }
  endRoom(): void {
    this.socket.emit("endRoom");
  }
  sendCreatedGame(game: WaitingGame): void {
    this.socket.emit("addWaitingGame", game);
  }
  getWaitingGames(): void {
    this.socket.emit(
      "sendWaitingGames",
      this.selectGameModeService.isLOG2990ModeChosen
    );
  }
  sendChatMessage(message: string): void {
    this.socket.emit("newMessageToShare", message, this.player.name);
  }
  getLetterQuantityMulti(
    letter: string,
    reserve: Map<string, Reserve>
  ): number | undefined {
    const letterInReserve = reserve.get(letter);
    return letterInReserve !== undefined ? letterInReserve.quantity : undefined;
  }
  updatePlayerScore(playerScore: number, playerSocketID: string): void {
    if (this.socket.id === playerSocketID)
      this.playerScoreObservable.next(playerScore);
    else this.opponentScoreObservable.next(playerScore);
  }
  updatePlayerRackSize(
    playerLetterRackSize: number,
    playerSocketID: string
  ): void {
    if (this.socket.id === playerSocketID)
      this.playerRackSizeObservable.next(playerLetterRackSize);
    else this.opponentRackSizeObservable.next(playerLetterRackSize);
  }
  updateScoreList(gameMode: string): void {
    this.socket.emit("scoreListGameMode", gameMode);
  }
  updateNameList(): void {
    this.socket.emit("playerList");
  }
  resetDataBase() {
    this.socket.emit("resetData");
  }
  sendScoreToAdd(player: PlayerScore): void {
    this.socket.emit("sendScoreToAdd", player);
  }
  sendPlayerToAdd(player: PlayerName): void {
    this.socket.emit("sendPlayerToAdd", player);
  }
  sendPlayerToUpdate(player: PlayerName, newName: string): void {
    this.socket.emit("sendPlayerToUpdate", player, newName);
  }
  sendPlayerToRemove(player: PlayerName): void {
    this.socket.emit("sendPlayerToRemove", player);
  }
  sendDictionaryToServer(dictionary: IDictionary) {
    this.socket.emit("sendDictionaryToServer", dictionary);
  }
  updateDictionaryList() {
    this.socket.emit("updateDictionaryList");
  }
  removeDictionary(title: string) {
    this.socket.emit("removeDictionary", title);
  }
  editDictionary(
    previousDetails: DictionaryDetails,
    newDetails: DictionaryDetails
  ) {
    this.socket.emit("editDictionary", previousDetails, newDetails);
  }
  downloadDictionary(title: string) {
    this.socket.emit("downloadDictionary", title);
  }
  getDictionaryForClient() {
    this.socket.emit(
      "getDictionaryForClient",
      this.dictionaryService.dictionaryName
    );
  }
}
