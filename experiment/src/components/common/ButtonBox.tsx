import React from 'react';
import { Theme } from '../theme';
import makeStyles from '@material-ui/core/styles/makeStyles';

interface Props {
    children: React.ReactNode;
    margin?: number;
}

const useStyles = makeStyles<Theme, Props>((theme) => ({
    buttonBox: ({ margin }) => ({
        margin: theme.spacing(margin || 2, 0),
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        '& > *': {
            margin: theme.spacing(0, 2)
        }
    })
}));

const ButtonBox = (props: Props): React.ReactElement<Props> => {
    const classes = useStyles(props);
    return <div className={classes.buttonBox}>{props.children}</div>;
};

export default ButtonBox;
