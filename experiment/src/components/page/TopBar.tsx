import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Drawer from './Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';

interface Props {
    header: string;
    children?: React.ReactNode;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper
    },
    title: {
        marginLeft: theme.spacing(1),
        flexGrow: 1
    }
}));

const TopBar = ({ header, children }: Props): React.ReactElement<Props> => {
    const classes = useStyles();
    return (
        <AppBar position="fixed" className={classes.root}>
            <Toolbar>
                <Drawer />
                <Typography variant="h6" className={classes.title}>
                    {header}
                </Typography>
                {children}
            </Toolbar>
        </AppBar>
    );
};

export default TopBar;
