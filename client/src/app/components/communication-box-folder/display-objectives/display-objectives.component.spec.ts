import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OBJECTIVES, OBJECTIVE_1, OBJECTIVE_2, OBJECTIVE_3, OBJECTIVE_4 } from '@app/classes/constants/constants';
import { Objective } from '@app/classes/interfaces/objectives';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { DisplayObjectivesComponent } from './display-objectives.component';

describe('DisplayObjectivesComponent', () => {
    let component: DisplayObjectivesComponent;
    let fixture: ComponentFixture<DisplayObjectivesComponent>;
    let playerSettingsService: PlayerSettingsService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DisplayObjectivesComponent],
            providers: [],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DisplayObjectivesComponent);
        component = fixture.componentInstance;
        playerSettingsService = TestBed.inject(PlayerSettingsService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('privatePlayerObjective should set the private player objectives into privatePlayerObjective when ngOnInit is called', () => {
        component.privatePlayerObjective = [];
        playerSettingsService.privateObjective.clear();
        playerSettingsService.privateObjective.set(OBJECTIVE_1, OBJECTIVES[0]);
        const expectedResult: Objective[] = [];
        expectedResult.push(OBJECTIVES[0]);
        component.ngOnInit();
        expect(component.privatePlayerObjective).toEqual(expectedResult);
    });

    it('privatePlayerObjective should set the public objectives into publicObjectives when ngOnInit is called', () => {
        component.publicObjectives = [];
        playerSettingsService.publicObjectives.clear();
        playerSettingsService.publicObjectives.set(OBJECTIVE_2, OBJECTIVES[1]);
        const expectedResult: Objective[] = [];
        expectedResult.push(OBJECTIVES[1]);
        component.ngOnInit();
        expect(component.publicObjectives).toEqual(expectedResult);
    });

    it('privatePlayerObjectiveObservable subscribe should set the private player objectives into privatePlayerObjective', () => {
        component.privatePlayerObjective = [];
        playerSettingsService.privateObjective.clear();
        playerSettingsService.privateObjective.set(OBJECTIVE_3, OBJECTIVES[2]);
        component.ngOnInit();
        playerSettingsService.privatePlayerObjectiveObservable.next(playerSettingsService.privateObjective);
        const expectedResult: Objective[] = [];
        expectedResult.push(OBJECTIVES[2]);
        expect(component.privatePlayerObjective).toEqual(expectedResult);
    });

    it('publicObjectivesObservable subscribe should set the private player objectives into privatePlayerObjective', () => {
        component.publicObjectives = [];
        playerSettingsService.publicObjectives.clear();
        playerSettingsService.publicObjectives.set(OBJECTIVE_4, OBJECTIVES[3]);
        component.ngOnInit();
        playerSettingsService.publicObjectivesObservable.next(playerSettingsService.publicObjectives);
        const expectedResult: Objective[] = [];
        expectedResult.push(OBJECTIVES[3]);
        expect(component.publicObjectives).toEqual(expectedResult);
    });
});
