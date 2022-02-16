import React from 'react';
import VoiceDetector from '../../detector/VoiceDetector';
import { SingTaskResult, TaskProgressState } from '../../../utils/rxjs/taskProgress';
import { TaskTarget } from './target';
import { RecognizerMap, universalRecognizer, UniversalRecognizerState } from '../../../utils/rxjs/recognizers/universalRecognizer';
import { getUniversalTaskProgressInitialState, universalTaskProgress } from '../../../utils/rxjs/universalTaskProgress';
import { audioContext } from '../../audio/audioContext';
import { useAudioCache } from '../../audio/useAudioCache';
import useAudio from '../../audio/useAudio';
import useTonic from '../../audio/useTonic';

export interface SingingProps {
    targets: TaskTarget[];
    octaveDependent?: boolean; // If false, then 0 = 12 = 24, etc. Otherwise, targets must match singing exactly.
    recognizers: RecognizerMap;
    withPrompts?: boolean;
    withInitialPrompts?: boolean;
    hasBackground: boolean;
    maxAttempts: number;
    sustainLength: number; // Number of steps before a target is recognized
    onComplete?: (results: SingTaskResult<TaskTarget>[]) => void;
}

export const useSinging = ({
    targets,
    octaveDependent,
    recognizers,
    withPrompts,
    withInitialPrompts,
    hasBackground,
    maxAttempts,
    sustainLength,
    onComplete
}: SingingProps) => {
    const [tonic] = useTonic();
    const octave = Math.floor(tonic / 12);
    const keyNumber = tonic % 12;

    // Increment this to refresh the state
    const [resetIndex, setResetIndex] = React.useState(0);
    const reset = () => setResetIndex((i) => i + 1);

    const ctx = React.useContext(audioContext);
    const [state, setState] = React.useState<TaskProgressState<TaskTarget, UniversalRecognizerState>>(
        getUniversalTaskProgressInitialState(targets[0])
    );
    const [feedback, setFeedback] = React.useState<boolean[]>([]);

    useAudioCache({ keyNumber, octave, targets, pauseCache: !withPrompts });
    const { play } = useAudio({ keyNumber, hasBackground: hasBackground });

    React.useEffect(() => {
        if (keyNumber === 0 && octave === 0) return;

        // Reset the state accordingly
        setState(getUniversalTaskProgressInitialState(targets[0]));

        const voiceDetector = new VoiceDetector(ctx.audioContext);

        const sub = voiceDetector
            .getState()
            .pipe(
                universalRecognizer({ sustainLength, recognizers, keyNumber }),
                universalTaskProgress({
                    targets,
                    octaveDependent,
                    keyNumber,
                    octave,
                    play,
                    withPrompts,
                    withInitialPrompts,
                    maxAttempts
                })
            )
            .subscribe((nextState: TaskProgressState<TaskTarget, UniversalRecognizerState>) => {
                setState(nextState);
                if (nextState.isDone) {
                    setFeedback((feedback) => [...feedback, nextState.isCorrect]);
                    onComplete && onComplete(nextState.results.slice(0, nextState.results.length - 1));
                }
            });

        return () => sub.unsubscribe();
    }, [
        resetIndex,
        keyNumber,
        octave,
        withPrompts,
        withInitialPrompts,
        recognizers,
        targets,
        octaveDependent,
        ctx.audioContext,
        play,
        maxAttempts,
        onComplete,
        sustainLength
    ]);

    // Note that tonic, octave, and keyNumber pertain to the user's tonic/octave/keyNumber set for the experiment.
    // Consider removing down the road.
    return { state, feedback, reset };
};
