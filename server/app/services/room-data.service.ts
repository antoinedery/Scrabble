import { OBJECTIVES, OBJECTIVE_1, OBJECTIVE_8, RANDOM_NUMBER_GENERATOR } from '@app/classes/constants/constants';
import { Objective } from '@app/classes/interfaces/objectives';
import { Player } from '@app/classes/interfaces/player';
import { Room } from '@app/classes/interfaces/room';
import { Time } from '@app/classes/interfaces/time';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { LetterReserveService } from './letter-reserve.service';

@Service()
export class RoomDataService {
    roomID: string = '';
    timer: Time = { minute: 1, second: 0 };
    isGameEnded: boolean = false;
    isLog2990ModeChosen: boolean = false;
    gameCreator: Player = { socketID: '', playerName: '', playerScore: 0, letterRack: [], isMyTurn: false, privateObjective: new Map() };
    guestPlayer: Player = { socketID: '', playerName: '', playerScore: 0, letterRack: [], isMyTurn: false, privateObjective: new Map() };
    publicObjectives: Map<number, Objective> = new Map();

    constructor(private letterReserveService: LetterReserveService) {}

    initRoomData(roomID: string, room: Room, sio: io.Server): string {
        this.roomID = roomID;
        this.timer = room.gameParameters.timer;
        this.isLog2990ModeChosen = room.gameParameters.isLog2990ModeChosen;
        if (this.isLog2990ModeChosen) this.initializeObjectives();

        this.gameCreator.socketID = room.gameCreator.socketID;
        this.gameCreator.playerName = room.gameCreator.playerName;
        this.gameCreator.playerScore = 0;
        this.gameCreator.letterRack = this.letterReserveService.assignLettersToPlayer();

        this.guestPlayer.socketID = room.guestPlayer.socketID;
        this.guestPlayer.playerName = room.guestPlayer.playerName;
        this.guestPlayer.playerScore = 0;
        this.guestPlayer.letterRack = this.letterReserveService.assignLettersToPlayer();

        const socketToStart = this.selectPlayerToStart(this.gameCreator.socketID, this.guestPlayer.socketID);
        if (socketToStart === this.gameCreator.socketID) {
            this.gameCreator.isMyTurn = true;
            this.guestPlayer.isMyTurn = false;
        } else {
            this.gameCreator.isMyTurn = false;
            this.guestPlayer.isMyTurn = true;
        }
        const activePlayerName = this.getPlayerName(socketToStart);

        this.sendDataToPlayers(sio, socketToStart);

        return activePlayerName;
    }

    sendDataToPlayers(sio: io.Server, socketToStart: string): void {
        sio.to(this.roomID).emit('updateIsMyTurnToPlay', socketToStart);
        sio.to(this.roomID).emit('hereIsTheReserveSize', this.letterReserveService.letterReserveTotalSize);
        sio.to(this.roomID).emit('hereIsAPlayerScore', this.gameCreator.playerScore, this.gameCreator.socketID);
        sio.to(this.roomID).emit('hereIsAPlayerScore', this.guestPlayer.playerScore, this.guestPlayer.socketID);
        sio.to(this.gameCreator.socketID).emit('hereIsYourLetterRack', this.gameCreator.letterRack);
        sio.to(this.guestPlayer.socketID).emit('hereIsYourLetterRack', this.guestPlayer.letterRack);

        if (this.isLog2990ModeChosen) this.sendObjectivesToPlayers(sio);
    }

    sendObjectivesToPlayers(sio: io.Server): void {
        const gameCreatorPrivateObjective = JSON.stringify(Array.from(this.gameCreator.privateObjective));
        const guestPlayerPrivateObjective = JSON.stringify(Array.from(this.guestPlayer.privateObjective));
        const publicObjectives = JSON.stringify(Array.from(this.publicObjectives));
        sio.to(this.gameCreator.socketID).emit('hereAreTheObjectives', gameCreatorPrivateObjective, publicObjectives);
        sio.to(this.guestPlayer.socketID).emit('hereAreTheObjectives', guestPlayerPrivateObjective, publicObjectives);
    }

    generateRandomNumber(minValue: number, maxValue: number): number {
        return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
    }

    selectPlayerToStart(gameHostSocketID: string, joiningPlayerID: string): string {
        const index = this.generateRandomNumber(0, 1);
        const sockets: string[] = [];
        sockets.push(gameHostSocketID);
        sockets.push(joiningPlayerID);
        return sockets[index];
    }

    getPlayerName(socketID: string): string {
        return this.gameCreator.socketID === socketID ? this.gameCreator.playerName : this.guestPlayer.playerName;
    }

    initializeObjectives(): void {
        this.resetAllFullfilledProperties();
        this.assignObjectives();
    }

    resetAllFullfilledProperties(): void {
        for (const obj of OBJECTIVES) {
            obj.fullfilled = false;
        }
    }

    assignObjectives(): void {
        this.gameCreator.privateObjective = new Map();
        this.guestPlayer.privateObjective = new Map();
        this.publicObjectives = new Map();
        const objectivesTaken: number[] = [];
        const gameCreatorPrivateObjective = this.assignPrivateObjectiveToGameCreator();
        const guestPlayerPrivateObjective = this.assignPrivateObjectiveToGuestPlayer(gameCreatorPrivateObjective);
        objectivesTaken.push(gameCreatorPrivateObjective);
        objectivesTaken.push(guestPlayerPrivateObjective);
        this.assignPublicObjectives(objectivesTaken);
    }

    assignPrivateObjectiveToGameCreator(): number {
        const privateObjective = RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(OBJECTIVE_1, OBJECTIVE_8);
        this.gameCreator.privateObjective.set(privateObjective, OBJECTIVES[privateObjective - 1]);
        return privateObjective;
    }

    assignPrivateObjectiveToGuestPlayer(objectiveAlreadyTaken: number): number {
        let privateObjective = RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(OBJECTIVE_1, OBJECTIVE_8);
        while (privateObjective === objectiveAlreadyTaken) {
            privateObjective = RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(OBJECTIVE_1, OBJECTIVE_8);
        }
        this.guestPlayer.privateObjective.set(privateObjective, OBJECTIVES[privateObjective - 1]);
        return privateObjective;
    }

    assignPublicObjectives(objectivesTaken: number[]): void {
        for (let i = 0; i < 2; i++) {
            let publicObjective = RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(OBJECTIVE_1, OBJECTIVE_8);
            while (objectivesTaken.includes(publicObjective)) {
                publicObjective = RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(OBJECTIVE_1, OBJECTIVE_8);
            }
            this.publicObjectives.set(publicObjective, OBJECTIVES[publicObjective - 1]);
            objectivesTaken.push(publicObjective);
        }
    }
}
