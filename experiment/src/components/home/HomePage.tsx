import Page from '../page/Page';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import React from 'react';
import ButtonBox from '../common/ButtonBox';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import { DASHBOARD_ROUTE, SIGNIN_ROUTE, SIGNUP_ROUTE } from '../../routes';
import { currUser$ } from '../auth/observableUser';
import { getAuth } from 'firebase/auth';
import UnsupportedBrowserAlert from '../page/UnsupportedBrowserAlert';

const useStyles = makeStyles<Theme>((theme) => ({
    highlightBox: {
        margin: theme.spacing(5, 0),
        padding: theme.spacing(2, 5),
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius
    },
    backgroundBox: {
        fontStyle: 'italic'
    }
}));

const HomePage = (): React.ReactElement => {
    const classes = useStyles();
    const history = useHistory();
    const [loggedIn, setLoggedIn] = React.useState(false);

    React.useEffect(() => {
        const sub = currUser$.subscribe((user) => setLoggedIn(!!user));
        return () => sub.unsubscribe();
    }, [setLoggedIn]);

    const isUnsupported = navigator.userAgent.indexOf('Chrome') === -1;
    const signInButton = (
        <Button disabled={isUnsupported} onClick={() => history.push(loggedIn ? DASHBOARD_ROUTE : SIGNIN_ROUTE)}>
            {loggedIn ? 'Go to Dashboard' : 'Sign In'}
        </Button>
    );

    return (
        <Page header="Sing UI" title="Sing UI" buttons={signInButton}>
            <p>
                Imagine singing to control your computer. Sound interesting? We’re conducting a study to see if it’s possible for both
                singers and non-singers. Read on for more details!
            </p>
            <hr />
            <p>
                You are invited to participate in a research study examining methods for people to interact with computers and other digital
                devices.
            </p>
            <p>This study examines different ways to interact with a computer using singing and other musical sounds.</p>
            <p>
                You will complete a series of simple tasks, each taking only a few seconds, where you sing or hum to interact with a
                computer.
            </p>
            <p>
                You will be remunerated $20 CAD via an Amazon gift card for completing the first hour-long session. If you are invited to
                participate in follow-up sessions, you will be remunerated $10 for each half-hour follow-up session.
            </p>
            <div className={classes.highlightBox}>
                <p>
                    You will need a working <b>microphone</b>, headphones, laptop/desktop with Google Chrome, phone, and{' '}
                    <b>a quiet place</b> to complete these tasks.
                </p>
                <p>
                    Make sure to <b>turn off any fans</b> or air conditioners making noise before starting the experiment.
                </p>
            </div>
            <p>This study has been reviewed and received ethics clearance through a University of Waterloo Research Ethics Board.</p>
            {loggedIn ? (
                <div className={classes.highlightBox}>
                    <p>You have already signed up and are currently logged in.</p>
                    <ButtonBox>
                        <Button onClick={() => getAuth().signOut()}>Sign Out</Button>
                        <Button variant="contained" color="primary" onClick={() => history.push(DASHBOARD_ROUTE)}>
                            Go to Dashboard
                        </Button>
                    </ButtonBox>
                </div>
            ) : (
                <div className={classes.highlightBox}>
                    <p>
                        {isUnsupported
                            ? 'Your browser is not supported. Visit this page in Chrome on a laptop or desktop to sign up.'
                            : 'To sign up, you will need to perform a one-minute system test, sign a consent form, and provide your email address.'}
                    </p>
                    <ButtonBox>
                        {signInButton}
                        <Button disabled={isUnsupported} variant="contained" color="primary" onClick={() => history.push(SIGNUP_ROUTE)}>
                            Sign Up
                        </Button>
                    </ButtonBox>
                </div>
            )}
            <div className={classes.backgroundBox}>
                <hr />
                <p>
                    If you have any questions regarding this study, or would like additional information to assist you in reaching a
                    decision about participation, please contact a member of the research team listed below.
                </p>
                <p>Graeme Zinck, Master’s student, gzinck@uwaterloo.ca</p>
                <p>Dr. Daniel Vogel, Associate Professor, 519-888-4567 ext. 33561, dvogel@uwaterloo.ca</p>
                <p>School of Computer Science, University of Waterloo</p>
            </div>
            <UnsupportedBrowserAlert />
        </Page>
    );
};

export default HomePage;
