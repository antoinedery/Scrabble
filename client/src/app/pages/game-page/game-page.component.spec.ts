import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { DatabaseErrorComponent } from '@app/components/admin-mode-folder/database-error/database-error.component';
import { CommunicationBoxComponent } from '@app/components/communication-box-folder/communication-box/communication-box.component';
import { DisplayChatComponent } from '@app/components/communication-box-folder/display-chat/display-chat.component';
import { DisplayObjectivesComponent } from '@app/components/communication-box-folder/display-objectives/display-objectives.component';
import { InputChatComponent } from '@app/components/communication-box-folder/input-chat/input-chat.component';
import { CountdownTimerComponent } from '@app/components/informative-panel-folder/countdown-timer/countdown-timer.component';
import { EndGameComponent } from '@app/components/informative-panel-folder/end-game/end-game.component';
import { InformativePanelComponent } from '@app/components/informative-panel-folder/informative-panel/informative-panel.component';
import { PlayersInformationComponent } from '@app/components/informative-panel-folder/players-information/players-information.component';
import { QuitModalComponent } from '@app/components/informative-panel-folder/quit-modal/quit-modal.component';
import { ZoomSliderComponent } from '@app/components/informative-panel-folder/zoom-slider/zoom-slider.component';
import { LetterRackAreaComponent } from '@app/components/letter-rack-area-folder/letter-rack-area/letter-rack-area.component';
import { LetterRackComponent } from '@app/components/letter-rack-area-folder/letter-rack/letter-rack.component';
import { TileComponent } from '@app/components/letter-rack-area-folder/tile/tile.component';
import { PlayAreaComponent } from '@app/components/play-area-folder/play-area/play-area.component';
import { PlayerDisconnectionComponent } from '@app/components/play-area-folder/player-disconnection/player-disconnection.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameManagerService } from '@app/services/game-manager.service';
import { of } from 'rxjs';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                GamePageComponent,
                PlayAreaComponent,
                CountdownTimerComponent,
                LetterRackAreaComponent,
                LetterRackComponent,
                TileComponent,
                InformativePanelComponent,
                PlayersInformationComponent,
                CountdownTimerComponent,
                QuitModalComponent,
                ZoomSliderComponent,
                CommunicationBoxComponent,
                DisplayChatComponent,
                InputChatComponent,
                EndGameComponent,
                DatabaseErrorComponent,
                DisplayObjectivesComponent,
                PlayerDisconnectionComponent,
            ],
            imports: [
                MatSnackBarModule,
                MatDialogModule,
                MatSliderModule,
                FormsModule,
                RouterTestingModule.withRoutes([{ path: 'home', redirectTo: '' }]),
            ],

            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onPopState should set isGameInitialize to false', () => {
        const clientSocketService = TestBed.inject(ClientSocketService);
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        const dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        clientSocketService.connectedServerObservable.next();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('onPopState should set isGameInitialize to false', () => {
        const gameManagerService = TestBed.inject(GameManagerService);
        const leaveGameSpy = spyOn(gameManagerService, 'leaveGame');
        component.onPopState();
        expect(leaveGameSpy).toHaveBeenCalled();
    });
});
