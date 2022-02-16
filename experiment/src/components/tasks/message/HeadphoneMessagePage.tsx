import React from 'react';
import MessagePage, { MessageProps } from './MessagePage';
import Typography from '@material-ui/core/Typography';
import HeadsetMicIcon from '@material-ui/icons/HeadsetMic';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';

const useStyles = makeStyles<Theme>((theme) => ({
    icon: {
        fontSize: '12rem',
        margin: theme.spacing(2)
    }
}));

const HeadphoneMessagePage = (props: MessageProps): React.ReactElement<MessageProps> => {
    const classes = useStyles();
    return (
        <MessagePage {...props}>
            <HeadsetMicIcon className={classes.icon} />
            <Typography align="center">
                This study requires a set of headphones or earbuds with a decent quality microphone. You also need to be in a silent room.
            </Typography>
            <Typography align="center" gutterBottom>
                <b>Put on your headphones and press "Next".</b>
            </Typography>
        </MessagePage>
    );
};

export default HeadphoneMessagePage;
