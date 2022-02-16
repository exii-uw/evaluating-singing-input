import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../../theme';
import Page from '../../../page/Page';
import ButtonBox from '../../../common/ButtonBox';
import Button from '@material-ui/core/Button';
import useAudio from '../../../audio/useAudio';
import { TaskTarget } from '../../sing/target';
import { TaskType } from '../../../../utils/rxjs/recognizers/universalRecognizer';
import { getAudioURL } from '../../../audio/getAudioURL';
import FormRadio from '../../form/FormRadio';
import CalibrationBar from '../rangeSelection/CalibrationBar';
import RangeSelector from '../rangeSelection/RangeSelector';
import { Subject, timer } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import Typography from '@material-ui/core/Typography';
import { tonic$ } from '../../../detector/shared';
import { clearCachedAudio } from '../../../audio/getCachedAudio';
import { Card } from '@material-ui/core';

interface CalibrationProps {
    onComplete?: (startNote: number) => void;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        position: 'relative',
        width: '90%',
        maxWidth: '50rem'
    },
    text: {
        marginBottom: theme.spacing(4)
    },
    card: {
        padding: theme.spacing(0, 4)
    }
}));

const maxNoteNum = 71; // NOTE: the max minimum note is 60, but this is the highest number for the top note
const minNoteNum = 12;
const defaultNoteNum = 44;

const noteTarget: TaskTarget = {
    type: TaskType.PITCH,
    value: 0
};

const octaveTarget: TaskTarget = {
    type: TaskType.INTERVAL,
    value: 12,
    startNote: 0
};

enum Stage {
    FIND_START,
    DESCENDING,
    ASCENDING,
    USER_CHOICE,
    DONE
}

const formOptions = ['Too low', 'Slightly low', 'Just right', 'Slightly high', 'Too high'];

const getHeader = (stage: Stage) => {
    switch (stage) {
        case Stage.FIND_START:
        case Stage.DESCENDING:
        case Stage.ASCENDING:
            return 'Sing the note being played.';
        case Stage.USER_CHOICE:
            return 'Move the slider to your desired range.';
        case Stage.DONE:
            return 'All done!';
    }
};

const getText = (stage: Stage) => {
    switch (stage) {
        case Stage.FIND_START:
        case Stage.DESCENDING:
        case Stage.ASCENDING:
            return 'After singing, record whether the note is too low or high for your voice. Only select "Just right" if it is easy to sing.';
        case Stage.USER_CHOICE:
            return 'Listen to the notes played in the background and sing them back. Move the slider until the notes feel comfortable. After, click "Next".';
        case Stage.DONE:
            return 'Good work.';
    }
};

const CalibrationNoMic = ({ onComplete }: CalibrationProps): React.ReactElement<CalibrationProps> => {
    const classes = useStyles();
    const [currNote, setCurrNote] = React.useState(defaultNoteNum);
    const [maxNote, setMaxNote] = React.useState(maxNoteNum); // For binary search
    const [minNote, setMinNote] = React.useState(minNoteNum); // for binary search

    const [stage, setStage] = React.useState<Stage>(Stage.FIND_START);
    const [status, setStatus] = React.useState<Record<number, number>>({});
    const { play } = useAudio({ keyNumber: 0 });
    const play$ = React.useRef<Subject<string>>(new Subject());

    const onDone = () => {
        setStage(Stage.DONE);
        tonic$.next(currNote);
        clearCachedAudio();
        onComplete && onComplete(currNote);
    };

    const currAudioURL = getAudioURL({
        target: stage === Stage.USER_CHOICE ? octaveTarget : noteTarget,
        keyNumber: currNote % 12,
        octave: Math.floor(currNote / 12)
    });

    React.useEffect(() => {
        const sub = play$.current.pipe(debounceTime(stage === Stage.USER_CHOICE ? 400 : 0)).subscribe((url) => play(url));
        return () => sub.unsubscribe();
    }, [play, stage]);
    React.useEffect(() => play$.current.next(currAudioURL), [currAudioURL]);

    // To make the radio buttons show an effect then open up for the next question
    const [radioVal, setRadioVal] = React.useState('');
    React.useEffect(() => {
        if (radioVal !== '') {
            const sub = timer(250).subscribe(() => setRadioVal(''));
            return () => sub.unsubscribe();
        }
    }, [radioVal]);

    const selectRange = (selection: string) => {
        setRadioVal(selection);
        const idx = formOptions.indexOf(selection);
        const noteRating = idx > 2 ? 4 - idx : idx;
        switch (stage) {
            case Stage.FIND_START:
                if (noteRating === 2) {
                    setStatus((range) => ({ ...range, [currNote]: noteRating }));
                    setStage(Stage.DESCENDING);
                    setCurrNote(currNote - 1);
                    setMaxNote(currNote); // Where we'll start ascending again
                } else if (idx < 2) {
                    // Find a note that's higher
                    setMinNote(currNote);
                    let nextNote = Math.ceil((maxNote + currNote) / 2);
                    // If the user thinks a note is both too low and too high...
                    if (nextNote === currNote) {
                        setMaxNote(maxNoteNum);
                        nextNote = Math.ceil((maxNoteNum + currNote) / 2);
                    }
                    setCurrNote(nextNote);
                } else {
                    // Find a note that's lower
                    setMaxNote(currNote);
                    let nextNote = Math.floor((minNote + currNote) / 2);
                    // If the user thinks a note is both too high and too low...
                    if (nextNote === currNote) {
                        setMinNote(minNoteNum);
                        nextNote = Math.floor((minNoteNum + currNote) / 2);
                    }
                    setCurrNote(nextNote);
                }
                break;
            case Stage.DESCENDING:
                setStatus((range) => ({ ...range, [currNote]: noteRating }));
                if (noteRating === 0 || currNote === minNoteNum) {
                    setStage(Stage.ASCENDING);
                    setCurrNote(maxNote);
                    setMinNote(currNote + 1); // Bottom of their range
                } else setCurrNote(currNote - 1);
                break;
            case Stage.ASCENDING:
                setStatus((range) => ({ ...range, [currNote]: noteRating }));
                if (noteRating === 0 || currNote === maxNoteNum) {
                    setStage(Stage.USER_CHOICE);
                    setCurrNote(minNote);
                    setMaxNote(currNote - 1); // Top of their range
                } else setCurrNote(currNote + 1);
                break;
        }
    };

    return (
        <Page header="Calibration">
            <div className={classes.root}>
                <Typography variant="h4" align="center" gutterBottom>
                    {getHeader(stage)}
                </Typography>
                <Typography className={classes.text} align="center" gutterBottom>
                    {getText(stage)}
                </Typography>
                <CalibrationBar minNote={minNoteNum} maxNote={maxNoteNum} status={status} />
                {stage === Stage.USER_CHOICE && (
                    <RangeSelector
                        minNote={minNoteNum}
                        maxNote={maxNoteNum}
                        note={currNote}
                        setNote={(note) => setCurrNote(Math.max(minNote, Math.min(maxNote - 12, note)))}
                    />
                )}
                {[Stage.FIND_START, Stage.ASCENDING, Stage.DESCENDING].includes(stage) && (
                    <Card className={classes.card}>
                        <FormRadio
                            value={radioVal}
                            header="How does the note being played fit in your vocal range?"
                            options={formOptions}
                            setValue={selectRange}
                            variant="horizontal"
                        />
                    </Card>
                )}
                <ButtonBox margin={5}>
                    <Button
                        onClick={() => {
                            setStage(Stage.FIND_START);
                            setCurrNote(defaultNoteNum);
                            setStatus({});
                        }}
                    >
                        Restart
                    </Button>
                    <Button onClick={() => play(currAudioURL)}>Replay sound</Button>
                    {stage === Stage.USER_CHOICE && (
                        <Button onClick={onDone} variant="contained" color="primary">
                            Next
                        </Button>
                    )}
                </ButtonBox>
            </div>
        </Page>
    );
};

export default CalibrationNoMic;
