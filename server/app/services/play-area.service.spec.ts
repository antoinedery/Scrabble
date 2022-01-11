// Disable de lint autorisé par chargés
/* eslint-disable no-unused-vars */
import { TABLE_BONUS_CASE_COORDINATES } from '@app/classes/constants/constants';
import { PlayAreaService } from '@app/services/play-area.service';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import * as SocketIO from 'socket.io';
import { Container } from 'typedi';

describe('PlayAreaService', () => {
    let service: PlayAreaService;

    beforeEach(() => {
        service = Container.get(PlayAreaService);
    });

    it('getRandomNumber should return a value between min and max', () => {
        const minValue = 0;
        const maxValue = 2;
        const expectedMaxNumber = 2;
        expect(service.getRandomNumber(minValue, maxValue)).to.lessThanOrEqual(expectedMaxNumber);
    });

    it('randomizeBoard should initialiseBoardCaseList on randomized board state and emit a signal', () => {
        const emitObject = {
            emit: (eventName: string, ...args: unknown[]) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomId: string) => {
                return emitObject;
            },
        };

        const spy1 = Sinon.spy(serverStub, 'to');
        const spy2 = Sinon.spy(emitObject, 'emit');

        const testTable: string[] = [];
        const testRandomizedTable: string[] = [];
        const roomID = '123';

        for (const bonusCaseName of service.tableBonus) {
            testTable.push(bonusCaseName.name);
        }
        const randomize = true;
        service.randomizeBoard(randomize, serverStub as unknown as SocketIO.Server, roomID);

        for (const bonusCaseName of service.tableBonus) {
            testRandomizedTable.push(bonusCaseName.name);
        }
        expect(testTable).not.to.deep.equal(testRandomizedTable);
        expect(spy1.calledOnceWith(roomID)).to.equal(true);
        expect(spy2.calledOnceWith('launchGame', service.boardGame)).to.equal(true);

        spy1.restore();
        spy2.restore();
    });

    it('randomizeBoard should initialiseBoardCaseList on initial board state and emit a signal', () => {
        service.boardGame = [];
        service.tableBonus = JSON.parse(JSON.stringify(TABLE_BONUS_CASE_COORDINATES));
        const emitObject = {
            emit: (eventName: string, ...args: unknown[]) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomId: string) => {
                return emitObject;
            },
        };
        const spy1 = Sinon.spy(serverStub, 'to');
        const spy2 = Sinon.spy(emitObject, 'emit');

        const testTable = service.tableBonus;
        const roomID = '123';
        const randomize = false;
        service.randomizeBoard(randomize, serverStub as unknown as SocketIO.Server, roomID);

        expect(service.tableBonus).to.deep.equal(testTable);
        expect(spy1.calledOnceWith(roomID)).to.equal(true);
        expect(spy2.calledOnceWith('launchGame', service.boardGame)).to.equal(true);

        spy1.restore();
        spy2.restore();
    });
});
