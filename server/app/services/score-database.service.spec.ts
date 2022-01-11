// Disable de lint autorisé par chargés
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { PlayerScore } from '@app/classes/interfaces/player-score';
import { expect } from 'chai';
import { describe } from 'mocha';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as sinon from 'sinon';
import { ScoreDatabaseService } from './score-database.service';

const DELAY_ONE_SECOND = 1000;
const SHORT_DELAY = 300;

describe('ScoreDatabaseService', () => {
    let service: ScoreDatabaseService;
    let mongoServer: MongoMemoryServer;
    let inMemoryServerUrl: string;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        inMemoryServerUrl = mongoServer.getUri('database');

        service = new ScoreDatabaseService(inMemoryServerUrl);

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            resolve();
        });
    });

    afterEach(async () => {
        sinon.restore();
        await mongoServer.stop();
        await service.closeConnection();
    });

    it('should connect to the database when default start is called', async () => {
        // Reconnect to local server
        service = new ScoreDatabaseService();

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, DELAY_ONE_SECOND);
        });

        expect(service['isConnected']).equal(true);
    });

    it('should connect to the database when start is called', async () => {
        // Reconnect to local server
        service = new ScoreDatabaseService(inMemoryServerUrl);

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });

        expect(service['isConnected']).equal(true);
    });

    it('should not connect to the database when start is called', async () => {
        // Reconnect to local server

        await mongoServer.stop();
        service = new ScoreDatabaseService('FALSE_URL');

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        expect(service['isConnected']).equal(false);
    });

    it('resetDB should clear and populate DB', async () => {
        service = new ScoreDatabaseService(inMemoryServerUrl);

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        await service.resetDB();
        const scores = await service['classicScore'].find({}).toArray();
        expect(scores.length).to.equal(5);
        expect(service['isConnected']).equal(true);
    });

    it('resetDB should not reset if not connected', async () => {
        service = new ScoreDatabaseService('FALSE_URL');

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        expect(await service.resetDB()).equal(false);
    });

    it('getMapTop5 should return top 5 scores with associated names', async () => {
        service = new ScoreDatabaseService(inMemoryServerUrl);

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        const players: PlayerScore[] = [
            {
                name: 'Antoine',
                score: 1,
                mode: 'Classic',
            },
            {
                name: 'Alex',
                score: 1,
                mode: 'Classic',
            },
            {
                name: 'Mahmoud',
                score: 2,
                mode: 'Classic',
            },
            {
                name: 'Ahmed',
                score: 3,
                mode: 'Classic',
            },
            {
                name: 'Ax',
                score: 4,
                mode: 'Classic',
            },
            {
                name: 'Al',
                score: 5,
                mode: 'Classic',
            },
            {
                name: 'Aex',
                score: 5,
                mode: 'Classic',
            },
        ];
        await service.classicScore.insertMany(players);

        expect((await service.getTop5('Classic')).length).equal(5);
        const scores = await service['classicScore'].find({}).toArray();
        expect(scores.length).to.equal(7);
        expect(service['isConnected']).equal(true);
    });

    it('getTop5 should return empty array when not connected', async () => {
        service = new ScoreDatabaseService('FALSE_URL');

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });

        expect(await service.getTop5('Classic')).to.deep.equal([]);
    });

    it('insertDB should return the right number of players in Classic', async () => {
        service = new ScoreDatabaseService(inMemoryServerUrl);

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        const player: PlayerScore = {
            name: 'Antoine',
            score: 6,
            mode: 'Classic',
        };
        await service.resetDB();
        await service.insertDB(player);
        const scores = await service['classicScore'].find({}).toArray();
        expect((await service.getTop5('Classic')).length).equal(5);
        expect(scores.length).to.equal(6);
        expect(service['isConnected']).equal(true);
    });

    it('insertDB should return the right number of players in Log2990 mode', async () => {
        service = new ScoreDatabaseService(inMemoryServerUrl);

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        const player: PlayerScore = {
            name: 'Antoine',
            score: 6,
            mode: 'Log2990',
        };
        await service.resetDB();
        await service.insertDB(player);
        const scores = await service['log2990Score'].find({}).toArray();
        expect((await service.getTop5('Log2990')).length).equal(5);
        expect(scores.length).to.equal(6);
        expect(service['isConnected']).equal(true);
    });

    it('insertDB should return false when not connected', async () => {
        service = new ScoreDatabaseService('FALSE_URL');

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        const player: PlayerScore = {
            name: 'Antoine',
            score: 1,
            mode: 'Classic',
        };
        expect(await service.insertDB(player)).equal(false);
    });
});
