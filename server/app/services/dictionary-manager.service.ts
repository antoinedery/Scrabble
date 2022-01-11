import { IDictionary } from '@app/classes/interfaces/dictionary';
import { DictionaryDetails } from '@app/classes/interfaces/dictionary-details';
import * as fs from 'fs';
import * as io from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Service } from 'typedi';
declare type ASocket = io.Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>;

@Service()
export class DictionaryManagerService {
    dictionaryList: DictionaryDetails[] = [];
    path: string = './app/assets/dictionaries/';

    constructor() {
        this.initializeDictionaryList();
    }

    initializeDictionaryList(): void {
        this.dictionaryList = [];
        const directory = fs.readdirSync(this.path);
        for (const file of directory) {
            const data = fs.readFileSync(this.path + file, 'utf8');
            if (JSON.parse(data).title === 'Français')
                this.dictionaryList.unshift({ title: JSON.parse(data).title, description: JSON.parse(data).description });
            else this.dictionaryList.push({ title: JSON.parse(data).title, description: JSON.parse(data).description });
        }
    }

    handleNewDictionary(dictionary: IDictionary, socket: ASocket) {
        /* istanbul ignore else */
        if (!fs.existsSync(this.path)) fs.mkdirSync(this.path, { recursive: true });

        fs.writeFileSync(this.path + dictionary.title + '.json', JSON.stringify(dictionary));
        this.dictionaryList.push({ title: dictionary.title, description: dictionary.description });
        this.updateClientDictionary(socket);
    }

    editDictionary(previousDetails: DictionaryDetails, newDetails: DictionaryDetails, socket: ASocket) {
        const file = fs.readFileSync(this.path + previousDetails.title + '.json', 'utf8');
        const index = this.getIndexOfDictionary(previousDetails.title);

        if (index === undefined) return;
        this.dictionaryList[index] = newDetails;

        fs.unlinkSync(this.path + previousDetails.title + '.json');

        const result: IDictionary = {
            title: newDetails.title,
            description: newDetails.description,
            words: JSON.parse(file).words,
        };

        fs.writeFileSync(this.path + newDetails.title + '.json', JSON.stringify(result), 'utf8');
        this.updateClientDictionary(socket);
    }

    removeDictionary(title: string, socket: ASocket) {
        const index = this.getIndexOfDictionary(title);
        if (index === undefined) return;
        this.dictionaryList.splice(index, 1);
        fs.unlinkSync(this.path + title + '.json');
        this.updateClientDictionary(socket);
    }

    clearList(socket: ASocket): void {
        for (const [index, dictionary] of this.dictionaryList.entries()) {
            if (index !== 0) fs.unlinkSync(this.path + dictionary.title + '.json');
        }
        const defaultDictionary = this.dictionaryList[0];
        this.dictionaryList = [];
        this.dictionaryList.push(defaultDictionary);
        this.updateClientDictionary(socket);
    }

    updateClientDictionary(socket: ASocket) {
        socket.emit('updateClientDictionary', this.dictionaryList);
        socket.broadcast.emit('updateClientDictionary', this.dictionaryList);
    }

    downloadDictionary(title: string, socket: ASocket) {
        const file = fs.readFileSync(this.path + title + '.json', 'utf8');
        socket.emit('receiveDictionary', JSON.parse(file));
    }

    sendDictionaryToClient(title: string, socket: ASocket) {
        const file = fs.readFileSync(this.path + title + '.json', 'utf8');
        socket.emit('sendDictionaryToClient', JSON.parse(file));
    }

    getIndexOfDictionary(title: string): number | undefined {
        for (const [index, dictionary] of this.dictionaryList.entries()) {
            if (dictionary.title === title) return index;
        }
        return undefined;
    }
}
