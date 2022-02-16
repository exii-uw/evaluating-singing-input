import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { CircularProgress, LinearProgress } from '@material-ui/core';
import { interval, Subscription } from 'rxjs';
import { recordAudioFor } from '../../audio/recordAudio';
import { take } from 'rxjs/operators';
import MessagePage from '../message/MessagePage';
import RecordingIndicator from './RecordingIndicator';

export interface RecordProps {
    header: string;
    title: string;
    onComplete?: (audio: Blob) => void;
}

const recordTime = 5000;

const useStyles = makeStyles<Theme>((theme) => ({
    progress: {
        width: '100%',
        margin: theme.spacing(2, 0)
    },
    loading: {
        marginRight: theme.spacing(1)
    }
}));

enum State {
    NOT_STARTED,
    LOADING,
    DONE,
    UPLOADING
}

const getButtonText = (state: State): string => {
    switch (state) {
        case State.NOT_STARTED:
            return 'Record';
        case State.LOADING:
            return 'In progress...';
        case State.DONE:
            return 'Next';
        case State.UPLOADING:
            return 'Loading...';
    }
};

const RecordPage = ({ header, title, onComplete }: RecordProps): React.ReactElement<RecordProps> => {
    const classes = useStyles();
    const [state, setState] = React.useState<State>(State.NOT_STARTED);
    const [progress, setProgress] = React.useState<number>(0);
    const subscriptions = React.useRef<Subscription[]>([]);
    const blob = React.useRef<Blob>();

    React.useEffect(() => {
        subscriptions.current = [];
        return () => subscriptions.current.forEach((sub) => sub.unsubscribe());
    }, []);

    const onClick = () => {
        if (state === State.NOT_STARTED) {
            subscriptions.current.push(
                recordAudioFor(recordTime).subscribe({
                    next: (recording) => {
                        blob.current = recording;
                        setState(State.DONE);
                    },
                    error: (e) => {
                        setState(State.NOT_STARTED);
                        console.error('Critical error recording audio:', e);
                    }
                }),
                interval(recordTime / 10)
                    .pipe(take(10))
                    .subscribe((n) => setProgress((n + 1) * 10))
            );
            setState(State.LOADING);
        } else {
            setState(State.UPLOADING);
            onComplete && blob.current && onComplete(blob.current);
        }
    };

    const isLoading = [State.LOADING, State.UPLOADING].includes(state);
    const button = (
        <Button onClick={onClick} variant="contained" color="primary" disabled={isLoading}>
            {isLoading && <CircularProgress className={classes.loading} size="1rem" />}
            {getButtonText(state)}
        </Button>
    );

    return (
        <MessagePage header={header} title={title} buttons={button}>
            <RecordingIndicator isVisible={state === State.LOADING} />
            <Typography align="center" gutterBottom>
                In this step, we need to record {recordTime / 1000} seconds of audio to ensure there is minimal background noise.
            </Typography>
            <LinearProgress className={classes.progress} variant="determinate" value={progress} />
        </MessagePage>
    );
};

RecordPage.defaultProps = {
    header: 'Audio Recording',
    title: 'Audio Recording'
};

export default RecordPage;
