import { Observable } from 'rxjs';
import { TaskType, UniversalRecognizerState } from './recognizers/universalRecognizer';
import { IntervalTaskTarget, MelodyTaskTarget, TaskTarget } from '../../components/tasks/sing/target';
import { getTaskProgressInitialState, taskProgress, TaskProgressState } from './taskProgress';
import { pitchRecognizerInitialState } from './recognizers/pitchRecognizer';
import { getAudioURL } from '../../components/audio/getAudioURL';

interface Props {
    targets: TaskTarget[];
    octaveDependent?: boolean; // If false, then 0 = 12 = 24, etc. Otherwise, targets must match singing exactly.
    keyNumber: number;
    octave: number;
    play: (url: string) => void;
    withPrompts?: boolean; // By default, never have prompts. Set to true to play prompt on failure
    withInitialPrompts?: boolean; // By default, do not play the initial audio prompt
    maxAttempts: number;
}

export const getUniversalTaskProgressInitialState = (target: TaskTarget): TaskProgressState<TaskTarget, UniversalRecognizerState> => {
    let initialTarget = 0;
    switch (target.type) {
        case TaskType.PITCH:
            initialTarget = target.value;
            break;
        case TaskType.INTERVAL:
            initialTarget = target.startNote;
            break;
        case TaskType.MELODY:
            initialTarget = target.startNote;
            break;
    }
    return getTaskProgressInitialState<UniversalRecognizerState, TaskTarget>(
        target,
        {
            ...pitchRecognizerInitialState,
            type: TaskType.PITCH,
            isDone: false
        },
        initialTarget
    );
};

export const universalTaskProgress = ({
    targets,
    keyNumber,
    octave,
    play,
    withPrompts,
    withInitialPrompts,
    maxAttempts,
    octaveDependent
}: Props) => (source$: Observable<UniversalRecognizerState>): Observable<TaskProgressState<TaskTarget, UniversalRecognizerState>> => {
    // Uncomment to play before the start of the first trial
    if (withInitialPrompts) play(getAudioURL({ target: targets[0], keyNumber, octave }));

    return source$.pipe(
        taskProgress<UniversalRecognizerState, TaskTarget>({
            targets,
            checkCorrect: (state, target) => {
                if (target.type !== state.type) return false;
                if (!state.recognized) return false;
                switch (state.type) {
                    case TaskType.PITCH:
                        return octaveDependent ? target.value === state.pitch.noteNum : target.value === state.recognized.value;
                    case TaskType.INTERVAL:
                        return (
                            target.value === state.recognized.value &&
                            (target as IntervalTaskTarget).startNote === state.recognized.startNote
                        );
                    case TaskType.MELODY:
                        return (target as MelodyTaskTarget).id === state.recognized.id;
                }
            },
            initialState: getUniversalTaskProgressInitialState(targets[0]),
            onComplete: (_, target, isRepeated) => {
                // Remove isRepeated logic to play before every note
                if ((withPrompts && isRepeated) || (withInitialPrompts && !isRepeated)) {
                    play(getAudioURL({ target, keyNumber, octave }));
                }
            },
            maxAttempts
        })
    );
};
