import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { GameManagerService } from '@app/services/game-manager.service';
import { NameValidatorService } from '@app/services/name-validator.service';
import { VirtualPlayerSettingsComponent } from './virtual-player-settings.component';

describe('VirtualPlayerSettingsComponent', () => {
    let component: VirtualPlayerSettingsComponent;
    let fixture: ComponentFixture<VirtualPlayerSettingsComponent>;
    let nameValidatorService: NameValidatorService;
    let gameManagerService: GameManagerService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VirtualPlayerSettingsComponent],
            providers: [{ provide: MatDialogRef, useValue: {} }],
            imports: [RouterTestingModule, MatDialogModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(VirtualPlayerSettingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        nameValidatorService = TestBed.inject(NameValidatorService);
        gameManagerService = TestBed.inject(GameManagerService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call the selectBotType function the button is clicked', () => {
        spyOn(component, 'selectBotDifficulty');
        const beginnerPlayerButton = fixture.debugElement.nativeElement.querySelector('button');
        beginnerPlayerButton.click();
        expect(component.selectBotDifficulty).toHaveBeenCalled();
    });

    it('should select beginner bot difficulty', () => {
        const beginnerPlayerSelected = 'card-selected';
        const beginnerPlayerButton = fixture.debugElement.nativeElement.querySelector('button');
        beginnerPlayerButton.click();
        expect(component.beginnerSelection).toBe(beginnerPlayerSelected);
    });

    it('should call the displayBotName function inside the selectBotType function', () => {
        spyOn(component, 'displayBotName');
        const beginnerPlayerButton = fixture.debugElement.nativeElement.querySelector('button');
        beginnerPlayerButton.click();
        expect(component.displayBotName).toHaveBeenCalled();
    });

    it('should display block the name of the virtual player difficulty is selected', () => {
        component.selectBotDifficulty(0);
        expect(component.virtualPlayerName.nativeElement.style.display).toBe('flex');
    });

    it('name should be updated trough the subscribe mechanism', fakeAsync(() => {
        component.ngOnInit();
        nameValidatorService.selectVirtualPlayerName();
        expect(component.playerName).toBeDefined();
    }));

    it('subscribe method is getting called', fakeAsync(() => {
        const subSpy = spyOn(nameValidatorService.nameChange, 'subscribe');
        component.ngOnInit();
        tick();
        expect(subSpy).toHaveBeenCalled();
    }));

    it('should select expert bot difficulty and unselect beginner difficulty', () => {
        const beginnerPlayerSelected = 'card';
        const expertPlayerSelected = 'card-selected';
        const expertPlayerButton = fixture.debugElement.query(By.css('#expert')).nativeElement;
        expertPlayerButton.click();
        expect(component.beginnerSelection).toBe(beginnerPlayerSelected);
        expect(component.expertSelection).toBe(expertPlayerSelected);
    });

    it('displayBotName should be called through subscribe', () => {
        const displayBotNameSpy = spyOn(component, 'displayBotName');
        gameManagerService.virtualPlayerDifficultyObservable.next(true);
        expect(displayBotNameSpy).toHaveBeenCalled();
    });

    it('displayBotName should hide bot name if the virtual player difficulty is not selected', () => {
        const difficultyNotSelected = 'card';
        component.displayBotName(false);
        expect(component.beginnerSelection).toEqual(difficultyNotSelected);
        expect(component.expertSelection).toEqual(difficultyNotSelected);
    });
});
