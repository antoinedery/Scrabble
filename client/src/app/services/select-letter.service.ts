import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SelectLetterService {
    changeLetterButtonIsShownObs: Subject<boolean> = new Subject();

    toggleChangeButtonVisibility(isVisible: boolean): void {
        this.changeLetterButtonIsShownObs.next(isVisible);
    }
}
