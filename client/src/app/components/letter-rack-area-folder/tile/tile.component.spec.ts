import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ChangeLetterService } from '@app/services/change-letter.service';
import { SelectLetterService } from '@app/services/select-letter.service';
import { TileComponent } from './tile.component';

describe('TileComponent', () => {
    let component: TileComponent;
    let fixture: ComponentFixture<TileComponent>;
    let selectLetterService: SelectLetterService;
    let changeLetterService: ChangeLetterService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TileComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        selectLetterService = TestBed.inject(SelectLetterService);
        changeLetterService = TestBed.inject(ChangeLetterService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('decorateTileToChange should be called on right-click', () => {
        const tile = fixture.debugElement.query(By.css('.tile'));
        const decorateTileToChangeSpy = spyOn(component, 'decorateTileToChange');
        tile.triggerEventHandler('contextmenu', new MouseEvent('contextmenu'));
        expect(decorateTileToChangeSpy).toHaveBeenCalled();
    });

    it('decorateTileToChange function should call toggleChangeButtonVisibility', () => {
        const decorateTileToChangeSpy = spyOn(selectLetterService, 'toggleChangeButtonVisibility');
        const event = new MouseEvent('contextmenu');
        component.isSelectedToChange = false;
        component.decorateTileToChange(event);
        expect(decorateTileToChangeSpy).toHaveBeenCalled();
    });

    it('decorateTileToChange function should set isSelectedToMove to false when already selected to move', () => {
        const event = new MouseEvent('contextmenu');
        component.isSelectedToMove = true;
        component.decorateTileToChange(event);
        expect(component.isSelectedToMove).toBeFalse();
    });

    it('decorateTileToChange function should add letter-selected-change to classList when selected to change and remove it when unselected', () => {
        const event = new MouseEvent('contextmenu');
        component.isSelectedToChange = false;
        component.decorateTileToChange(event);
        const tile = fixture.debugElement.query(By.css('.tile'));
        expect(tile.nativeElement.classList).toContain('letter-selected-change');

        component.isSelectedToChange = true;
        component.decorateTileToChange(event);
        expect(tile.nativeElement.classList).not.toContain('letter-selected-change');
    });

    it('decorateTileToChange function should call unselectTileToChange', () => {
        const unselectTileSpy = spyOn(component, 'unselectTileToChange');
        const event = new MouseEvent('contextmenu');
        component.isSelectedToChange = true;
        component.decorateTileToChange(event);
        expect(unselectTileSpy).toHaveBeenCalled();
    });

    it('decorateTileToMove function should set isSelectedToChange to false when already selected to change', () => {
        component.isSelectedToChange = true;
        component.decorateTileToMove();
        expect(component.isSelectedToChange).toBeFalse();
    });

    it('decorateTileToMove function should add letter-selected-move to classList when selected to move and remove it when unselected', () => {
        component.isSelectedToMove = false;
        component.decorateTileToMove();
        const tile = fixture.debugElement.query(By.css('.tile'));
        expect(tile.nativeElement.classList).toContain('letter-selected-move');

        component.isSelectedToMove = true;
        component.decorateTileToMove();
        expect(tile.nativeElement.classList).not.toContain('letter-selected-move');
    });

    it('unselectTileToMove function should set isSelectedToMove to false and remove letter-selected-move from its classlist', () => {
        component.unselectTileToMove();
        expect(component.isSelectedToMove).toBeFalse();
        const tile = fixture.debugElement.query(By.css('.tile'));
        expect(tile.nativeElement.classList).not.toContain('letter-selected-change');
    });

    it('unselectTileToChange function should remove letter-selected-change from class list', () => {
        changeLetterService.lettersToChange.set(1, 'a');
        changeLetterService.lettersToChange.set(2, 'b');
        changeLetterService.lettersToChange.set(3, 'c');
        component.unselectTileToChange();
        const tile = fixture.debugElement.query(By.css('.tile'));
        expect(tile.nativeElement.classList).not.toContain('letter-selected-change');
    });
});
