import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';
import { ComprehensiveVocalState, defaultComprehensiveVocalState } from '../smoothPitch';
import { IntervalTaskTarget } from '../../../components/tasks/sing/target';
import { TaskType } from './universalRecognizer';
import { mod12 } from '../../math';

interface Props {
    sustainLength: number;
    keyNumber: number;
    startNote: number; // Should not be mod12ed or adjusted for key
}

export interface IntervalRecognizerState extends ComprehensiveVocalState {
    recognized?: IntervalTaskTarget; // NOTE: this IS adjusted for the key and mod-12ed.
    progress: number;
}

export const intervalRecognizerInitialState: IntervalRecognizerState = {
    ...defaultComprehensiveVocalState,
    progress: 0
};

export const intervalRecognizer = ({ startNote, sustainLength, keyNumber }: Props) => (
    source$: Observable<ComprehensiveVocalState>
): Observable<IntervalRecognizerState> => {
    // Get the start relative to the key
    const startRelative = mod12(startNote - keyNumber);
    return source$.pipe(
        scan<ComprehensiveVocalState, IntervalRecognizerState>((state, curr) => {
            const progress = state.pitch.noteNum === curr.pitch.noteNum ? state.progress + 1 : 0;
            const recognized: IntervalTaskTarget | undefined = state.recognized
                ? progress >= sustainLength
                    ? { type: TaskType.INTERVAL, value: curr.pitch.noteNum - startNote, startNote: startRelative }
                    : state.recognized
                : { type: TaskType.INTERVAL, value: curr.pitch.noteNum - startNote, startNote: startRelative };
            return {
                ...curr,
                recognized,
                progress
            };
        }, intervalRecognizerInitialState)
    );
};
