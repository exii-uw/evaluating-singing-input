import { SingTaskProps } from '../tasks/sing/possibleTasks';
import { FormProps } from '../tasks/form/Form';
import { MessageProps } from '../tasks/message/MessagePage';
import { VideoProps } from '../tasks/video/VideoPage';
import { RecordProps } from '../tasks/record/RecordPage';
import { PerformanceMessageProps } from '../tasks/performance/PerformanceMessagePage';

export enum StudyTaskType {
    SING = 'SING',
    FORM = 'FORM',
    CALIBRATE = 'CALIBRATE',
    MESSAGE = 'MESSAGE',
    HEADPHONE_MESSAGE = 'HEADPHONE_MESSAGE',
    PERFORMANCE_MESSAGE = 'PERFORMANCE_MESSAGE',
    VIDEO = 'VIDEO',
    RECORD = 'RECORD'
}

interface TaskBase {
    id: string;
}

export interface StudySingTask extends TaskBase {
    type: StudyTaskType.SING;
    props: Omit<SingTaskProps, 'header'>;
}

interface StudyFormTask extends TaskBase {
    type: StudyTaskType.FORM;
    props: Omit<FormProps, 'header'>;
}

interface StudyCalibrateTask extends TaskBase {
    type: StudyTaskType.CALIBRATE;
}

interface StudyMessageTask extends TaskBase {
    type: StudyTaskType.MESSAGE;
    props: Omit<MessageProps, 'header'>;
}

interface StudyHeadphoneMessageTask extends TaskBase {
    type: StudyTaskType.HEADPHONE_MESSAGE;
    props: Omit<MessageProps, 'header'>;
}

interface StudyPerformanceMessageTask extends TaskBase {
    type: StudyTaskType.PERFORMANCE_MESSAGE;
    props: Omit<PerformanceMessageProps, 'header'>;
}

interface StudyVideoTask extends TaskBase {
    type: StudyTaskType.VIDEO;
    props: Omit<VideoProps, 'header'>;
}

interface StudyRecordTask extends TaskBase {
    type: StudyTaskType.RECORD;
    props: Partial<RecordProps>;
}

export type StudyTask =
    | StudySingTask
    | StudyFormTask
    | StudyCalibrateTask
    | StudyMessageTask
    | StudyHeadphoneMessageTask
    | StudyPerformanceMessageTask
    | StudyVideoTask
    | StudyRecordTask;
