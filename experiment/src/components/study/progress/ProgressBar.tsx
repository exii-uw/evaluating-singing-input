import React from 'react';
import { LinearProgress } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';

interface Props {
    progress: number; // number from 0 to 100
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        height: '0.5rem',
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%'
    }
}));

const ProgressBar = ({ progress }: Props): React.ReactElement<Props> => {
    const classes = useStyles();
    return <LinearProgress variant="determinate" value={progress} className={classes.root} />;
};

export default ProgressBar;
