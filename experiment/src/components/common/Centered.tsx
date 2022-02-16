import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';

interface Props {
    children: React.ReactNode;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    }
}));

const Centered = ({ children }: Props): React.ReactElement => {
    const classes = useStyles();
    return <div className={classes.root}>{children}</div>;
};

export default Centered;
