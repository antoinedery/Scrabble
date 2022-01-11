import { TestBed } from '@angular/core/testing';
import { AXIS } from '@app/classes/enums/axis';
import { Placement, ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { DebugCommandService } from '@app/services/debug-command.service';
import { DisplayMessageService } from '@app/services/display-message.service';

const sevenLettersPlacement: Placement = {
    axis: AXIS.HORIZONTAL,
    letters: [
        { content: 'e', position: { x: 7, y: 13 } },
        { content: 'n', position: { x: 8, y: 13 } },
        { content: 'v', position: { x: 9, y: 13 } },
        { content: 'i', position: { x: 10, y: 13 } },
        { content: 'r', position: { x: 11, y: 13 } },
        { content: 'o', position: { x: 12, y: 13 } },
        { content: 'n', position: { x: 13, y: 13 } },
    ],
};

const scoredPlacement: ScoredPlacement = {
    placement: sevenLettersPlacement,
    words: [
        {
            word: {
                axis: AXIS.HORIZONTAL,
                origin: { x: 7, y: 13 },
                content: 'environ',
            },
            score: 10,
        },
        {
            word: {
                axis: AXIS.VERTICAL,
                origin: { x: 7, y: 12 },
                content: 'le',
            },
            score: 2,
        },
    ],
    totalScore: 62,
};

describe('DebugCommandService', () => {
    let service: DebugCommandService;
    let displayMessageService: DisplayMessageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DebugCommandService);
        displayMessageService = TestBed.inject(DisplayMessageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('displayVirtualPlayerWords should all letters placed', () => {
        displayMessageService.messagesList = [];
        const expectedOutput = 'N8:E  N9:N  N10:V  N11:I  N12:R  N13:O  N14:N  (62)';
        service.displayVirtualPlayerWords(scoredPlacement);
        expect(displayMessageService.messagesList[0].text).toEqual(expectedOutput);
    });

    it('displayVirtualPlayerWords should print bingo when 7 letters are placed', () => {
        displayMessageService.messagesList = [];
        const expectedOutput = 'Bingo! (50)';
        service.displayVirtualPlayerWords(scoredPlacement);
        expect(displayMessageService.messagesList[3].text).toEqual(expectedOutput);
    });
});
