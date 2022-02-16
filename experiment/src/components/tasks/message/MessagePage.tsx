import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import Page from '../../page/Page';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';

export interface MessageProps {
    header: string;
    title?: string;
    text?: string;
    children?: React.ReactNode;
    onComplete?: () => void;
    isLoading?: boolean;
    buttons?: React.ReactNode;
}

const useStyles = makeStyles<Theme>((theme) => ({
    messageBox: {
        width: '100%',
        boxSizing: 'border-box',
        maxWidth: '50rem',
        padding: theme.spacing(6, 3),
        margin: theme.spacing(4, 0),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        '& > p': {
            margin: theme.spacing(1, 0)
        }
    },
    buttonBox: {
        margin: theme.spacing(2, 0, 0),
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        '& > *': {
            margin: theme.spacing(0, 2)
        }
    },
    loading: {
        marginRight: theme.spacing(1)
    }
}));

const MessagePage = ({ header, title, text, children, onComplete, isLoading, buttons }: MessageProps): React.ReactElement<MessageProps> => {
    const classes = useStyles();
    return (
        <Page header={header} title={title || header}>
            <Card className={classes.messageBox}>
                {text && (
                    <Typography align="center" gutterBottom>
                        {text}
                    </Typography>
                )}
                {children}
                <div className={classes.buttonBox}>
                    {buttons}
                    {onComplete && (
                        <Button onClick={onComplete} variant="contained" color="primary" disabled={isLoading}>
                            {isLoading && <CircularProgress className={classes.loading} size="1rem" />}
                            Next
                        </Button>
                    )}
                </div>
            </Card>
        </Page>
    );
};

export default MessagePage;
