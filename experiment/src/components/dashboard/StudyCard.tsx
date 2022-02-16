import React from 'react';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';

export enum StudyStatus {
    AVAILABLE = 'AVAILABLE',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    LOCKED = 'LOCKED'
}

interface Props {
    name: string;
    description: string;
    time: number; // in minutes
    onStart: () => void;
    status: StudyStatus;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        margin: theme.spacing(2, 0),
        padding: theme.spacing(3)
    },
    bottom: {
        marginTop: theme.spacing(1),
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        '& > *': {
            marginLeft: theme.spacing(2)
        }
    }
}));

const convertTime = (n: number) => {
    if (n <= 1) return '1 min';
    if (n <= 5) return '<5 mins';
    if (n <= 10) return '<10 mins';
    if (n <= 15) return '<15 mins';
    if (n <= 20) return '<20 mins';
    if (n <= 25) return '<25 mins';
    if (n <= 30) return '<30 mins';
};

const getButton = (status: StudyStatus, onClick: () => void) => {
    switch (status) {
        case StudyStatus.AVAILABLE:
            return (
                <Button variant="contained" color="primary" onClick={onClick}>
                    Start
                </Button>
            );
        case StudyStatus.IN_PROGRESS:
            return (
                <Button variant="contained" color="primary" onClick={onClick}>
                    Resume
                </Button>
            );
        case StudyStatus.LOCKED:
            return (
                <Button disabled onClick={onClick}>
                    Locked
                </Button>
            );
        case StudyStatus.COMPLETED:
            return (
                <Button disabled onClick={onClick}>
                    Completed
                </Button>
            );
    }
};

const StudyCard = ({ name, description, time, onStart, status }: Props): React.ReactElement<Props> => {
    const classes = useStyles();

    return (
        <Card className={classes.root}>
            <Typography variant="h6">{name}</Typography>
            <Typography>{description}</Typography>
            <div className={classes.bottom}>
                <Typography variant="caption">{convertTime(time)}</Typography>
                {getButton(status, onStart)}
            </div>
        </Card>
    );
};

export default StudyCard;
