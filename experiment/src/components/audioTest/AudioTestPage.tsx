import React from 'react';
import Page from '../page/Page';
import ButtonBox from '../common/ButtonBox';
import Button from '@material-ui/core/Button';
import { useSinging } from '../tasks/sing/useSinging';
import { pitchTaskProps } from '../tasks/sing/possibleTasks';
import { SingTaskResult, TaskProgressState } from '../../utils/rxjs/taskProgress';
import { notesToTestAudio } from './constants';
import { PitchTaskTarget, TaskTarget } from '../tasks/sing/target';
import { TaskType, UniversalRecognizerState } from '../../utils/rxjs/recognizers/universalRecognizer';
import TargetBox from '../tasks/sing/progressIndicators/TargetBox';
import PitchIndicatorFromState from '../tasks/sing/progressIndicators/PitchIndicatorFromState';
import SuccessBar from '../tasks/sing/progressIndicators/SuccessBar';
import { convertNoteToString } from '../../utils/pitchConverter';
import { timer } from 'rxjs';
import QRCode from './QRCode';
import { defaultSustainLength } from '../detector/shared';
import Typography from '@material-ui/core/Typography';
import Centered from '../common/Centered';

interface Props {
    header: string;
    onComplete: (results: SingTaskResult<TaskTarget>[]) => void;
}

const targets = notesToTestAudio.map<PitchTaskTarget>((value) => ({ type: TaskType.PITCH, value }));

const suggestedFixes = [
    'If the phone is not producing any sound, try increasing the volume, refreshing the page, and pressing the button again.',
    'If this page is not responding to any sound, make sure you are using Chrome on your desktop and try refreshing the page.',
    'Make sure you are wearing headphones in a quiet room.',
    'If you are still having difficulties, move to a quieter room, turn off fans, and increase the volume of your phone'
];

const stateToMessage = (state: TaskProgressState<TaskTarget, UniversalRecognizerState>): string => {
    const currNote = convertNoteToString(state.nextTarget.value as number);
    if (state.recognized && !state.isDone) {
        if (state.isCorrect) return `Wait quietly...`;
        return `The current note is not ${currNote}`;
    }
    return `On your phone, press the button ${currNote}`;
};

enum Status {
    PENDING,
    IN_PROGRESS,
    SUCCESS,
    FAIL
}

const AudioTestPage = ({ header, onComplete }: Props): React.ReactElement => {
    const [status, setStatus] = React.useState(Status.PENDING);
    const onSing = React.useCallback((results: SingTaskResult<any>[]) => {
        if (!results[results.length - 1].success) setStatus((s) => (s === Status.IN_PROGRESS ? Status.FAIL : s));
        if (results.length === targets.length) setStatus((s) => (s === Status.IN_PROGRESS ? Status.SUCCESS : s));
    }, []);

    const { state, feedback, reset } = useSinging({
        targets,
        octaveDependent: true,
        recognizers: pitchTaskProps.recognizers,
        withPrompts: false,
        hasBackground: false,
        maxAttempts: 1,
        sustainLength: defaultSustainLength,
        onComplete: onSing
    });

    const [showError, setShowError] = React.useState(false);
    React.useEffect(() => {
        if (status !== Status.IN_PROGRESS) return;

        // If state does not change for X seconds, show error
        setShowError(false);
        const sub = timer(10000).subscribe(() => setShowError(true));
        return () => sub.unsubscribe();
    }, [state.results.length, state.isCorrect, status]);

    const resetTest = () => {
        setStatus(Status.IN_PROGRESS);
        reset();
    };

    let contents, button;
    switch (status) {
        case Status.PENDING:
            contents = (
                <>
                    <Typography variant="h4" gutterBottom>
                        Before you begin...
                    </Typography>
                    <Typography>Make sure you are in a quiet environment.</Typography>
                    <Typography>Wear headphones. Make sure they are connected to your computer and not your phone.</Typography>
                    <Typography>
                        On your phone, go to <a href="https://phone.singui.ca">phone.singui.ca</a> by scanning the QR Code below.
                    </Typography>
                    <QRCode />
                    <Typography>Position your phone's speaker close to your computer's mic and turn up the phone's volume.</Typography>
                </>
            );
            button = (
                <Button variant="contained" color="primary" onClick={resetTest}>
                    Start test
                </Button>
            );
            break;
        case Status.FAIL:
            contents = (
                <>
                    <Typography variant="h4" gutterBottom>
                        Test failed
                    </Typography>
                    <Typography>Make sure you press the right button, remain silent, and have a quiet roo.m</Typography>
                    <Typography>When you are ready, click the restart button.</Typography>
                </>
            );
            button = (
                <Button variant="contained" color="primary" onClick={resetTest}>
                    Restart test
                </Button>
            );
            break;
        case Status.SUCCESS:
            contents = <Typography variant="h4">Test successful</Typography>;
            button = (
                <Button variant="contained" color="primary" onClick={() => onComplete && onComplete(state.results)}>
                    Next
                </Button>
            );
            break;
        default:
            contents = (
                <>
                    <Typography variant="h4" gutterBottom>
                        {stateToMessage(state)}
                    </Typography>
                    {showError && suggestedFixes.map((fix) => <Typography key={fix}>{fix}</Typography>)}
                </>
            );
    }

    return (
        <Page header={header} title="Audio Test">
            <TargetBox>{contents}</TargetBox>
            {status === Status.IN_PROGRESS && (
                <Centered>
                    <PitchIndicatorFromState state={state} numberLabels={false} />
                </Centered>
            )}
            {button && <ButtonBox>{button}</ButtonBox>}
            {status === Status.IN_PROGRESS && <SuccessBar items={feedback} />}
        </Page>
    );
};

AudioTestPage.defaultProps = {
    header: 'Audio Test'
};

export default AudioTestPage;
