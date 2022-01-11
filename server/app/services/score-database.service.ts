import { DEFAULT_CLASSIC_PLAYERS, DEFAULT_LOG2990_PLAYERS, MAX_NUMBER_SCORES } from '@app/classes/constants/constants';
import { PlayerScore } from '@app/classes/interfaces/player-score';
import { Collection, Db, MongoClient, MongoClientOptions, MongoError } from 'mongodb';
import { Service } from 'typedi';

// CHANGE the URL for your database information
const DATABASE_URL = 'mongodb+srv://admin:admin@cluster0.kk5lq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const DATABASE_NAME = 'score';
const DATABASE_COLLECTION_CLASSIC = 'Classic';
const DATABASE_COLLECTION_LOG2990 = 'Log2990';

@Service()
export class ScoreDatabaseService {
    classicScore: Collection<PlayerScore>;
    log2990Score: Collection<PlayerScore>;
    private database: Db;
    private client: MongoClient;
    private isConnected: boolean = false;

    constructor(uri: string = DATABASE_URL) {
        const options: MongoClientOptions = {};

        MongoClient.connect(uri, options, (error: MongoError, client: MongoClient) => {
            if (error) return;

            this.client = client;
            this.database = this.client.db(DATABASE_NAME);
            this.classicScore = this.database.collection(DATABASE_COLLECTION_CLASSIC);
            this.log2990Score = this.database.collection(DATABASE_COLLECTION_LOG2990);
            this.isConnected = true;
        });
    }

    async closeConnection(): Promise<void> {
        this.isConnected = false;
        if (this.client === undefined) return;
        this.client.close();
    }

    async getTop5(modeName: string): Promise<PlayerScore[]> {
        const scoreArray: PlayerScore[] = [];
        if (!this.isConnected) return [];

        const player = this.database.collection<PlayerScore>(modeName);
        const results = await player
            .find({})
            .sort({
                score: -1,
            })
            .toArray();
        const playerMap = new Map<number, string[]>();
        for (const result of results) {
            const foundScore = playerMap.get(result.score);
            if (foundScore) foundScore.push(result.name);
            else {
                playerMap.set(result.score, [result.name]);
                if (playerMap.size >= MAX_NUMBER_SCORES) break;
            }
        }

        // output Handling
        for (const entry of playerMap.entries()) {
            let outputString = '';
            const nameArray: string[] = [];

            // Add name
            for (const name of entry[1]) {
                // Verify if not already in array
                /* istanbul ignore else */
                if (!nameArray.includes(name)) nameArray.push(name);
            }

            // Convert Array to string
            for (const [index, name] of nameArray.entries()) {
                outputString += name;
                if (index !== nameArray.length - 1) outputString += ' - ';
            }
            scoreArray.push({ name: outputString, score: entry[0], mode: modeName });
        }
        return scoreArray;
    }

    async insertDB(newPlayer: PlayerScore): Promise<boolean> {
        if (!this.isConnected) return false;

        if (newPlayer.mode === 'Classic') await this.classicScore.insertOne(newPlayer);
        else await this.log2990Score.insertOne(newPlayer);

        return true;
    }

    // Erases all items and reinitializes with initial 3
    async resetDB(): Promise<boolean> {
        if (!this.isConnected) return false;

        // clear
        await this.classicScore.deleteMany({});
        await this.log2990Score.deleteMany({});

        // populate
        const options = { ordered: true };
        await this.classicScore.insertMany(DEFAULT_CLASSIC_PLAYERS, options);
        await this.log2990Score.insertMany(DEFAULT_LOG2990_PLAYERS, options);
        return true;
    }
}
