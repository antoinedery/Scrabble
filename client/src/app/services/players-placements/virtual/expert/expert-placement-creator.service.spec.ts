import { TestBed } from '@angular/core/testing';
import { AXIS } from '@app/classes/enums/axis';
import { ExpertPlacementCreatorService } from './expert-placement-creator.service';

describe('ExpertPlacementCreatorService', () => {
    let service: ExpertPlacementCreatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ExpertPlacementCreatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('compareScore should return correct value for compared total scores of scored placements', () => {
        expect(
            service.compareScore(
                {
                    placement: {
                        axis: AXIS.HORIZONTAL,
                        letters: [],
                    },
                    words: [],
                    totalScore: 1,
                },
                {
                    placement: {
                        axis: AXIS.HORIZONTAL,
                        letters: [],
                    },
                    words: [],
                    totalScore: 2,
                },
            ),
        ).toEqual(1);
    });

    it('selectPlacement should splice first value of potentialPlacmeents', () => {
        const scoredPlacement = {
            placement: {
                axis: AXIS.HORIZONTAL,
                letters: [],
            },
            words: [],
            totalScore: 1,
        };
        spyOn(service.potentialPlacements, 'splice').and.returnValue([scoredPlacement]);
        service.selectPlacement();
        expect(service.selectPlacement()).toEqual(scoredPlacement);
    });

    it('addPlacementIfPredicateIsRespected should return false if length of potential placements is lower than 4', () => {
        expect(
            service.addPlacementIfPredicateIsRespected({
                placement: {
                    axis: AXIS.HORIZONTAL,
                    letters: [],
                },
                words: [],
                totalScore: 2,
            }),
        ).toBeFalse();
        expect(
            service.addPlacementIfPredicateIsRespected({
                placement: {
                    axis: AXIS.HORIZONTAL,
                    letters: [],
                },
                words: [],
                totalScore: 1,
            }),
        ).toBeFalse();
        expect(
            service.addPlacementIfPredicateIsRespected({
                placement: {
                    axis: AXIS.HORIZONTAL,
                    letters: [],
                },
                words: [],
                totalScore: 3,
            }),
        ).toBeFalse();
        expect(
            service.addPlacementIfPredicateIsRespected({
                placement: {
                    axis: AXIS.HORIZONTAL,
                    letters: [],
                },
                words: [],
                totalScore: 4,
            }),
        ).toBeFalse();
        expect(
            service.addPlacementIfPredicateIsRespected({
                placement: {
                    axis: AXIS.HORIZONTAL,
                    letters: [],
                },
                words: [],
                totalScore: 5,
            }),
        ).toBeFalse();
        expect(
            service.addPlacementIfPredicateIsRespected({
                placement: {
                    axis: AXIS.HORIZONTAL,
                    letters: [],
                },
                words: [],
                totalScore: 2,
            }),
        ).toBeFalse();
    });
});
