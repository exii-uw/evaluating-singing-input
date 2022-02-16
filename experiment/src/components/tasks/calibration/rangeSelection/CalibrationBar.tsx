import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../../theme';
import clsx from 'clsx';
import React from 'react';

interface Props {
    minNote: number;
    maxNote: number;
    status: Record<number, number>; // Map notes to a status in [0, 2] where 2 is good
}

const useStyles = makeStyles<Theme, Props>((theme) => ({
    root: {
        position: 'relative',
        width: '100%',
        height: '1rem',
        backgroundColor: theme.palette.background.paper,
        margin: theme.spacing(2, 0)
    },
    note: ({ minNote, maxNote }) => ({
        position: 'absolute',
        top: 0,
        height: '1rem',
        // Add a pixel to width to avoid floating point gaps
        width: `calc(100% / ${maxNote - minNote + 1} + 1px)`
    }),
    0: {
        backgroundColor: theme.palette.error.main
    },
    1: {
        backgroundColor: theme.palette.warning.main
    },
    2: {
        backgroundColor: theme.palette.success.main
    }
}));

const CalibrationBar = (props: Props): React.ReactElement<Props> => {
    const classes = useStyles(props);
    const { minNote, maxNote, status } = props;
    const numNotes = maxNote - minNote + 1;
    return (
        <div className={classes.root}>
            {Object.entries(status).map(([n, status]) => {
                const noteNum = +n - minNote;
                return (
                    <div
                        key={n}
                        className={clsx(classes.note, classes[status])}
                        style={{ left: `calc(100% / ${numNotes} * ${noteNum})` }}
                    />
                );
            })}
        </div>
    );
};

export default CalibrationBar;
