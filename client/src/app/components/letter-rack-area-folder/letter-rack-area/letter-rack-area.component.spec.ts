import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { LetterRackAreaComponent } from '@app/components/letter-rack-area-folder/letter-rack-area/letter-rack-area.component';
import { LetterRackComponent } from '@app/components/letter-rack-area-folder/letter-rack/letter-rack.component';
import { TileComponent } from '@app/components/letter-rack-area-folder/tile/tile.component';
import { DisplayMessageService } from '@app/services/display-message.service';
import { InputChatService } from '@app/services/input-chat.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { MousePlacementService } from '@app/services/players-placements/current/mouse/mouse-placement.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';

describe('LetterRackAreaComponent', () => {
    let component: LetterRackAreaComponent;
    let fixture: ComponentFixture<LetterRackAreaComponent>;
    let virtualPlayerSettingsService: VirtualPlayerSettingsService;
    let inputChatService: InputChatService;
    let displayMessageService: DisplayMessageService;
    let selectGameModeService: SelectGameModeService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LetterRackAreaComponent, TileComponent, LetterRackComponent],
            imports: [RouterTestingModule, MatDialogModule],
            providers: [{ provide: MatDialogModule, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LetterRackAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        virtualPlayerSettingsService = TestBed.inject(VirtualPlayerSettingsService);
        inputChatService = TestBed.inject(InputChatService);
        displayMessageService = TestBed.inject(DisplayMessageService);
        selectGameModeService = TestBed.inject(SelectGameModeService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('playPlacement should call addMessageList if virtal player is playing', () => {
        displayMessageService.messagesList = [];
        virtualPlayerSettingsService.hasToPlay = true;
        const playButton = fixture.debugElement.query(By.css('#play-btn')).nativeElement;
        playButton.click();
        expect(displayMessageService.messagesList[0].text).toEqual("Commande impossible : ce n'est pas votre tour de jouer.");
    });

    it('playPlacement should call confirmMousePlacement if virtual player is not playing', () => {
        const mousePlacementService = TestBed.inject(MousePlacementService);
        const confirmMousePlacement = spyOn(mousePlacementService, 'confirmPlayerPlacement');
        selectGameModeService.isSoloModeChosen = true;
        virtualPlayerSettingsService.hasToPlay = false;
        const playButton = fixture.debugElement.query(By.css('#play-btn')).nativeElement;
        playButton.click();
        expect(confirmMousePlacement).toHaveBeenCalled();
    });

    it("endTurn should call resetTimer and validateCommand when it is player's turn to play", () => {
        selectGameModeService.isSoloModeChosen = true;
        virtualPlayerSettingsService.hasToPlay = false;
        const validateCommandSpy = spyOn(inputChatService, 'validateCommand');
        const endTurnButton = fixture.debugElement.query(By.css('#end-turn-btn')).nativeElement;
        endTurnButton.click();
        expect(validateCommandSpy).toHaveBeenCalled();
    });

    it('endTurn should print error message when it is not the players turn to play', () => {
        displayMessageService.messagesList = [];
        selectGameModeService.isSoloModeChosen = true;
        virtualPlayerSettingsService.hasToPlay = true;
        const endTurnButton = fixture.debugElement.query(By.css('#end-turn-btn')).nativeElement;
        endTurnButton.click();
        expect(displayMessageService.messagesList[0].text).toEqual("Commande impossible : ce n'est pas votre tour de jouer.");
    });

    it('selectGameMode should call endTurnButton function if multiplayer mode is chosen', () => {
        selectGameModeService.isSoloModeChosen = false;
        const endTurnButtonSpy = spyOn(component, 'endTurnButton');
        component.selectGameMode();
        expect(endTurnButtonSpy).toHaveBeenCalled();
    });
});
