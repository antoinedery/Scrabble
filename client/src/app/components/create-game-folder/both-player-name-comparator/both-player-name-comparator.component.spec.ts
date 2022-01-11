import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { NameValidatorComponent } from '@app/components/create-game-folder/name-validator/name-validator.component';
import { BothPlayerNameComparatorComponent } from './both-player-name-comparator.component';

describe('BothPlayerNameComparatorComponent', () => {
    let component: BothPlayerNameComparatorComponent;
    let fixture: ComponentFixture<BothPlayerNameComparatorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule, FormsModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
            declarations: [BothPlayerNameComparatorComponent, NameValidatorComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BothPlayerNameComparatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
