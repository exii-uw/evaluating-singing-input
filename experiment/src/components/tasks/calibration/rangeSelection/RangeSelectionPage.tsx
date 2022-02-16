import React from 'react';
import CalibrationBar from './CalibrationBar';
import RangeSelector from './RangeSelector';
import MessagePage from '../../message/MessagePage';
import { Subject, timer } from 'rxjs';
import { Alert } from '@material-ui/lab';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../../theme';
import useAudio from '../../../audio/useAudio';
import { getAudioURL } from '../../../audio/getAudioURL';
import { debounceTime } from 'rxjs/operators';
import { TaskTarget } from '../../sing/target';
import { TaskType } from '../../../../utils/rxjs/recognizers/universalRecognizer';
import Button from '@material-ui/core/Button';
import ConfirmDialog from './ConfirmDialog';
import Typography from '@material-ui/core/Typography';

export interface RangeSelectionProps {
    header: string;
    minNote: number; // Minimum note in comfortable range
    maxNote: number; // Maximum note in comfortable range
    onComplete: (startNote: number) => void;
    restart?: () => void; // To restart calibration
}

const useStyles = makeStyles<Theme>((theme) => ({
    errorBox: {
        margin: theme.spacing(5, 0, 0),
        '& > div': {
            marginBottom: '1rem'
        }
    },
    text: {
        textAlign: 'center'
    }
}));

const maxNoteNum = 71; // NOTE: the max minimum note is 60, but this is the highest number for the top note
const minNoteNum = 12;

const octaveTarget: TaskTarget = {
    type: TaskType.INTERVAL,
    value: 12,
    startNote: 0
};

const valueFor = (n: number, min: number, max: number): number => (n >= min && n <= max ? 2 : 0);
const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);
const hasOverlap = (s1: number, e1: number, s2: number, e2: number): boolean => {
    const firstEnd = s1 < s2 ? e1 : e2;
    const secondStart = firstEnd === e1 ? s2 : s1;
    return firstEnd >= secondStart;
};

const RangeSelectionPage = ({ header, minNote, maxNote, onComplete, restart }: RangeSelectionProps) => {
    const [modalOpen, setModalOpen] = React.useState(false);
    const classes = useStyles();
    const [note, setNote] = React.useState(clamp(Math.floor((maxNote + minNote) / 2) - 6, minNoteNum, maxNoteNum - 12));
    const status = new Array(maxNoteNum - minNoteNum + 1)
        .fill(0)
        .reduce((acc, _, idx) => ({ ...acc, [idx + minNoteNum]: valueFor(idx + minNoteNum, minNote, maxNote) }), {});

    // Dummy loader to ensure they look through the page
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        const sub = timer(3000).subscribe(() => setLoading(false));
        return () => sub.unsubscribe();
    }, []);

    // For playing the notes
    const { play } = useAudio({ keyNumber: 0 });
    const play$ = React.useRef<Subject<string>>(new Subject());

    const currAudioURL = getAudioURL({
        target: octaveTarget,
        keyNumber: note % 12,
        octave: Math.floor(note / 12)
    });

    React.useEffect(() => {
        const sub = play$.current.pipe(debounceTime(400)).subscribe((url) => play(url));
        return () => sub.unsubscribe();
    }, [play]);
    React.useEffect(() => play$.current.next(currAudioURL), [currAudioURL]);

    const rangeInsufficient = maxNote - minNote < 12;

    const button = (
        <>
            {restart && <Button onClick={() => setModalOpen(true)}>Restart</Button>}
            <Button onClick={() => play(currAudioURL)}>Replay sound</Button>
        </>
    );

    return (
        <MessagePage header={header} onComplete={() => onComplete(note)} isLoading={loading} buttons={button}>
            <Typography align="center">To select your range, drag the slider ends left or right.</Typography>
            <Typography align="center">
                For best results, keep the slider under the green rectangle, which is your estimated range.
            </Typography>
            <Typography align="center">Listen to the notes played and sing them to make sure the range is comfortable.</Typography>
            <CalibrationBar minNote={minNoteNum} maxNote={maxNoteNum} status={status} />
            <RangeSelector minNote={minNoteNum} maxNote={maxNoteNum} note={note} setNote={(to) => setNote(to)} />
            <div className={classes.errorBox}>
                {!hasOverlap(note, note + 12, minNote, maxNote) && (
                    <Alert severity="error">
                        The range selected is not under the green rectangle, which is your estimated range. For best results, try moving the
                        slider beneath the green rectangle.
                    </Alert>
                )}
                {rangeInsufficient && (
                    <Alert severity="info">
                        Your range was estimated as under 1 octave, so make sure you adjust your range using the slider to make it as
                        comfortable as possible.
                    </Alert>
                )}
            </div>
            <ConfirmDialog
                header="Are you sure you want to restart?"
                text="Instead of restarting, you can simply move the slider to adjust your range. Sing the pitches to make sure they are comfortable."
                onClose={() => setModalOpen(false)}
                open={modalOpen}
                closeText="Cancel"
                confirmText="Restart"
                onConfirm={restart || (() => null)}
            />
        </MessagePage>
    );
};

export default RangeSelectionPage;
