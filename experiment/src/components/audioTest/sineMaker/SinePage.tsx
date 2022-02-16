import React from 'react';
import Page from '../../page/Page';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import { convertNoteToString } from '../../../utils/pitchConverter';
import { notesToTestAudio } from '../constants';
import { getAudioURL } from '../../audio/getAudioURL';
import { TaskType } from '../../../utils/rxjs/recognizers/universalRecognizer';

const useStyles = makeStyles<Theme>(() => ({
    buttonBox: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    button: {
        width: '50%',
        height: 'calc(50vh - 7rem)',
        borderRadius: 0,
        fontSize: '2rem',
        border: '1px #555 solid'
    }
}));

const SinePage = (): React.ReactElement => {
    const classes = useStyles();
    const audioRefs = React.useRef(notesToTestAudio.map(() => React.createRef<HTMLAudioElement>()));
    const playNote = (idx: number) => {
        audioRefs.current.forEach((ref, i) => {
            if (ref.current === null) return;
            else if (i === idx) {
                ref.current.currentTime = 0;
                ref.current.play();
            } else if (!ref.current.ended) {
                ref.current.currentTime = 0;
                ref.current.pause();
            }
        });
    };
    // const { toggle } = useSine();
    return (
        <Page header="Audio Test—Phone">
            <div className={classes.buttonBox}>
                {notesToTestAudio.map((noteNum, idx) => (
                    <Button className={classes.button} key={noteNum} onClick={() => playNote(idx)}>
                        <audio
                            ref={audioRefs.current[idx]}
                            src={getAudioURL({ target: { type: TaskType.PITCH, value: noteNum }, keyNumber: 0, octave: 0 })}
                        />
                        {convertNoteToString(noteNum)}
                    </Button>
                ))}
            </div>
        </Page>
    );
};

export default SinePage;
