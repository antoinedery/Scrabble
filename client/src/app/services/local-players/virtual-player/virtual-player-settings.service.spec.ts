// Angular API
import { TestBed } from '@angular/core/testing';
import { OBJECTIVES, OBJECTIVE_4, OBJECTIVE_7, RANDOM_NUMBER_GENERATOR } from '@app/classes/constants/constants';
import { PlayerInfos } from '@app/classes/interfaces/multi-player-game-infos';
import { Objective } from '@app/classes/interfaces/objectives';
// Service
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';

describe('VirtualPlayerSettingsService', () => {
    let service: VirtualPlayerSettingsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(VirtualPlayerSettingsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getVirtualPlayerRack should return the letters as string', () => {
        service.letters = [
            { letter: 'A', score: 1 },
            { letter: '*', score: 0 },
        ];
        expect(service.getVirtualPlayerRack()).toEqual(['A', 'A']);
    });

    it('assignPrivateObjectiveToVirtualPlayer should add to map 1 random objective among the 8 ones other than the one passed in parameter', () => {
        const alreadyTakenNumber: number[] = [OBJECTIVE_4];
        spyOn(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER').and.returnValues(OBJECTIVE_4, OBJECTIVE_7);
        const expectedMap: Map<number, Objective> = new Map();
        expectedMap.set(OBJECTIVE_7, OBJECTIVES[OBJECTIVE_7 - 1]);
        const result = service.assignPrivateObjectiveToVirtualPlayer(alreadyTakenNumber);
        expect(result[0]).not.toEqual(result[1]);
        expect(service.privateObjective).toEqual(expectedMap);
    });

    it('setPropertiesForGameConversion assign letters, score and hasToPlay correctly', () => {
        const playerInfos: PlayerInfos = {
            name: 'name',
            letterRack: [{ letter: 'A', score: 1 }],
            playerScore: 1,
            isMyTurn: false,
            privateObjective:
                '[[8,{"description":"Créer un mot qui rapporte plus de 8 points pendant 3 tours consécutifs","score":30,"fullfilled":false}]]',
        };
        service.setPropertiesForGameConversion(playerInfos);
        expect(service.letters).toEqual([{ letter: 'A', score: 1 }]);
        expect(service.score).toEqual(1);
        expect(service.hasToPlay).toEqual(false);
    });
});
