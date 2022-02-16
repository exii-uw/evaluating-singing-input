import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import DashboardIcon from '@material-ui/icons/Dashboard';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import { DASHBOARD_ROUTE, SIGNIN_ROUTE, SIGNUP_ROUTE } from '../../routes';
import List from '@material-ui/core/List';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import { getAuth } from 'firebase/auth';
import { ListItem } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { currUser$ } from '../auth/observableUser';

const useStyles = makeStyles<Theme>((theme) => ({
    menuBtn: {},
    drawer: {
        width: '17rem'
    },
    header: {
        padding: theme.spacing(2)
    },
    h3: {
        padding: theme.spacing(2, 2, 0, 2)
    },
    link: {
        color: theme.palette.primary.main,
        '&:hover, &:focus, &:active': {
            color: theme.palette.primary.light
        }
    }
}));

const Drawer = (): React.ReactElement => {
    const classes = useStyles();
    const history = useHistory();
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [loggedIn, setLoggedIn] = React.useState(false);

    React.useEffect(() => {
        const sub = currUser$.subscribe((user) => setLoggedIn(!!user));
        return () => sub.unsubscribe();
    }, [setLoggedIn]);

    const routeTo = (url: string) => () => {
        setMenuOpen(false);
        history.push(url);
    };

    return (
        <>
            <IconButton className={classes.menuBtn} aria-label="navigation" onClick={() => setMenuOpen((o) => !o)}>
                <MenuIcon />
            </IconButton>
            <SwipeableDrawer onClose={() => setMenuOpen(false)} onOpen={() => setMenuOpen(true)} open={menuOpen}>
                <div className={classes.drawer}>
                    <div className={classes.header}>
                        <h2>Sing UI</h2>
                        <p>
                            An experiment by{' '}
                            <a className={classes.link} href="https://graemezinck.ca">
                                Graeme Zinck
                            </a>
                            .
                        </p>
                    </div>
                    <Divider />
                    {loggedIn ? (
                        <List>
                            <ListItem button onClick={routeTo(DASHBOARD_ROUTE)}>
                                <ListItemIcon>
                                    <DashboardIcon />
                                </ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItem>
                            <ListItem
                                button
                                onClick={() => {
                                    getAuth().signOut();
                                    if (history.location.pathname !== '/')
                                        history.push(`${SIGNIN_ROUTE}?next=${history.location.pathname}`);
                                }}
                            >
                                <ListItemIcon>
                                    <AccountCircleIcon />
                                </ListItemIcon>
                                <ListItemText primary="Sign out" />
                            </ListItem>
                        </List>
                    ) : (
                        <List>
                            <ListItem button onClick={routeTo(SIGNIN_ROUTE)}>
                                <ListItemIcon>
                                    <AccountCircleIcon />
                                </ListItemIcon>
                                <ListItemText primary="Sign in" />
                            </ListItem>
                            <ListItem button onClick={routeTo(SIGNUP_ROUTE)}>
                                <ListItemIcon>
                                    <AccountCircleIcon />
                                </ListItemIcon>
                                <ListItemText primary="Sign up" />
                            </ListItem>
                        </List>
                    )}
                </div>
            </SwipeableDrawer>
        </>
    );
};

export default Drawer;
