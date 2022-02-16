import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import TopBar from '../page/TopBar';
import ParticipantProgressTable from './ParticipantProgressTable';
import Button from '@material-ui/core/Button';
import { getAuth } from 'firebase/auth';
import { HOME_ROUTE } from '../../routes';
import React from 'react';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary
    },
    main: {
        margin: theme.spacing(12, 5, 5)
    }
}));

const AdminPage = () => {
    const classes = useStyles();
    const history = useHistory();

    const signOutButton = (
        <Button
            onClick={() => {
                getAuth().signOut();
                history.push(HOME_ROUTE);
            }}
        >
            Sign Out
        </Button>
    );

    return (
        <div className={classes.root}>
            <TopBar header="Admin Dashboard">{signOutButton}</TopBar>
            <div className={classes.main}>
                <ParticipantProgressTable />
            </div>
        </div>
    );
};

export default AdminPage;
