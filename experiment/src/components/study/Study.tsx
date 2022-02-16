import React from 'react';
import { StudySingTask, StudyTask, StudyTaskType } from './studyTasks';
import MessagePage from '../tasks/message/MessagePage';
import { useHistory } from 'react-router-dom';
import { DASHBOARD_ROUTE, SIGNIN_ROUTE } from '../../routes';
import SingTasks from '../tasks/sing/SingTasks';
import Calibration from '../tasks/calibration/Calibration';
import Form from '../tasks/form/Form';
import { studyId } from './studyProps/studyId';
import ProgressBar from './progress/ProgressBar';
import { SingTaskResult } from '../../utils/rxjs/taskProgress';
import { TaskTarget } from '../tasks/sing/target';
import HeadphoneMessagePage from '../tasks/message/HeadphoneMessagePage';
import VideoPage from '../tasks/video/VideoPage';
import RecordPage from '../tasks/record/RecordPage';
import PerformanceMessagePage from '../tasks/performance/PerformanceMessagePage';
import { getParticipant } from '../../utils/clients/participantsClient';
import { getStudyStatus, saveAudioFile, setStudyStatus, setStudyTaskResults, StudyResult } from '../../utils/clients/studyClient';

export interface SingResults {
    results: SingTaskResult<TaskTarget>[];
    url: string;
}

export interface StudyProps {
    getTasks: (latinSquare: number) => StudyTask[];
    name: string;
    id: studyId;
    dependencies: studyId[];
    description: string;
    time: number;
}

const getNumTasks = (tasks: StudyTask[], end?: number): number =>
    tasks.slice(0, end).reduce((numTasks, task) => numTasks + (task.type === StudyTaskType.SING ? task.props.targets.length : 1), 0);

const Study = ({ getTasks, name, id }: StudyProps): React.ReactElement<StudyProps> => {
    const history = useHistory();
    const [tasks, setTasks] = React.useState<StudyTask[]>([]);
    const numTasks = React.useMemo(() => getNumTasks(tasks), [tasks]);
    const [taskIdx, setTaskIdx] = React.useState(-1);
    const [progress, setProgress] = React.useState(0);
    const [singOffset, setSingOffset] = React.useState(0); // Offset the progress for sing tasks with multiple tasks

    const onComplete = React.useCallback(
        (details: any) => {
            // Update status of the study
            setStudyStatus(id, {
                isDone: taskIdx === tasks.length - 1,
                nextIdx: taskIdx + 1,
                // Conditionally add the end time fi we reached the end
                ...(taskIdx === tasks.length - 1 ? { end: new Date() } : {})
            }).subscribe({
                error: (err) => console.error('Critical error saving study status to database:', err)
            });

            // Send results to database
            const results: StudyResult = {
                type: tasks[taskIdx].type,
                studyId: id,
                taskIdx,
                taskId: tasks[taskIdx].id,
                details,
                doneAt: new Date()
            };
            setStudyTaskResults(id, tasks[taskIdx].id, results).subscribe({
                complete: () => {
                    // Move to next task
                    setProgress((p) => p + 1);
                    setTaskIdx(taskIdx + 1);
                },
                error: (err) => console.error('Critical error saving study task results to database:', err)
            });
        },
        [id, taskIdx, tasks]
    );

    const recordOnComplete = React.useCallback(
        (blob: Blob) => {
            saveAudioFile(id, tasks[taskIdx].id, blob).subscribe((result) => onComplete(result.metadata.fullPath));
        },
        [onComplete, id, taskIdx, tasks]
    );

    const singOnComplete = React.useCallback(
        (results: SingTaskResult<TaskTarget>[], blob?: Blob) => {
            const task = tasks[taskIdx] as StudySingTask;
            if (results.length === task.props.targets.length) {
                setProgress((p) => p + task.props.targets.length - 1); // - 1 because one is added in the onComplete() function
                setSingOffset(0);
                if (blob) {
                    saveAudioFile(id, tasks[taskIdx].id, blob).subscribe((result) =>
                        onComplete({ results, url: result.metadata.fullPath })
                    );
                } else onComplete({ results });
            } else {
                setSingOffset(results.length);
            }
        },
        [tasks, id, taskIdx, onComplete]
    );

    const onError = React.useCallback(
        (err: any) => {
            if (
                err.message === 'participants document does not exist' ||
                err.message.includes('participants document does not have a user')
            )
                history.push(DASHBOARD_ROUTE);
            else if (err.name === 'TimeoutError') history.push(`${SIGNIN_ROUTE}?next=${history.location.pathname}`);
            else console.error('Critical error retrieving data from database:', err);
        },
        [history]
    );

    // Get the latin square so we can get the ordered tasks
    React.useEffect(() => {
        setTasks([]);
        const sub = getParticipant().subscribe({
            next: (participant) => setTasks(getTasks(participant.idx)),
            error: onError
        });

        return () => sub.unsubscribe();
    }, [onError, getTasks]);

    // Get our starting point by reading the past study results
    const [isLoading, setIsLoading] = React.useState(true);
    const [startIdx, setStartIdx] = React.useState(0);

    // Get the study progress
    React.useEffect(() => {
        setTaskIdx(-1);
        setIsLoading(true);

        const sub = getStudyStatus(id).subscribe({
            next: (data) => {
                setIsLoading(false);
                if (data) {
                    setStartIdx(data.nextIdx);
                }
            },
            error: onError
        });

        return () => sub.unsubscribe();
    }, [id, onError]);

    let page;

    if (taskIdx === -1) {
        const text =
            isLoading || tasks.length === 0
                ? 'The study is loading...'
                : startIdx === 0
                ? 'Click "Next" to start the study'
                : 'Click "Next" to resume the study';
        page = (
            <MessagePage
                header={name}
                text={text}
                isLoading={isLoading || tasks.length === 0}
                onComplete={() => {
                    setTaskIdx(startIdx);
                    setProgress(getNumTasks(tasks, startIdx));
                    if (startIdx === 0) {
                        setStudyStatus(id, {
                            isDone: false,
                            nextIdx: 0,
                            start: new Date()
                        }).subscribe({
                            error: (err) => console.error('Critical error saving study status to database:', err)
                        });
                    }
                }}
            />
        );
    } else if (taskIdx >= tasks.length) {
        page = (
            <MessagePage
                header={name}
                title="Tasks complete"
                text={`Congrats! You have completed this set of tasks. Click "Next" to return to the dashboard.`}
                isLoading={isLoading}
                onComplete={() => history.push(DASHBOARD_ROUTE)}
            />
        );
    } else {
        const task = tasks[taskIdx];
        switch (task.type) {
            case StudyTaskType.SING:
                page = <SingTasks {...task.props} header={name} onComplete={singOnComplete} />;
                break;
            case StudyTaskType.CALIBRATE:
                page = <Calibration header={name} onComplete={onComplete} />;
                break;
            case StudyTaskType.FORM:
                page = <Form {...task.props} header={name} onComplete={onComplete} />;
                break;
            case StudyTaskType.MESSAGE:
                page = <MessagePage {...task.props} header={name} onComplete={() => onComplete('confirmed')} />;
                break;
            case StudyTaskType.HEADPHONE_MESSAGE:
                page = <HeadphoneMessagePage {...task.props} header={name} onComplete={() => onComplete('confirmed')} />;
                break;
            case StudyTaskType.PERFORMANCE_MESSAGE:
                page = <PerformanceMessagePage {...task.props} header={name} onComplete={() => onComplete('confirmed')} />;
                break;
            case StudyTaskType.VIDEO:
                page = <VideoPage {...task.props} header={name} onComplete={() => onComplete('confirmed')} />;
                break;
            case StudyTaskType.RECORD:
                page = <RecordPage {...task.props} header={name} onComplete={recordOnComplete} />;
                break;
        }
    }

    return (
        <>
            {page}
            <ProgressBar progress={((progress + singOffset) / numTasks) * 100} />
        </>
    );
};

export default Study;
