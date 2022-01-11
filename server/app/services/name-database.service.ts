import { DEFAULT_EASY_NAMES, DEFAULT_EXPERT_NAMES } from '@app/classes/constants/constants';
import { PlayerName } from '@app/classes/interfaces/player-name';
import { Collection, Db, MongoClient, MongoClientOptions, MongoError } from 'mongodb';
import { Service } from 'typedi';

const DATABASE_URL = 'mongodb+srv://admin:admin@cluster0.kk5lq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const DATABASE_NAME = 'names';
const DATABASE_COLLECTION_EASY = 'Easy';
const DATABASE_COLLECTION_EXPERT = 'Expert';

@Service()
export class NameDatabaseService {
    database: Db;
    easyNames: Collection<PlayerName>;
    expertNames: Collection<PlayerName>;
    private client: MongoClient;
    private isConnected: boolean = false;

    constructor(uri = DATABASE_URL) {
        const options: MongoClientOptions = {};

        MongoClient.connect(uri, options, (error: MongoError, client: MongoClient) => {
            if (error) return;

            this.client = client;
            this.database = this.client.db(DATABASE_NAME);
            this.easyNames = this.database.collection(DATABASE_COLLECTION_EASY);
            this.expertNames = this.database.collection(DATABASE_COLLECTION_EXPERT);
            this.isConnected = true;
        });
    }

    async closeConnection(): Promise<void> {
        this.isConnected = false;
        if (this.client === undefined) return;
        this.client.close();
    }

    async getCollection(): Promise<PlayerName[]> {
        if (!this.isConnected) return [];
        const easyPlayers = this.database.collection<PlayerName>(DATABASE_COLLECTION_EASY);
        const expertPlayers = this.database.collection<PlayerName>(DATABASE_COLLECTION_EXPERT);
        const easyResults = await easyPlayers.find({}).toArray();
        const expertResults = await expertPlayers.find({}).toArray();
        const allNames = [...easyResults, ...expertResults];
        return allNames;
    }

    async removeDB(removePlayer: PlayerName): Promise<PlayerName[]> {
        if (!this.isConnected) return [];

        if (removePlayer.difficulty === 'Easy') await this.easyNames.deleteOne(removePlayer);
        else await this.expertNames.deleteOne(removePlayer);

        return await this.getCollection();
    }

    async updateDB(updatePlayer: PlayerName, newName: string): Promise<PlayerName[]> {
        if (!this.isConnected) return [];

        if (updatePlayer.difficulty === 'Easy') await this.easyNames.updateOne({ name: updatePlayer.name }, { $set: { name: newName } });
        else await this.expertNames.updateOne({ name: updatePlayer.name }, { $set: { name: newName } });

        return await this.getCollection();
    }

    async insertDB(insertPlayer: PlayerName): Promise<PlayerName[]> {
        if (!this.isConnected) return [];

        if (insertPlayer.difficulty === 'Easy') await this.easyNames.insertOne(insertPlayer);
        else await this.expertNames.insertOne(insertPlayer);

        return await this.getCollection();
    }

    async resetDB(): Promise<PlayerName[]> {
        if (!this.isConnected) return [];

        await this.easyNames.deleteMany({});
        await this.expertNames.deleteMany({});
        await this.easyNames.insertMany(DEFAULT_EASY_NAMES);
        await this.expertNames.insertMany(DEFAULT_EXPERT_NAMES);
        return await this.getCollection();
    }
}
