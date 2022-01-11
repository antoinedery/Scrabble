import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { NameValidatorService } from '@app/services/name-validator.service';
import { NameValidatorComponent } from './name-validator.component';

describe('NameValidatorComponent', () => {
    let component: NameValidatorComponent;
    let fixture: ComponentFixture<NameValidatorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule, FormsModule],
            declarations: [NameValidatorComponent],
            providers: [NameValidatorComponent, { provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NameValidatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('showPlayerNameCriteria function should be called when input box is clicked', () => {
        spyOn(component, 'showPlayerNameCriteria');
        const input = fixture.debugElement.nativeElement.querySelector('input');
        input.click();
        expect(component.showPlayerNameCriteria).toHaveBeenCalled();
    });

    it('showPlayerNameCriteria function should display block the name criteria called', () => {
        component.showPlayerNameCriteria();
        expect(component.nameCriteria.nativeElement.style.display).toBe('block');
    });

    it('showPlayerNameCriteria function should display none the name criteria when name is valid', () => {
        const nameValidatorService = TestBed.inject(NameValidatorService);
        nameValidatorService.playerNameIsValid = true;
        component.showPlayerNameCriteria();
        expect(component.nameCriteria.nativeElement.style.display).toBe('none');
    });

    it('sendPlayerNameToParent should emit', fakeAsync(() => {
        spyOn(component.playerNameOutput, 'emit');
        component.sendPlayerNameToParent();
        expect(component.playerNameOutput.emit).toHaveBeenCalled();
    }));
});
