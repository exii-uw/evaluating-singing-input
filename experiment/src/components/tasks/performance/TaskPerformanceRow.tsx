import { SingTaskResult } from '../../../utils/rxjs/taskProgress';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';

interface Props {
    header: string;
    multiAttempt?: boolean;
    isLoading: boolean;
    result: SingTaskResult<any>[];
}

const useStyles = makeStyles<Theme>((theme) => ({
    task: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: theme.spacing(3)
    },
    h4: {
        width: '100%'
    },
    progressBox: {
        width: '10rem',
        textAlign: 'center',
        margin: '1rem'
    },
    circleBox: {
        position: 'relative'
    },
    progressNotLoaded: {
        color: theme.palette.grey[400]
    },
    progressOK: {
        color: theme.palette.success.main
    },
    progressBad: {
        color: theme.palette.error.main
    },
    abs: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    percentage: {
        fontWeight: 300
    },
    description: {
        marginTop: '1rem'
    }
}));

const passingGrade = 60;

const TaskPerformanceRow = ({ header, multiAttempt, isLoading, result }: Props) => {
    const classes = useStyles();

    const numDone = result.reduce((acc, curr) => (curr.success ? acc + 1 : acc), 0);
    const numAttempts = result.reduce((acc, curr) => acc + curr.attempts, 0);
    const numSingle = result.reduce((acc, curr) => (curr.success && curr.attempts === 1 ? acc + 1 : acc), 0);

    const stats = [
        {
            percentage: (numDone * 100) / result.length,
            message: `${numDone}/${result.length} Tasks Successful`
        },
        ...(multiAttempt
            ? [
                  {
                      percentage: (numSingle * 100) / result.length,
                      message: `${numSingle}/${result.length} Tasks Successful in One Attempt`
                  },
                  {
                      percentage: (numDone * 100) / numAttempts,
                      message: `${numDone}/${numAttempts} Attempts Successful`
                  }
              ]
            : [])
    ];

    return (
        <div className={classes.task}>
            <Typography variant="h4" align="center" className={classes.h4}>
                {header}
            </Typography>
            {stats.map(({ percentage, message }, idx) => (
                <div className={classes.progressBox} key={`percentage-${idx}`}>
                    <div className={classes.circleBox}>
                        <CircularProgress
                            variant={isLoading ? 'indeterminate' : 'determinate'}
                            size="10rem"
                            thickness={2}
                            value={percentage}
                            className={
                                isLoading || Number.isNaN(percentage)
                                    ? classes.progressNotLoaded
                                    : percentage < passingGrade
                                    ? classes.progressBad
                                    : classes.progressOK
                            }
                        />
                        <div className={classes.abs}>
                            <Typography variant="h4" className={classes.percentage}>
                                {Number.isNaN(percentage) ? '...' : `${Math.round(percentage)}%`}
                            </Typography>
                        </div>
                    </div>
                    <Typography variant="h6" className={classes.description}>
                        {Number.isNaN(percentage) ? '...' : message}
                    </Typography>
                </div>
            ))}
        </div>
    );
};

export default TaskPerformanceRow;
