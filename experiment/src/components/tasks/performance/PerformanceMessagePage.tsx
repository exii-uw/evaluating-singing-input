import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import { SingTaskResult } from '../../../utils/rxjs/taskProgress';
import MessagePage from '../message/MessagePage';
import { getStudyTaskResults, StudyResult } from '../../../utils/clients/studyClient';
import { studyId } from '../../study/studyProps/studyId';
import { Alert } from '@material-ui/lab';
import { combineLatest } from 'rxjs';
import TaskPerformanceRow from './TaskPerformanceRow';
import { SingResults } from '../../study/Study';

interface Task {
    label: string;
    id: string;
}

export interface PerformanceMessageProps {
    studyID: studyId;
    tasks: Task[];
    header: string;
    title: string;
    multiAttempt?: boolean;
    onComplete?: () => void;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        width: '90%',
        position: 'relative'
    }
}));

const PerformanceMessagePage = ({ studyID, tasks, header, title, multiAttempt, onComplete }: PerformanceMessageProps) => {
    const classes = useStyles();
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [results, setResults] = React.useState<SingTaskResult<any>[][]>([]);

    React.useEffect(() => {
        combineLatest(tasks.map(({ id }) => getStudyTaskResults(studyID, id))).subscribe((results) => {
            setIsLoading(false);
            if (!results.every((r) => r !== null)) {
                setError(
                    'Performance cannot be displayed because the task was not recorded as complete. Please contact an experiment facilitator for help (graeme.zinck@gmail.com).'
                );
            } else {
                // None of the items are null because of the first part of the if
                setResults(results.map((r) => ((r as StudyResult).details as SingResults).results));
            }
        });
    }, [studyID, tasks, setIsLoading, setResults, setError]);

    return (
        <MessagePage header={header} title={title} onComplete={onComplete}>
            <div className={classes.root}>
                {tasks.map(({ label }, idx) => (
                    <TaskPerformanceRow
                        key={label}
                        header={label}
                        multiAttempt={multiAttempt}
                        isLoading={isLoading}
                        result={idx < results.length ? results[idx] : []}
                    />
                ))}
                {error && <Alert severity="error">{error}</Alert>}
            </div>
        </MessagePage>
    );
};

PerformanceMessagePage.defaultProps = {
    multiAttempt: true
};

export default PerformanceMessagePage;
