import React from 'react';
import { smoothPitch } from '../../../utils/rxjs/smoothPitch';
import ScrollingPitchMeter from './ScrollingPitchMeter';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import VoiceDetector from '../../detector/VoiceDetector';
import { audioContext } from '../../audio/audioContext';
import Page from '../../page/Page';

const useStyles = makeStyles<Theme>(() => ({
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }
}));

const Tuner = (): React.ReactElement => {
    const classes = useStyles();
    const ctx = React.useContext(audioContext);
    const [note, setNote] = React.useState('Sing or hum to begin');
    const [noteNum, setNoteNum] = React.useState(0);
    const [error, setError] = React.useState(0);

    // Get updates as the user sings
    React.useEffect(() => {
        const voiceDetector = new VoiceDetector(ctx.audioContext);
        const subscription = voiceDetector
            .getState()
            .pipe(smoothPitch())
            .subscribe((state) => {
                setNote(state.pitch.note);
                setNoteNum(state.pitch.noteNum);
                setError(state.pitch.error);
            });

        return () => {
            voiceDetector.cleanup();
            subscription.unsubscribe();
        };
    }, [ctx.audioContext]);

    return (
        <Page header="Tuner">
            <div className={classes.root}>
                <h2>{note}</h2>
                <p>Error: {Math.round(error * 100)}%</p>
                <ScrollingPitchMeter noteNum={noteNum} error={error} />
            </div>
        </Page>
    );
};

export default Tuner;
