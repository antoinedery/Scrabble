import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommunicationBoxComponent } from '@app/components/communication-box-folder/communication-box/communication-box.component';
import { DisplayChatComponent } from '@app/components/communication-box-folder/display-chat/display-chat.component';
import { InputChatComponent } from '@app/components/communication-box-folder/input-chat/input-chat.component';
import { GameModeComponent } from '@app/components/create-game-folder/game-mode/game-mode.component';
import { GameSettingsComponent } from '@app/components/create-game-folder/game-settings/game-settings.component';
import { StepperModalComponent } from '@app/components/create-game-folder/stepper-modal/stepper-modal.component';
import { VirtualPlayerSettingsComponent } from '@app/components/create-game-folder/virtual-player-settings/virtual-player-settings.component';
import { WaitingRoomComponent } from '@app/components/create-game-folder/waiting-room/waiting-room.component';
import { CountdownTimerComponent } from '@app/components/informative-panel-folder/countdown-timer/countdown-timer.component';
import { EndGameComponent } from '@app/components/informative-panel-folder/end-game/end-game.component';
import { InformativePanelComponent } from '@app/components/informative-panel-folder/informative-panel/informative-panel.component';
import { QuitModalComponent } from '@app/components/informative-panel-folder/quit-modal/quit-modal.component';
import { ZoomSliderComponent } from '@app/components/informative-panel-folder/zoom-slider/zoom-slider.component';
import { LetterRackAreaComponent } from '@app/components/letter-rack-area-folder/letter-rack-area/letter-rack-area.component';
import { LetterRackComponent } from '@app/components/letter-rack-area-folder/letter-rack/letter-rack.component';
import { TileComponent } from '@app/components/letter-rack-area-folder/tile/tile.component';
import { PlayAreaComponent } from '@app/components/play-area-folder/play-area/play-area.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
// Pages components
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { DatabaseErrorComponent } from './components/admin-mode-folder/database-error/database-error.component';
import { DictionaryDisplayComponent } from './components/admin-mode-folder/dictionary-display/dictionary-display.component';
import { DictionaryManagerComponent } from './components/admin-mode-folder/dictionary-manager/dictionary-manager.component';
import { DictionaryUploadModalComponent } from './components/admin-mode-folder/dictionary-upload-modal/dictionary-upload-modal.component';
import { OfflineServerModalComponent } from './components/admin-mode-folder/offline-server-modal/offline-server-modal.component';
import { ResetDataComponent } from './components/admin-mode-folder/reset-data/reset-data.component';
import { ResetModalComponent } from './components/admin-mode-folder/reset-modal/reset-modal.component';
import { SideNavComponent } from './components/admin-mode-folder/side-nav/side-nav.component';
import { VirtualPlayerCreatorComponent } from './components/admin-mode-folder/virtual-player-creator/virtual-player-creator.component';
import { VirtualPlayerDisplayComponent } from './components/admin-mode-folder/virtual-player-display/virtual-player-display.component';
import { VirtualPlayerManagerComponent } from './components/admin-mode-folder/virtual-player-manager/virtual-player-manager.component';
import { DisplayObjectivesComponent } from './components/communication-box-folder/display-objectives/display-objectives.component';
import { BothPlayerNameComparatorComponent } from './components/create-game-folder/both-player-name-comparator/both-player-name-comparator.component';
import { FindGamesComponent } from './components/create-game-folder/find-games/find-games.component';
import { NameValidatorComponent } from './components/create-game-folder/name-validator/name-validator.component';
import { WaitingPlayerComponent } from './components/create-game-folder/waiting-player/waiting-player.component';
import { PlayersInformationComponent } from './components/informative-panel-folder/players-information/players-information.component';
import { PlayerDisconnectionComponent } from './components/play-area-folder/player-disconnection/player-disconnection.component';
import { ScoreModalComponent } from './components/score-modal/score-modal.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        HomePageComponent,
        PlayAreaComponent,
        CommunicationBoxComponent,
        GameModeComponent,
        GameSettingsComponent,
        StepperModalComponent,
        VirtualPlayerSettingsComponent,
        InformativePanelComponent,
        LetterRackComponent,
        InputChatComponent,
        DisplayChatComponent,
        TileComponent,
        CountdownTimerComponent,
        QuitModalComponent,
        ZoomSliderComponent,
        LetterRackAreaComponent,
        EndGameComponent,
        FindGamesComponent,
        WaitingPlayerComponent,
        WaitingRoomComponent,
        BothPlayerNameComparatorComponent,
        // SettingsComponent,
        NameValidatorComponent,
        PlayersInformationComponent,
        ScoreModalComponent,
        AdminPageComponent,
        DictionaryManagerComponent,
        VirtualPlayerManagerComponent,
        ResetDataComponent,
        SideNavComponent,
        DictionaryDisplayComponent,
        VirtualPlayerDisplayComponent,
        VirtualPlayerCreatorComponent,
        ResetModalComponent,
        DictionaryUploadModalComponent,
        OfflineServerModalComponent,
        DisplayObjectivesComponent,
        DatabaseErrorComponent,
        PlayerDisconnectionComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatSliderModule,
        FormsModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        ReactiveFormsModule,
        MatMenuModule,
        MatDialogModule,
        MatSnackBarModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
