import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';
import { ComprehensiveVocalState } from './smoothPitch';
import { VocalState } from '../../components/detector/VoiceDetector';

interface Props<RecognizerState, Target> {
    targets: Target[];
    checkCorrect: (state: RecognizerState, target: Target, targetIdx: number) => boolean;
    initialState: TaskProgressState<Target, RecognizerState>;
    onComplete?: (completed: Target, next: Target, isRepeated: boolean) => void;
    maxAttempts: number;
}

export interface SingTaskResult<Target> {
    target: Target;
    success?: boolean;
    attempts: number;
    frequencies: VocalState[];
    start: number;
    stop?: number;
}

export interface State<Target> {
    isDone: boolean;
    isCorrect: boolean; // If current note is correct
    results: SingTaskResult<Target>[];
    currTargetIdx: number;
    currTarget: Target;
    nextTargetIdx: number;
    nextTarget: Target;
}

export type TaskProgressState<Target, RecognizerState> = State<Target> & RecognizerState;

export function getTaskProgressInitialState<RecognizerState, Target>(
    initialTarget: Target,
    emptyState: RecognizerState,
    initialNote: number
): TaskProgressState<Target, RecognizerState> {
    return {
        ...emptyState,
        isDone: false,
        isCorrect: false,
        results: [
            {
                target: initialTarget,
                start: performance.now(),
                attempts: 1,
                frequencies: []
            }
        ],
        currTargetIdx: 0,
        currTarget: initialTarget,
        nextTargetIdx: 0,
        nextTarget: initialTarget,
        nextNote: initialNote
    };
}

export function taskProgress<RecognizerState extends ComprehensiveVocalState & { isDone: boolean }, Target>({
    targets,
    checkCorrect,
    initialState,
    onComplete,
    maxAttempts
}: Props<RecognizerState, Target>) {
    return (source$: Observable<RecognizerState>): Observable<TaskProgressState<Target, RecognizerState>> => {
        return source$.pipe(
            scan<RecognizerState, TaskProgressState<Target, RecognizerState>>((state, curr) => {
                const currTargetIdx = curr.isDone && state.isDone ? state.currTargetIdx : state.nextTargetIdx;
                const currTarget = curr.isDone && state.isDone ? state.currTarget : state.nextTarget;
                let nextTargetIdx = state.nextTargetIdx;
                let nextTarget = state.nextTarget;
                const isCorrect = checkCorrect(curr, currTarget, currTargetIdx);

                const results: SingTaskResult<Target>[] = [...state.results];

                // Add on the current frequency IFF we're not done (because if we are done, this is just a duplicate)
                // AND this isn't a piece of garbage data at the start of the task.
                if (!curr.isDone && !state.isDone) {
                    // Add the frequency to the results
                    const oldResult = results[results.length - 1];
                    const frequencies = [...oldResult.frequencies, state.raw];
                    results[results.length - 1] = {
                        ...oldResult,
                        frequencies
                    };
                }

                if (curr.isDone && !state.isDone) {
                    // If we're done and it's right (or we maxed out our attempts), more forward
                    const attempts = results[results.length - 1].attempts;
                    let isRepeated = true;
                    if (isCorrect || attempts >= maxAttempts) {
                        isRepeated = false;
                        nextTargetIdx = results.length % targets.length;
                        nextTarget = targets[nextTargetIdx];
                        results[results.length - 1] = {
                            ...results[results.length - 1],
                            stop: performance.now(),
                            success: isCorrect
                        };
                        results.push({
                            target: targets[results.length % targets.length],
                            start: performance.now(),
                            attempts: 1,
                            frequencies: []
                        });
                    } else {
                        results[results.length - 1] = {
                            ...results[results.length - 1],
                            attempts: attempts + 1
                        };
                    }

                    // Notify that we're repeating
                    if (onComplete) onComplete(currTarget, nextTarget, isRepeated);
                }

                return {
                    ...curr,
                    isCorrect,
                    results,
                    currTargetIdx,
                    currTarget,
                    nextTargetIdx,
                    nextTarget
                };
            }, initialState)
        );
    };
}
