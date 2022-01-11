// Disable de lint autorisé par chargés
/* eslint-disable dot-notation */
import { PlayerName } from '@app/classes/interfaces/player-name';
import { expect } from 'chai';
import { describe } from 'mocha';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as sinon from 'sinon';
import { NameDatabaseService } from './name-database.service';

const DELAY_ONE_SECOND = 1000;
const SHORT_DELAY = 300;

describe('NameDatabaseService', () => {
    let service: NameDatabaseService;
    let mongoServer: MongoMemoryServer;
    let inMemoryServerUrl: string;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        inMemoryServerUrl = mongoServer.getUri('database');

        service = new NameDatabaseService(inMemoryServerUrl);

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
        service = new NameDatabaseService();

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
        service = new NameDatabaseService(inMemoryServerUrl);

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        expect(service['isConnected']).equal(true);
    });
    it('getCollection should return concacted array of player names', async () => {
        service = new NameDatabaseService(inMemoryServerUrl);

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        const easyPlayers: PlayerName[] = [
            {
                name: 'Antoine',
                difficulty: 'Easy',
            },
            {
                name: 'Alex',
                difficulty: 'Easy',
            },
        ];
        const expertPlayers: PlayerName[] = [
            {
                name: 'Nick',
                difficulty: 'Expert',
            },
            {
                name: 'Nock',
                difficulty: 'Expert',
            },
        ];
        await service.easyNames.insertMany(easyPlayers);
        await service.easyNames.insertMany(expertPlayers);
        const expectedLength = 4;
        expect((await service.getCollection()).length).equal(expectedLength);
    });
    it('getCollection should return empty array when not connected', async () => {
        service = new NameDatabaseService('FALSE_URL');

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });

        expect(await service.getCollection()).to.deep.equal([]);
    });

    it('removeDB should remove an easy player', async () => {
        service = new NameDatabaseService(inMemoryServerUrl);

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        const player: PlayerName = {
            name: 'Antoine',
            difficulty: 'Easy',
        };
        await service.easyNames.insertOne(player);
        const scores = await service['easyNames'].find({}).toArray();

        expect(scores.length).to.equal(1);

        expect(await service.removeDB(player)).to.deep.equal([]);
    });

    it('removeDB should remove an expert player', async () => {
        service = new NameDatabaseService(inMemoryServerUrl);

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        const player: PlayerName = {
            name: 'Antoine',
            difficulty: 'Expert',
        };
        await service.expertNames.insertOne(player);
        const scores = await service['expertNames'].find({}).toArray();

        expect(scores.length).to.equal(1);

        expect(await service.removeDB(player)).to.deep.equal([]);
    });

    it('removeDB should return empty array when not connected', async () => {
        service = new NameDatabaseService('FALSE_URL');

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        const player: PlayerName = {
            name: 'Antoine',
            difficulty: 'Easy',
        };
        expect(await service.removeDB(player)).to.deep.equal([]);
    });

    it('updateDB should update an easy player name', async () => {
        service = new NameDatabaseService(inMemoryServerUrl);

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        const player: PlayerName = {
            name: 'Antoine',
            difficulty: 'Easy',
        };
        service.easyNames.insertOne(player);
        await service.updateDB(player, 'Ahmed');
        const playerID = await service.easyNames.find({ name: 'Ahmed' }).toArray();

        expect(playerID.length).to.equal(1);
    });

    it('updateDB should update an expert player name', async () => {
        service = new NameDatabaseService(inMemoryServerUrl);

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        const player: PlayerName = {
            name: 'Antoine',
            difficulty: 'Expert',
        };
        service.expertNames.insertOne(player);
        await service.updateDB(player, 'Ahmed');
        const playerID = await service.expertNames.find({ name: 'Ahmed' }).toArray();

        expect(playerID.length).to.equal(1);
    });

    it('updateDB should return empty array when not connected', async () => {
        service = new NameDatabaseService('FALSE_URL');

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        const player: PlayerName = {
            name: 'Antoine',
            difficulty: 'Easy',
        };
        expect(await service.updateDB(player, 'Ahmed')).to.deep.equal([]);
    });

    it('insertDB should insert easy name', async () => {
        service = new NameDatabaseService(inMemoryServerUrl);

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        const player: PlayerName = {
            name: 'Antoine',
            difficulty: 'Easy',
        };
        await service.insertDB(player);
        const names = await service['easyNames'].find({}).toArray();
        expect(names.length).to.equal(1);
    });

    it('insertDB should insert expert name', async () => {
        service = new NameDatabaseService(inMemoryServerUrl);

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        const player: PlayerName = {
            name: 'Antoine',
            difficulty: 'Expert',
        };
        await service.insertDB(player);
        const names = await service['expertNames'].find({}).toArray();
        expect(names.length).to.equal(1);
    });

    it('insertDB should return empty array when not connected', async () => {
        service = new NameDatabaseService('FALSE_URL');

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        const player: PlayerName = {
            name: 'Antoine',
            difficulty: 'Easy',
        };
        expect(await service.insertDB(player)).to.deep.equal([]);
    });

    it('resetDB should return cleared and populated DB', async () => {
        service = new NameDatabaseService(inMemoryServerUrl);

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });
        await service.resetDB();
        const names = await service['easyNames'].find({}).toArray();
        expect(names.length).to.equal(3);
    });

    it('resetDB should return empty array when not connected', async () => {
        service = new NameDatabaseService('FALSE_URL');

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, SHORT_DELAY);
        });

        expect(await service.resetDB()).to.deep.equal([]);
    });
});
