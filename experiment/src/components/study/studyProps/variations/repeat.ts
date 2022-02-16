import { StudyTask } from '../../studyTasks';

export function repeatEach<T>(arr: T[], times: number): T[] {
    return arr.map((item) => new Array(times).fill(item)).flat(1);
}

export function repeatTask(getTask: () => StudyTask, times: number): StudyTask[] {
    const taskId = getTask().id;
    return new Array(times).fill(0).map((_, idx) => ({
        ...getTask(),
        id: `${taskId}-${idx}`
    }));
}
