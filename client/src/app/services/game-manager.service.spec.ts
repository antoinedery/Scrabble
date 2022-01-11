import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { PERCENT, RANDOM_NUMBER_GENERATOR } from '@app/classes/constants/constants';
import { VirtualPlayerDifficulty } from '@app/classes/enums/enums';
import { IDictionary } from '@app/classes/interfaces/dictionary';
import { DataInfos, MultiPlayerGameInfos, PlayerInfos, ReserveInfos, TurnHandlerInfos } from '@app/classes/interfaces/multi-player-game-infos';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameManagerService } from '@app/services/game-manager.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { BeginnerVirtualPlayerActionsService } from '@app/services/virtual-player-actions/beginner/beginner-virtual-player-actions.service';
import { ExpertVirtualPlayerActionsService } from '@app/services/virtual-player-actions/expert/expert-virtual-player-actions.service';
import { DictionaryService } from './dictionary.service';
import { DisplayMessageService } from './display-message.service';
import { SelectGameModeService } from './select-game-mode.service';

describe('GameManagerService', () => {
    let service: GameManagerService;
    let playerSettingsService: PlayerSettingsService;
    let virtualPlayerSettingsService: VirtualPlayerSettingsService;
    let clientSocketService: ClientSocketService;
    let beginnerVirtualPlayerActionsService: BeginnerVirtualPlayerActionsService;
    let expertVirtualPlayerActionsService: ExpertVirtualPlayerActionsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule],
        });
        service = TestBed.inject(GameManagerService);
        playerSettingsService = TestBed.inject(PlayerSettingsService);
        virtualPlayerSettingsService = TestBed.inject(VirtualPlayerSettingsService);
        clientSocketService = TestBed.inject(ClientSocketService);
        beginnerVirtualPlayerActionsService = TestBed.inject(BeginnerVirtualPlayerActionsService);
        expertVirtualPlayerActionsService = TestBed.inject(ExpertVirtualPlayerActionsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('selectFirstPlayerToPlay should select real player to play when random number is  0', () => {
        spyOn(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER').and.returnValue(0);
        service.selectFirstPlayerToPlay();
        expect(playerSettingsService.hasToPlay).toBeTrue();
        expect(virtualPlayerSettingsService.hasToPlay).toBeFalse();
    });

    it('selectFirstPlayerToPlay should select virtualPlayer to play when random number is 1', () => {
        spyOn(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER').and.returnValue(PERCENT);
        service.selectFirstPlayerToPlay();
        expect(virtualPlayerSettingsService.hasToPlay).toBeTrue();
        expect(playerSettingsService.hasToPlay).toBeFalse();
    });

    it('initializeSoloGame function should call selectVirtualPlayerAction function when it is virtual player turn', () => {
        spyOn(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER').and.returnValue(PERCENT);
        const selectVirtualPlayerAction = spyOn(service, 'selectVirtualPlayerAction');
        service.initializeSoloGame();
        expect(selectVirtualPlayerAction).toHaveBeenCalled();
    });

    it('selectVirtualPlayerAction function should call executeAction of beginner virtual player', () => {
        const executeAction = spyOn(beginnerVirtualPlayerActionsService, 'executeAction');
        service.virtualPlayerDifficulty = VirtualPlayerDifficulty.Beginner;
        service.selectVirtualPlayerAction();
        expect(executeAction).toHaveBeenCalled();
    });

    it('selectVirtualPlayerAction function should call executeAction of expert virtual player', () => {
        const executeAction = spyOn(expertVirtualPlayerActionsService, 'executeAction');
        service.virtualPlayerDifficulty = VirtualPlayerDifficulty.Expert;
        service.selectVirtualPlayerAction();
        expect(executeAction).toHaveBeenCalled();
    });

    it('assignNames should be called from callSelectNameObservable subscribe', () => {
        const assignNamesSpy = spyOn(service, 'assignNames');
        clientSocketService.callSelectNameObservable.next(true);
        expect(assignNamesSpy).toHaveBeenCalled();
    });

    it('should assign the correct name depending on boolean value', () => {
        service.isSoloModeChosen = true;
        service.assignNames(true);
        expect(service.isCurrentPlayerTheGameCreator).toBeTrue();
    });

    it('should assign the correct name depending on boolean value', () => {
        service.isSoloModeChosen = false;
        service.assignNames(false);
        expect(service.isCurrentPlayerTheGameCreator).toBeFalse();
    });

    it('leaveGame should set isGameInitialize to false', () => {
        service.leaveGame();
        expect(service.isGameInitialize).toBeFalse();
    });

    it('leaveGame should call disableVirtualPlayer if soloModeIsChosen', () => {
        const disableVirtualPlayerSpy = spyOn(service, 'disableVirtualPlayer');
        const selectGameModeService = TestBed.inject(SelectGameModeService);
        selectGameModeService.isSoloModeChosen = true;
        service.leaveGame();
        expect(disableVirtualPlayerSpy).toHaveBeenCalled();
    });

    it('leaveGame should call leaveGame from clientSocketService if multiplayer is chosen', () => {
        const selectGameModeService = TestBed.inject(SelectGameModeService);
        selectGameModeService.isSoloModeChosen = false;
        const leaveGameSpy = spyOn(clientSocketService, 'leaveGame');
        service.leaveGame();
        expect(leaveGameSpy).toHaveBeenCalled();
    });

    it('selectVirtualPlayerAction should be called from hasToPlayObservable subscribe', () => {
        service.enableVirtualPlayer();
        const selectVirtualPlayerActionSpy = spyOn(service, 'selectVirtualPlayerAction');
        virtualPlayerSettingsService.hasToPlayObservable.next(true);
        expect(selectVirtualPlayerActionSpy).toHaveBeenCalled();
    });

    it('disableVirtualPlayer should unsubscribe from hasToPlayObservable subscribe', () => {
        service.enableVirtualPlayer();
        const unsubscribeSpy = spyOn(service.virtualPlayerActionSubscription, 'unsubscribe');
        service.disableVirtualPlayer();
        expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('convertMultiToSolo should be called through subscribe', () => {
        const convertMultiToSoloSpy = spyOn(service, 'convertMultiToSolo');
        clientSocketService.multiToSoloObservable.next();
        expect(convertMultiToSoloSpy).toHaveBeenCalled();
    });

    it('convertMultiToSolo should call multiples functions', () => {
        const dictionaryService = TestBed.inject(DictionaryService);
        const createDictionaryWithEndGameDataSpy = spyOn(dictionaryService, 'createDictionaryWithEndGameData').and.returnValue(true);

        const existingPlayer: PlayerInfos = {
            name: 'name',
            letterRack: [{ letter: 'A', score: 1 }],
            playerScore: 1,
            isMyTurn: false,
            privateObjective:
                '[[8,{"description":"Créer un mot qui rapporte plus de 8 points pendant 3 tours consécutifs","score":30,"fullfilled":false}]]',
        };
        const quittingPlayer: PlayerInfos = {
            name: 'name',
            letterRack: [{ letter: 'A', score: 1 }],
            playerScore: 1,
            isMyTurn: false,
            privateObjective:
                '[[8,{"description":"Créer un mot qui rapporte plus de 8 points pendant 3 tours consécutifs","score":30,"fullfilled":false}]]',
        };

        const turnHandlerInfos: TurnHandlerInfos = {
            turnsPassed: 1,
            timeValue: { minute: 1, second: 0 },
            gameEnded: false,
        };

        const publicObjectives =
            '[[8,{"description":"Créer un mot qui rapporte plus de 8 points pendant 3 tours consécutifs","score":30,"fullfilled":false}]]';

        const reserveInfos: ReserveInfos = { reserve: 'abc', size: 5 };
        const dictionary: IDictionary = { title: '', description: '', words: [] };
        const dataInfos: DataInfos = { reserveInfos, dictionary };

        const multiplayerInfos: MultiPlayerGameInfos = { existingPlayer, quittingPlayer, publicObjectives, turnHandlerInfos, dataInfos };

        service.convertMultiToSolo(multiplayerInfos);
        expect(createDictionaryWithEndGameDataSpy).toHaveBeenCalled();
    });

    it('convertMultiToSolo should return undefined if game is ended', () => {
        const dictionaryService = TestBed.inject(DictionaryService);
        spyOn(dictionaryService, 'createDictionaryWithEndGameData').and.returnValue(true);

        const existingPlayer: PlayerInfos = {
            name: 'name',
            letterRack: [{ letter: 'A', score: 1 }],
            playerScore: 1,
            isMyTurn: false,
            privateObjective:
                '[[8,{"description":"Créer un mot qui rapporte plus de 8 points pendant 3 tours consécutifs","score":30,"fullfilled":false}]]',
        };
        const quittingPlayer: PlayerInfos = {
            name: 'name',
            letterRack: [{ letter: 'A', score: 1 }],
            playerScore: 1,
            isMyTurn: false,
            privateObjective:
                '[[8,{"description":"Créer un mot qui rapporte plus de 8 points pendant 3 tours consécutifs","score":30,"fullfilled":false}]]',
        };

        const turnHandlerInfos: TurnHandlerInfos = {
            turnsPassed: 1,
            timeValue: { minute: 1, second: 0 },
            gameEnded: true,
        };

        const publicObjectives =
            '[[8,{"description":"Créer un mot qui rapporte plus de 8 points pendant 3 tours consécutifs","score":30,"fullfilled":false}]]';

        const reserveInfos: ReserveInfos = { reserve: 'abc', size: 5 };
        const dictionary: IDictionary = { title: '', description: '', words: [] };
        const dataInfos: DataInfos = { reserveInfos, dictionary };

        const multiplayerInfos: MultiPlayerGameInfos = { existingPlayer, quittingPlayer, publicObjectives, turnHandlerInfos, dataInfos };

        expect(service.convertMultiToSolo(multiplayerInfos)).toBeUndefined();
    });

    it('convertMultiToSolo should call display message if it is opponent turn', () => {
        const dictionaryService = TestBed.inject(DictionaryService);
        spyOn(dictionaryService, 'createDictionaryWithEndGameData').and.returnValue(true);
        const displayMessageService = TestBed.inject(DisplayMessageService);
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');

        const existingPlayer: PlayerInfos = {
            name: 'name',
            letterRack: [{ letter: 'A', score: 1 }],
            playerScore: 1,
            isMyTurn: false,
            privateObjective:
                '[[8,{"description":"Créer un mot qui rapporte plus de 8 points pendant 3 tours consécutifs","score":30,"fullfilled":false}]]',
        };
        const quittingPlayer: PlayerInfos = {
            name: 'name',
            letterRack: [{ letter: 'A', score: 1 }],
            playerScore: 1,
            isMyTurn: true,
            privateObjective:
                '[[8,{"description":"Créer un mot qui rapporte plus de 8 points pendant 3 tours consécutifs","score":30,"fullfilled":false}]]',
        };

        const turnHandlerInfos: TurnHandlerInfos = {
            turnsPassed: 1,
            timeValue: { minute: 1, second: 0 },
            gameEnded: false,
        };

        const publicObjectives =
            '[[8,{"description":"Créer un mot qui rapporte plus de 8 points pendant 3 tours consécutifs","score":30,"fullfilled":false}]]';

        const reserveInfos: ReserveInfos = { reserve: 'abc', size: 5 };
        const dictionary: IDictionary = { title: '', description: '', words: [] };
        const dataInfos: DataInfos = { reserveInfos, dictionary };

        const multiplayerInfos: MultiPlayerGameInfos = { existingPlayer, quittingPlayer, publicObjectives, turnHandlerInfos, dataInfos };

        service.convertMultiToSolo(multiplayerInfos);
        expect(addMessageListSpy).toHaveBeenCalled();
    });
});
