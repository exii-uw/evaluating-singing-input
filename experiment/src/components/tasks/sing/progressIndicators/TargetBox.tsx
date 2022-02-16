import React from 'react';
import Card from '@material-ui/core/Card';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../../theme';
import clsx from 'clsx';

interface Props {
    children: React.ReactNode;
    variant: '' | 'success' | 'failure';
    height: string;
}

const useStyles = makeStyles<Theme, Props>((theme) => ({
    root: {
        width: '100%',
        boxSizing: 'border-box',
        marginBottom: theme.spacing(2),
        padding: theme.spacing(3),
        position: 'relative',
        maxWidth: '50rem'
    },
    success: {
        backgroundColor: theme.palette.success.dark
    },
    failure: {
        backgroundColor: theme.palette.error.dark
    },
    content: ({ height }) => ({
        minHeight: height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        textAlign: 'center'
    })
}));

const TargetBox = (props: Props): React.ReactElement<Props> => {
    const classes = useStyles(props);
    return (
        <Card className={clsx(classes.root, classes[props.variant])}>
            <div className={classes.content}>{props.children}</div>
        </Card>
    );
};

TargetBox.defaultProps = {
    variant: '',
    height: 'auto'
};

export default TargetBox;
