import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GameModeComponent } from '@app/components/create-game-folder/game-mode/game-mode.component';
import { NameValidatorComponent } from '@app/components/create-game-folder/name-validator/name-validator.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { of } from 'rxjs';

describe('HomePageComponent', () => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
    let component: HomePageComponent;
    let fixture: ComponentFixture<HomePageComponent>;
    let dialogSpy: jasmine.Spy;
    let clientSocketService: ClientSocketService;
    let selectGameModeService: SelectGameModeService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule, HttpClientModule, FormsModule, MatCardModule, BrowserAnimationsModule],
            declarations: [HomePageComponent, GameModeComponent, NameValidatorComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HomePageComponent);
        selectGameModeService = TestBed.inject(SelectGameModeService);
        component = fixture.componentInstance;
        fixture.detectChanges();
        clientSocketService = TestBed.inject(ClientSocketService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openDialog should call open', () => {
        dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        component.openDialog();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('launchScore should open dialog and call updateScoreList twice ', () => {
        dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        const updateScoreListSpy = spyOn(clientSocketService, 'updateScoreList');
        component.launchScore();
        expect(updateScoreListSpy).toHaveBeenCalledTimes(2);
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('classicModeChosen should set isLOG2990ModeChosen to false', () => {
        selectGameModeService.isLOG2990ModeChosen = true;
        component.classicModeChosen();
        expect(selectGameModeService.isLOG2990ModeChosen).toBeFalse();
    });

    it('lOG2990ModeChosen should set isLOG2990ModeChosen to true', () => {
        selectGameModeService.isLOG2990ModeChosen = false;
        component.lOG2990ModeChosen();
        expect(selectGameModeService.isLOG2990ModeChosen).toBeTrue();
    });
});
