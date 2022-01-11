import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { InputChatService } from '@app/services/input-chat.service';
import { InputChatComponent } from './input-chat.component';

describe('InputChatComponent', () => {
    let inputChatService: InputChatService;
    let component: InputChatComponent;
    let fixture: ComponentFixture<InputChatComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InputChatComponent],
            imports: [FormsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        inputChatService = TestBed.inject(InputChatService);
        fixture = TestBed.createComponent(InputChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('sendMessage should call verifyMessageLength', () => {
        const test = spyOn(inputChatService, 'validateInputLength');
        component.sendMessage();
        expect(test).toHaveBeenCalled();
    });
});
