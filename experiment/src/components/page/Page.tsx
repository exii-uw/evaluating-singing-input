import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import TopBar from './TopBar';
import Typography from '@material-ui/core/Typography';

interface TaskPageProps {
    children?: React.ReactNode;
    header: string; // Shown in the menu bar
    title?: string; // Shown in the main area
    buttons?: React.ReactNode;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    main: {
        marginTop: '7rem',
        marginBottom: '7rem',
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    centered: {
        width: '90%',
        maxWidth: '50rem',
        position: 'relative'
    }
}));

// Add options using the <VolumeOptionsPopover /> if desired later on
const Page = (props: TaskPageProps): React.ReactElement<TaskPageProps> => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <TopBar header={props.header}>{props.buttons}</TopBar>
            <div className={classes.main}>
                <div className={classes.centered}>
                    {props.title && (
                        <Typography variant="h3" gutterBottom>
                            {props.title}
                        </Typography>
                    )}
                    {props.children}
                </div>
            </div>
        </div>
    );
};

export default Page;
