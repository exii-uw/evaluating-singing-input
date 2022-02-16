import React from 'react';
import { SingTaskResult } from '../../../utils/rxjs/taskProgress';
import { RecognizerMap } from '../../../utils/rxjs/recognizers/universalRecognizer';
import { TaskTarget } from './target';
import TargetBox from './progressIndicators/TargetBox';
import SuccessBar from './progressIndicators/SuccessBar';
import Page from '../../page/Page';
import { useSinging } from './useSinging';
import { getLetterStringForTarget, getNumberStringForTarget } from '../../../utils/targetConverter';
import PitchIndicatorFromState from './progressIndicators/PitchIndicatorFromState';
import useTonic from '../../audio/useTonic';
import Centered from '../../common/Centered';
import { defaultSustainLength } from '../../detector/shared';
import RecordingIndicator from '../record/RecordingIndicator';
import { Observable } from 'rxjs';
import { recordAudio } from '../../audio/recordAudio';

interface Props {
    header: string;
    title?: string;
    targets: TaskTarget[];
    recognizers: RecognizerMap;
    sustainLength: number;
    withPrompts?: boolean;
    withInitialPrompts?: boolean;
    maxAttempts: number;
    hideFeedback?: boolean;
    isRecorded?: boolean;
    hasBackground: boolean;
    numberLabels: boolean;
    // Called every time a task is completed
    onComplete?: (results: SingTaskResult<TaskTarget>[], audio?: Blob) => void;
}

const SingTasks = (props: Props): React.ReactElement<Props> => {
    const stopRecording = React.useRef<() => Observable<Blob>>();

    // Start recording audio at the beginning, if applicable
    React.useEffect(() => {
        if (props.isRecorded) stopRecording.current = recordAudio();
    }, [props.isRecorded]);

    const { onComplete: onCompleteAll, targets } = props;
    const onComplete = React.useCallback(
        (results: SingTaskResult<TaskTarget>[]) => {
            if (onCompleteAll) {
                if (targets.length === results.length && stopRecording.current) {
                    stopRecording.current().subscribe({
                        next: (blob) => onCompleteAll(results, blob),
                        error: (e) => console.error('Critical error recording audio:', e),
                        complete: () => (stopRecording.current = undefined)
                    });
                } else {
                    onCompleteAll(results);
                }
            }
        },
        [onCompleteAll, targets]
    );

    const { state, feedback } = useSinging({
        ...props,
        onComplete
    });
    const [tonic] = useTonic();

    return (
        <Page header={props.header} title={props.title || props.header}>
            <RecordingIndicator isVisible={props.isRecorded} />
            <TargetBox height="7rem">
                <h2>
                    {props.numberLabels ? getNumberStringForTarget(state.nextTarget) : getLetterStringForTarget(state.nextTarget, tonic)}
                </h2>
            </TargetBox>
            <Centered>
                <PitchIndicatorFromState state={state} numberLabels={props.numberLabels} />
            </Centered>
            {!props.hideFeedback && <SuccessBar items={feedback} />}
        </Page>
    );
};

SingTasks.defaultProps = {
    maxAttempts: 1,
    sustainLength: defaultSustainLength,
    withPrompts: false,
    hasBackground: true,
    numberLabels: true
};

export default SingTasks;
