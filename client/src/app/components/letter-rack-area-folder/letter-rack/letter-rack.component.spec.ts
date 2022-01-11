import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { MouseEventReceiver } from '@app/classes/enums/mouse-event-receiver';
import { LetterRackComponent } from '@app/components/letter-rack-area-folder/letter-rack/letter-rack.component';
import { TileComponent } from '@app/components/letter-rack-area-folder/tile/tile.component';
import { ChangeLetterService } from '@app/services/change-letter.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DisplayMessageService } from '@app/services/display-message.service';
import { GameManagerService } from '@app/services/game-manager.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { MouseEventHandlerService } from '@app/services/mouse-event-handler.service';
import { MoveLetterService } from '@app/services/move-letter.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { SelectLetterService } from '@app/services/select-letter.service';

describe('LetterRackComponent', () => {
    let component: LetterRackComponent;
    let fixture: ComponentFixture<LetterRackComponent>;
    let letterReserveService: LetterReserveService;
    let gameManagerService: GameManagerService;
    let selectLetterService: SelectLetterService;
    let changeLetterService: ChangeLetterService;
    let moveLetterService: MoveLetterService;
    let mouseEventHandlerService: MouseEventHandlerService;
    let selectGameModeService: SelectGameModeService;
    let clientSocketService: ClientSocketService;
    let playerSettingsService: PlayerSettingsService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LetterRackComponent, TileComponent],
            imports: [RouterTestingModule, MatDialogModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LetterRackComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        gameManagerService = TestBed.inject(GameManagerService);
        selectLetterService = TestBed.inject(SelectLetterService);
        letterReserveService = TestBed.inject(LetterReserveService);
        changeLetterService = TestBed.inject(ChangeLetterService);
        moveLetterService = TestBed.inject(MoveLetterService);
        playerSettingsService = TestBed.inject(PlayerSettingsService);
        mouseEventHandlerService = TestBed.inject(MouseEventHandlerService);
        selectGameModeService = TestBed.inject(SelectGameModeService);
        clientSocketService = TestBed.inject(ClientSocketService);

        const letterRackDiv = fixture.debugElement.query(By.css('#letter-rack')).nativeElement;
        letterRackDiv.click();

        component.lettersList = letterReserveService.assignLettersToPlayer();
        playerSettingsService.letters = component.lettersList;
        fixture.detectChanges();
        const tileComponent = fixture.debugElement.queryAll(By.css('app-tile'));
        const components = tileComponent.map((tile) => tile.componentInstance);
        fixture.componentInstance.tilesComponents.reset(components);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('array size should be 7 when created', () => {
        const expectedArraySize = 7;
        gameManagerService.selectFirstPlayerToPlay();
        expect(component.lettersList.length).toBe(expectedArraySize);
    });

    it('showButtons boolean should be updated through subscribe', () => {
        selectLetterService.changeLetterButtonIsShownObs.next(true);
        expect(component.showButtons).toBeTrue();
        selectLetterService.changeLetterButtonIsShownObs.next(false);
        expect(component.showButtons).toBeFalse();
    });

    it('selectGameMode function should call changeLettersSolo while in solo mode', () => {
        selectGameModeService.isSoloModeChosen = true;
        const changeLettersSoloSpy = spyOn(component, 'changeLettersSolo');
        component.selectGameMode();
        expect(changeLettersSoloSpy).toHaveBeenCalled();
    });

    it('lettersChange should be updated from subscribe', () => {
        playerSettingsService.lettersChange.next([{ letter: 'A', score: 1 }]);
        expect(component.lettersList).toEqual([{ letter: 'A', score: 1 }]);
    });

    it('selectGameMode function should call exchangeLettersUsingMouseSelection while not in solo mode', () => {
        selectGameModeService.isSoloModeChosen = false;
        const changeLetterMultiSpy = spyOn(component, 'changeLetterMulti');
        component.selectGameMode();
        expect(changeLetterMultiSpy).toHaveBeenCalled();
    });

    it('changeLettersSolo function should call validateLetterChange from changeLetterService', () => {
        letterReserveService.createReserve();
        const validateLetterChangeSpy = spyOn(changeLetterService, 'validateLetterChange');
        component.changeLettersSolo();
        expect(validateLetterChangeSpy).toHaveBeenCalled();
    });

    it('changeLettersSolo function should hide change letter buttons', () => {
        letterReserveService.createReserve();
        component.changeLettersSolo();
        expect(component.showButtons).toBeFalse();
    });

    it('cancelSelection should not be called when there is a click inside letter rack', () => {
        const cancelAllSelectionsSpy = spyOn(component, 'cancelAllSelections');
        expect(cancelAllSelectionsSpy).not.toHaveBeenCalled();
    });

    it('component should have 7 app-tile components as ViewChildren', () => {
        component.lettersList = letterReserveService.assignLettersToPlayer();
        fixture.detectChanges();
        const tileComponent = fixture.debugElement.queryAll(By.css('app-tile'));
        const components = tileComponent.map((tile) => tile.componentInstance);
        fixture.componentInstance.tilesComponents.reset(components);
        expect(tileComponent.length).toBe(LETTERS_RACK_SIZE);
    });

    it('cancelSelection should be called when there is a click outside letter rack', () => {
        const cancelAllSelectionsSpy = spyOn(component, 'cancelAllSelections');
        window.dispatchEvent(new MouseEvent('click'));
        expect(cancelAllSelectionsSpy).toHaveBeenCalled();
    });

    it('selectLetterFromKeyboardEvent should return undefined if MouseEventReceiver is on game board', () => {
        mouseEventHandlerService.currentMouseEventReceiver = MouseEventReceiver.Board;
        const buttonEvent = {
            key: component.lettersList[0].letter,
        } as KeyboardEvent;
        expect(component.selectLetterFromKeyboard(buttonEvent)).toBeUndefined();
    });

    it('selectLetterFromKeyboardEvent should call cancelAllSelection and findSelectedLetterIndex when letter (A to Z) is pressed on keyboard', () => {
        const cancelAllSelectionsSpy = spyOn(component, 'cancelSelectionsToChange');
        const findSelectedLetterIndexSpy = spyOn(component, 'findSelectedLetterIndex');
        const buttonEvent = {
            key: component.lettersList[0].letter,
        } as KeyboardEvent;
        component.selectLetterFromKeyboard(buttonEvent);
        expect(cancelAllSelectionsSpy).toHaveBeenCalled();
        expect(findSelectedLetterIndexSpy).toHaveBeenCalled();
    });

    it('selectLetterFromKeyboardEvent should call cancel selection and findSelectedLetterIndex when blank letter is pressed on keyboard', () => {
        const cancelSelectionSpy = spyOn(component, 'cancelSelectionsToChange');
        const findSelectedLetterIndexSpy = spyOn(component, 'findSelectedLetterIndex');
        component.lettersList[0] = { letter: '*', score: 0 };
        const buttonEvent = {
            key: component.lettersList[0].letter,
        } as KeyboardEvent;
        component.selectLetterFromKeyboard(buttonEvent);
        expect(cancelSelectionSpy).toHaveBeenCalled();
        expect(findSelectedLetterIndexSpy).toHaveBeenCalled();
    });

    it('selectLetterFromKeyboardEvent should call moveLetterFromKeyboardEvent when left arrow is pressed', () => {
        component.tilesComponents.toArray()[1].isSelectedToMove = true;
        const moveLetterFromKeyboardEventSpy = spyOn(moveLetterService, 'moveLetterFromKeyboardEvent');
        const buttonEvent = {
            key: 'ArrowLeft',
        } as KeyboardEvent;
        component.selectLetterFromKeyboard(buttonEvent);
        expect(moveLetterFromKeyboardEventSpy).toHaveBeenCalled();
    });

    it('selectLetterFromKeyboardEvent should call moveLetterFromKeyboardEvent when right arrow is pressed', () => {
        component.tilesComponents.toArray()[1].isSelectedToMove = true;
        const moveLetterFromKeyboardEventSpy = spyOn(moveLetterService, 'moveLetterFromKeyboardEvent');
        const buttonEvent = {
            key: 'ArrowRight',
        } as KeyboardEvent;
        component.selectLetterFromKeyboard(buttonEvent);
        expect(moveLetterFromKeyboardEventSpy).toHaveBeenCalled();
    });

    it('moveLetterFromMouseWheel function should call cancelSelectionsToChange when a letter is selected to change', () => {
        const cancelSelectionsToChangeSpy = spyOn(component, 'cancelSelectionsToChange');
        const tile0 = fixture.debugElement.query(By.css('#letter0')).nativeElement;
        tile0.click();
        component.tilesComponents.toArray()[0].isSelectedToMove = true;
        const tile1 = fixture.debugElement.query(By.css('#letter1'));
        tile1.triggerEventHandler('contextmenu', new MouseEvent('contextmenu'));
        mouseEventHandlerService.currentMouseEventReceiver = MouseEventReceiver.LetterRack;
        const wheelEvent = {
            deltaY: 1,
        } as WheelEvent;
        component.moveLetterFromMouseWheel(wheelEvent);
        fixture.detectChanges();
        expect(cancelSelectionsToChangeSpy).toHaveBeenCalled();
    });

    it('moveLetterFromMouseWheel function should return undefined if MouseEventReceiver is not on letter rack', () => {
        const tile0 = fixture.debugElement.query(By.css('#letter0')).nativeElement;
        tile0.click();
        component.tilesComponents.toArray()[0].isSelectedToMove = true;
        const tile1 = fixture.debugElement.query(By.css('#letter1'));
        tile1.triggerEventHandler('contextmenu', new MouseEvent('contextmenu'));
        mouseEventHandlerService.currentMouseEventReceiver = MouseEventReceiver.LetterRack;
        const wheelEvent = {
            deltaY: 1,
        } as WheelEvent;
        mouseEventHandlerService.currentMouseEventReceiver = MouseEventReceiver.CommunicationBox;
        expect(component.moveLetterFromMouseWheel(wheelEvent)).toBeUndefined();
    });

    it('cancelSelection function should call unselectTile from TileComponent', () => {
        const tileArray = component.tilesComponents.toArray();
        const tileSpy = spyOn(tileArray[0], 'unselectTileToChange');
        component.cancelAllSelections();
        expect(tileSpy).toHaveBeenCalled();
    });

    it('findSelectedLetterIndex should call unselectedTile', () => {
        const unselectTileToMoveSpy = spyOn(component.tilesComponents.toArray()[1], 'unselectTileToMove');
        component.findSelectedLetterIndex(component.tilesComponents.toArray()[1].letter);
        expect(unselectTileToMoveSpy).toHaveBeenCalled();
    });

    it('findSelectedLetterIndex should unselected tile', () => {
        const unselectTileToMoveSpy = spyOn(component.tilesComponents.toArray()[0], 'unselectTileToMove');
        component.tilesComponents.toArray()[0].isSelectedToMove = true;
        component.findSelectedLetterIndex(component.tilesComponents.toArray()[0].letter);
        expect(unselectTileToMoveSpy).toHaveBeenCalled();
    });

    it('changeLetterMulti should call exchangeLettersUsingMouseSelection', () => {
        const exchangeLettersUsingMouseSelectionSpy = spyOn(clientSocketService, 'exchangeLettersUsingMouseSelection');
        selectGameModeService.isOnlinePlayerTurn = true;
        component.changeLetterMulti();
        expect(exchangeLettersUsingMouseSelectionSpy).toHaveBeenCalled();
    });

    it('changeLetterMulti should call exchangeLettersUsingMouseSelection', () => {
        const displayMessageService = TestBed.inject(DisplayMessageService);
        const addMessageSpy = spyOn(displayMessageService, 'addMessageList');
        selectGameModeService.isOnlinePlayerTurn = false;
        component.changeLetterMulti();
        expect(addMessageSpy).toHaveBeenCalled();
    });

    it('findSelectedLetterIndex should call unselectTile when last letter of rack', () => {
        const unselectTileToMoveSpy = spyOn(component.tilesComponents.toArray()[6], 'unselectTileToMove');
        component.tilesComponents.toArray()[6].isSelectedToMove = true;
        component.findSelectedLetterIndex(component.tilesComponents.toArray()[6].letter);
        expect(unselectTileToMoveSpy).toHaveBeenCalled();
    });

    it('selectLetterNextOccurence should set selected letter index to -1', () => {
        component.coveredLetterCounter = 0;
        component.selectedLetterIndex = 5;
        component.tilesComponents.toArray()[6].letter = 'a';
        component.selectLetterNextOccurrence('');
        const expectedResult = -1;
        expect(component.selectedLetterIndex).toEqual(expectedResult);
    });
});
