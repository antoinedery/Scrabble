import { TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { NameValidatorService } from '@app/services/name-validator.service';
import { VirtualPlayerSettingsService } from './local-players/virtual-player/virtual-player-settings.service';

describe('NameValidatorService', () => {
    let service: NameValidatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [RouterTestingModule, MatDialogModule], providers: [{ provide: MatDialogRef, useValue: {} }] });
        service = TestBed.inject(NameValidatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('validatePlayerName should return false if letter contains less than 2 letters', () => {
        service.validatePlayerName('a');
        expect(service.playerNameIsValid).toBeFalse();
        expect(service.playerNameLengthIsValid).toBeFalse();
    });

    it('validatePlayerName should return false if letter contains more than 24 letters', () => {
        service.validatePlayerName('abcdefghijklmnopqrstuvwxyz');
        expect(service.playerNameIsValid).toBeFalse();
        expect(service.playerNameLengthIsValid).toBeFalse();
    });

    it('validatePlayerName should return false if string begins with anything but a letter', () => {
        service.validatePlayerName('1abc');
        expect(service.playerNameIsValid).toBeFalse();
        expect(service.playerFirstCharacterIsValid).toBeFalse();
    });

    it('validatePlayerName should return false if string contains anything but letters and digits', () => {
        service.validatePlayerName('abc $3');
        expect(service.playerNameIsValid).toBeFalse();
        expect(service.playerEveryCharacterIsValid).toBeFalse();
    });

    it('validatePlayerName should return true if string contains only letters', () => {
        service.validatePlayerName('abcdef');
        expect(service.playerNameIsValid).toBeTrue();
        expect(service.playerEveryCharacterIsValid).toBeTrue();
        expect(service.playerFirstCharacterIsValid).toBeTrue();
        expect(service.playerNameLengthIsValid).toBeTrue();
    });

    it('validatePlayerName should return true if string contains only letters', () => {
        const virtualPlayerSettingsService = TestBed.inject(VirtualPlayerSettingsService);
        const selectVirtualPlayerNameSpy = spyOn(service, 'selectVirtualPlayerName');
        virtualPlayerSettingsService.virtualPlayerNameSetterObservable.next();
        expect(selectVirtualPlayerNameSpy).toHaveBeenCalled();
    });
});
