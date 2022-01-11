import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { MouseEventReceiver } from '@app/classes/enums/mouse-event-receiver';
import { CommunicationBoxComponent } from '@app/components/communication-box-folder/communication-box/communication-box.component';
import { DisplayChatComponent } from '@app/components/communication-box-folder/display-chat/display-chat.component';
import { DisplayObjectivesComponent } from '@app/components/communication-box-folder/display-objectives/display-objectives.component';
import { InputChatComponent } from '@app/components/communication-box-folder/input-chat/input-chat.component';
import { MouseEventHandlerService } from '@app/services/mouse-event-handler.service';

describe('CommunicationBoxComponent', () => {
    let component: CommunicationBoxComponent;
    let fixture: ComponentFixture<CommunicationBoxComponent>;
    let mouseEventHandlerService: MouseEventHandlerService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, FormsModule, MatDialogModule],
            declarations: [CommunicationBoxComponent, DisplayChatComponent, InputChatComponent, DisplayObjectivesComponent],
            providers: [MouseEventHandlerService, { provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        mouseEventHandlerService = TestBed.inject(MouseEventHandlerService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('setMouseEventReceiverOnFocusIn should assign CommunicationBox as mouse event receiver when mouse enters in communication box', () => {
        component.setMouseEventReceiverOnFocusIn();
        expect(mouseEventHandlerService.currentMouseEventReceiver).toEqual(MouseEventReceiver.CommunicationBox);
    });

    it('setMouseEventReceiverOnFocusOut should assign None as mouse event receiver when mouse leaves in communication box', () => {
        component.setMouseEventReceiverOnFocusOut();
        expect(mouseEventHandlerService.currentMouseEventReceiver).toEqual(MouseEventReceiver.LetterRack);
    });
});
