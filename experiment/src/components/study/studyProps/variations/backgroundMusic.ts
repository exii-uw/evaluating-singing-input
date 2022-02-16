import { StudySingTask } from '../../studyTasks';

export const varyBackgroundMusic = (taskFunc: () => StudySingTask): StudySingTask[] => {
    return Array(2)
        .fill(0)
        .map((_, i) => {
            const task = taskFunc();
            return {
                ...task,
                id: `${task.id}-${i === 0 ? 'with' : 'without'}-music`,
                props: { ...task.props, hasBackground: i === 0 }
            };
        });
};
