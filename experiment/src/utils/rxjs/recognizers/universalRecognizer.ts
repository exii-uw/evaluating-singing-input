import { Observable, Subject } from 'rxjs';
import { intervalRecognizer, IntervalRecognizerState } from './intervalRecognizer';
import { pitchRecognizer, PitchRecognizerState } from './pitchRecognizer';
import { Melody, melodyRecognizer, MelodyRecognizerState } from './melodyRecognizer';
import { concatMap, debounceTime, map, shareReplay, startWith, takeUntil } from 'rxjs/operators';
import { finallyDone } from '../finallyDone';
import { VocalState } from '../../../components/detector/VoiceDetector';
import { smoothPitch } from '../smoothPitch';
import { mod12 } from '../../math';

interface Props {
    recognizers: RecognizerMap;
    keyNumber: number;
    sustainLength: number;
}

interface Recognizer {
    type: TaskType.PITCH | TaskType.INTERVAL | undefined;
}

interface MelodyRecognizer {
    type: TaskType.MELODY;
    melodies: Melody[];
}

export type RecognizerMap = Record<number, Recognizer | MelodyRecognizer>;

export enum TaskType {
    PITCH = 'PITCH',
    INTERVAL = 'INTERVAL',
    MELODY = 'MELODY'
}

interface CommonState {
    isDone: boolean;
}

type IntervalState = IntervalRecognizerState & CommonState & { type: TaskType.INTERVAL };
type PitchState = PitchRecognizerState & CommonState & { type: TaskType.PITCH };
type MelodyState = MelodyRecognizerState & CommonState & { type: TaskType.MELODY };
export type UniversalRecognizerState = IntervalState | PitchState | MelodyState;

interface Mode {
    type: TaskType;
    noteAbs: number; // Absolute value of the note, not mod12ed or adjusted for key
}

const initialMode: Mode = { type: TaskType.PITCH, noteAbs: 0 };
const STOP_TIME = 500;

export const universalRecognizer = ({ sustainLength, recognizers, keyNumber }: Props) => (
    source$: Observable<VocalState>
): Observable<UniversalRecognizerState> => {
    const mode$ = new Subject<Mode>();
    const sourceWithReplay$ = source$.pipe(shareReplay(1));

    // Note: nodeAbs has no meaning unless it's in a non-pitch mode.
    const state$ = mode$.pipe(
        // Must start with something to allow the processing to occur
        startWith(initialMode),
        concatMap(({ type, noteAbs }) => {
            const recognizer = recognizers[mod12(noteAbs - keyNumber)];
            switch (type) {
                case TaskType.PITCH:
                    return sourceWithReplay$.pipe(
                        smoothPitch(),
                        pitchRecognizer({ sustainLength, keyNumber }),
                        map<PitchRecognizerState, PitchState>((state) => ({
                            ...state,
                            // Show nothing as being recognized, ever, if there is no corresponding recognizer.
                            recognized: state.recognized
                                ? recognizers[state.recognized.value].type !== undefined
                                    ? state.recognized
                                    : undefined
                                : state.recognized,
                            type: TaskType.PITCH,
                            isDone: false
                        })),
                        takeUntil(mode$), // Continue until mode switches
                        finallyDone({
                            checkDone: (state) => {
                                return (
                                    // To be done, we need to have recognized a pitch and stopped for 500 ms and be a pitch to recognize
                                    // NOTE: if we did not stop for 500 ms, then this is just an intermediary before another mode.
                                    // Because of how takeUntil() works, this is the easiest way to find out if we are still in
                                    // pitch mode.
                                    state.recognized !== undefined &&
                                    performance.now() - state.raw.time >= STOP_TIME &&
                                    recognizers[state.recognized.value].type === TaskType.PITCH
                                );
                            }
                        })
                    );
                case TaskType.INTERVAL:
                    return source$.pipe(
                        smoothPitch(),
                        // NOTE: sustain length here is different from pitch! Needs to be short.
                        intervalRecognizer({ sustainLength: 3, keyNumber, startNote: noteAbs }),
                        map<IntervalRecognizerState, IntervalState>((state) => ({
                            ...state,
                            type: TaskType.INTERVAL,
                            isDone: false
                        })),
                        takeUntil(mode$), // Continue until mode switches
                        finallyDone({ checkDone: (state) => state.recognized !== undefined })
                    );
                case TaskType.MELODY:
                    return source$.pipe(
                        smoothPitch(),
                        melodyRecognizer({ startNote: noteAbs, keyNumber, melodies: (recognizer as MelodyRecognizer).melodies }),
                        map<MelodyRecognizerState, MelodyState>((state) => ({
                            ...state,
                            type: TaskType.MELODY,
                            isDone: false
                        })),
                        takeUntil(mode$), // Continue until mode switches
                        finallyDone({ checkDone: (state) => state.recognized !== undefined })
                    );
            }
        })
    );

    // After 500 ms, stop and switch to pitch again
    source$.pipe(smoothPitch(), debounceTime(STOP_TIME)).subscribe(() => mode$.next(initialMode));

    // If we have a valid pitch task, if this note is mapped to interval/melody, switch modes
    state$.subscribe((state: UniversalRecognizerState) => {
        if (state.type === TaskType.PITCH && !state.isDone && state.recognized) {
            const recognizer = recognizers[state.recognized.value];
            switch (recognizer.type) {
                case TaskType.INTERVAL:
                    mode$.next({ type: TaskType.INTERVAL, noteAbs: state.pitch.noteNum });
                    break;
                case TaskType.MELODY:
                    mode$.next({ type: TaskType.MELODY, noteAbs: state.pitch.noteNum });
                    break;
            }
        }
    });

    return state$;
};
