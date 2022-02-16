import React from 'react';
import Page from '../page/Page';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { Alert } from '@material-ui/lab';
import { from } from 'rxjs';
import { useHistory } from 'react-router-dom';
import { DASHBOARD_ROUTE, SIGNIN_ROUTE, SIGNUP_ROUTE } from '../../routes';
import Typography from '@material-ui/core/Typography';
import Centered from '../common/Centered';

interface Props {
    userExists: boolean;
    hasOppositeButton?: boolean; // Show/hide the Sign In button when you're signing up (and vice versa)
    onComplete?: () => void; // Called once user is authenticated
}

const useStyles = makeStyles<Theme>((theme) => ({
    textField: {
        margin: theme.spacing(1, 0, 2),
        width: '100%',
        maxWidth: '40rem'
    },
    alert: {
        marginBottom: theme.spacing(2)
    },
    buttonBox: {
        width: '100%',
        maxWidth: '20rem',
        display: 'flex',
        justifyContent: 'center',
        '& > *:nth-child(2)': {
            marginLeft: theme.spacing(1)
        }
    }
}));

const LoginPage = ({ userExists, hasOppositeButton, onComplete }: Props): React.ReactElement => {
    const classes = useStyles();
    const history = useHistory();
    const query = new URLSearchParams(history.location.search);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [password2, setPassword2] = React.useState('');
    const [error, setError] = React.useState<string | undefined>(undefined);

    const action = userExists ? 'Sign in' : 'Sign up';
    const oppositeAction = !userExists ? 'I already have an account' : "I don't have an account";

    const onConfirm = () => {
        if (email.length === 0) {
            setError('Enter your account email');
            return;
        }
        if (password.length === 0) {
            setError('Enter your account password');
            return;
        }

        const auth = getAuth();
        if (!userExists) {
            // Sign up
            if (password !== password2) {
                setError('Passwords do not match');
                return;
            }
            if (password.length < 5) {
                setError('Password must be at least 5 characters long');
                return;
            }

            setError(undefined);
            from<Promise<UserCredential>>(createUserWithEmailAndPassword(auth, email, password)).subscribe({
                next: () => (onComplete ? onComplete() : history.push(query.get('next') || DASHBOARD_ROUTE)),
                error: (err: Error) => setError(err.message)
            });
        } else {
            setError(undefined);
            from<Promise<UserCredential>>(signInWithEmailAndPassword(auth, email, password)).subscribe({
                next: () => (onComplete ? onComplete() : history.push(query.get('next') || DASHBOARD_ROUTE)),
                error: (err: Error) => setError(err.message)
            });
        }
    };

    return (
        <Page header={action}>
            <Typography variant="h3" gutterBottom>
                {action}
            </Typography>
            <Centered>
                <TextField
                    className={classes.textField}
                    label="Email"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    className={classes.textField}
                    label="Password"
                    type="password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {!userExists && (
                    <TextField
                        className={classes.textField}
                        label="Confirm password"
                        type="password"
                        variant="outlined"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                    />
                )}
                {error && (
                    <Alert className={classes.alert} severity="error">
                        {error}
                    </Alert>
                )}
                <div className={classes.buttonBox}>
                    {hasOppositeButton && (
                        <Button onClick={() => history.push(`${userExists ? SIGNUP_ROUTE : SIGNIN_ROUTE}${history.location.search}`)}>
                            {oppositeAction}
                        </Button>
                    )}
                    <Button variant="contained" color="primary" onClick={onConfirm}>
                        {action}
                    </Button>
                </div>
            </Centered>
        </Page>
    );
};

export default LoginPage;
