import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';
import { ComprehensiveVocalState, defaultComprehensiveVocalState } from '../smoothPitch';
import { PitchTaskTarget } from '../../../components/tasks/sing/target';
import { TaskType } from './universalRecognizer';
import { mod12 } from '../../math';

interface Props {
    sustainLength: number;
    keyNumber: number;
}

interface Recognized extends PitchTaskTarget {
    noteAbs: number;
}

export interface PitchRecognizerState extends ComprehensiveVocalState {
    recognized?: Recognized; // NOTE: this IS adjusted for the key and mod-12ed.
    progress: number;
}

export const pitchRecognizerInitialState: PitchRecognizerState = {
    ...defaultComprehensiveVocalState,
    progress: 0
};

export const pitchRecognizer = ({ sustainLength, keyNumber }: Props) => (
    source: Observable<ComprehensiveVocalState>
): Observable<PitchRecognizerState> => {
    return source.pipe(
        scan<ComprehensiveVocalState, PitchRecognizerState>((state, curr) => {
            const progress = state.pitch.noteNum === curr.pitch.noteNum ? state.progress + 1 : 0;
            // If we exceeded the progress threshold, recognize the pitch. Else, keep previous recognition.
            // Change state.recognized to undefined if we want to erase the old recognition.
            const recognized: Recognized | undefined =
                progress >= sustainLength
                    ? { type: TaskType.PITCH, value: mod12(curr.pitch.noteNum - keyNumber), noteAbs: curr.pitch.noteNum }
                    : state.recognized;
            return {
                ...curr,
                recognized,
                progress
            };
        }, pitchRecognizerInitialState)
    );
};
