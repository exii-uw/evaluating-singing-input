import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import { convertNoteToString } from '../../../utils/pitchConverter';
import { Theme } from '../../theme';

interface PitchMeterProps {
    noteNum: number;
    error: number;
}

const containerWidth = 30;
const containerHeight = 20;
const focusSize = 10;
const useStyles = makeStyles<Theme, PitchMeterProps>((theme: Theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        width: `${containerWidth}rem`,
        height: `${containerHeight}rem`,
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden'
    },
    focus: {
        backgroundColor: theme.palette.background.paper,
        width: `${focusSize}rem`,
        height: `${focusSize}rem`,
        position: 'absolute',
        left: `calc((${containerWidth}rem - ${focusSize}rem) / 2)`,
        top: `calc((${containerHeight}rem - ${focusSize}rem) / 2)`,
        borderRadius: '3rem'
    },
    notes: ({ error, noteNum }) => ({
        position: 'absolute',
        width: '100%',
        left: `calc(${containerWidth / 3}rem * (1 - ${error}) - (${containerWidth / 3}rem * ${noteNum}))`,
        transition: 'left 0.1s',
        height: theme.typography.h4.fontSize,
        top: `calc((${containerHeight}rem - ${theme.typography.h4.fontSize}) / 2)`,
        fontSize: theme.typography.h4.fontSize,
        display: 'flex',
        '& div': {
            width: `${containerWidth / 3}rem`,
            textAlign: 'center',
            flexShrink: 0
        },
        color: theme.palette.text.secondary
    }),
    current: {
        color: theme.palette.text.primary
    }
}));

const allNotes = new Array<string>(88).fill('').map((_, id) => convertNoteToString(id, false));

const ScrollingPitchMeter = (props: PitchMeterProps): React.ReactElement<PitchMeterProps> => {
    const classes = useStyles(props);
    return (
        <div className={classes.root}>
            <div className={classes.focus} />
            <div className={classes.notes}>
                {allNotes.map((note, idx) => (
                    <div key={`${note}-${idx}`} className={idx === props.noteNum ? classes.current : ''}>
                        {note}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScrollingPitchMeter;
