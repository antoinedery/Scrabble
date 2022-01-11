import { TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerName } from '@app/classes/interfaces/player-name';
import { ClientSocketService } from './client-socket.service';
import { VirtualPlayerCreatorService } from './virtual-player-creator.service';

describe('VirtualPlayerCreatorService', () => {
    let service: VirtualPlayerCreatorService;
    let clientSocketService: ClientSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        });
        service = TestBed.inject(VirtualPlayerCreatorService);
        clientSocketService = TestBed.inject(ClientSocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('beginnerVirtualPlayersNames array should be populated from subscribe', () => {
        const playerNameArray: PlayerName[] = [];
        playerNameArray.push({ name: 'playerName', difficulty: 'Easy' });
        clientSocketService.playerNameListObservable.next(playerNameArray);
        expect(service.beginnerVirtualPlayersNames.length).toEqual(1);
    });

    it('expertVirtualPlayersNames array should be populated from subscribe', () => {
        const playerNameArray: PlayerName[] = [];
        playerNameArray.push({ name: 'playerName', difficulty: 'Expert' });
        clientSocketService.playerNameListObservable.next(playerNameArray);
        expect(service.expertVirtualPlayersNames.length).toEqual(1);
    });

    it('checkNameExist should return true if name is found in beginner names array', () => {
        service.beginnerVirtualPlayersNames.push('nameBeginner');
        expect(service.checkNameExist('NamebEGinner')).toBeTrue();
    });

    it('checkNameExist should return true if name is found in expert names array', () => {
        service.expertVirtualPlayersNames.push('nameExpert');
        expect(service.checkNameExist('nameEXPERT')).toBeTrue();
    });

    it('checkNameExist should return false if name is not in either of the two arrays', () => {
        service.expertVirtualPlayersNames.push('nameExpert');
        expect(service.checkNameExist('name')).toBeFalse();
    });
});
