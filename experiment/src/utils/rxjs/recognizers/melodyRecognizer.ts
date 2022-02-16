import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';
import { scoreMelodyDTW } from './melodyScoring/scoreMelodyDTW';
import { ComprehensiveVocalState, defaultComprehensiveVocalState } from '../smoothPitch';
import { MelodyTaskTarget } from '../../../components/tasks/sing/target';
import { TaskType } from './universalRecognizer';
import { mod12 } from '../../math';

export interface Melody {
    intervals: number[];
    id: string;
}

export interface MelodyState extends Melody {
    score: number; // Higher score when good
}

interface Props {
    melodies: Melody[];
    startNote: number;
    keyNumber: number;
    // Function to score the melody with highest score for closest match (negatives allowed).
    // Defaults to DTW algorithm.
    scoreMelody?: (melodies: Melody[], intervals: number[]) => MelodyState[];
}

export interface MelodyRecognizerState extends ComprehensiveVocalState {
    recognized?: MelodyTaskTarget;
    progress: number;
    intervals: number[];
}

const getMelodyRecognizerInitialState = (melodies: Melody[]): MelodyRecognizerState => ({
    ...defaultComprehensiveVocalState,
    progress: 0,
    intervals: []
});

const sortMelodies = (melodies: MelodyState[]) => [...melodies].sort((melody1, melody2) => melody2.score - melody1.score);

export const melodyRecognizer = ({ melodies, startNote, keyNumber, scoreMelody }: Props) => (
    source$: Observable<ComprehensiveVocalState>
): Observable<MelodyRecognizerState> => {
    const startRelative = mod12(startNote - keyNumber);
    return source$.pipe(
        scan<ComprehensiveVocalState, MelodyRecognizerState>((state, curr) => {
            const progress = state.progress + 1;
            const intervals = [...state.intervals, curr.pitch.noteNum - startNote];
            const sortedMelodies = sortMelodies((scoreMelody || scoreMelodyDTW)(melodies, intervals));
            const recognized: MelodyTaskTarget = {
                type: TaskType.MELODY,
                value: sortedMelodies[0].intervals,
                id: sortedMelodies[0].id,
                startNote: startRelative
            };

            return {
                ...curr,
                recognized,
                progress,
                intervals
            };
        }, getMelodyRecognizerInitialState(melodies))
    );
};
