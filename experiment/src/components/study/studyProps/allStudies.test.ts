import { allStudies } from './allStudies';
import { StudyTaskType } from '../studyTasks';
import { StudyProps } from '../Study';

describe('studies array', () => {
    it('has unique ids', () => {
        const set = new Set();
        allStudies.forEach(({ id }) => {
            if (set.has(id)) throw new Error(`there are two studies with id ${id}`);
            set.add(id);
        });
    });

    it('has unique names', () => {
        const set = new Set();
        allStudies.forEach(({ name }) => {
            if (set.has(name)) throw new Error(`there are two studies with name ${name}`);
            set.add(name);
        });
    });
});

describe.each(allStudies.map((study) => [study.id, study] as [string, StudyProps]))('study %s', (id, { getTasks }) => {
    it('has unique ids for all tasks', () => {
        const tasks = getTasks(0);
        const set = new Set();
        tasks.forEach(({ id }) => {
            if (set.has(id)) throw new Error(`there are two tasks with the id ${id}`);
            set.add(id);
        });
    });

    it('has performance messages that reference previous sing tasks', () => {
        const tasks = getTasks(0);
        const set = new Set();
        tasks.forEach((task) => {
            // Only add a task to previous if it was a sing task
            if (task.type === StudyTaskType.SING) set.add(task.id);
            else if (task.type === StudyTaskType.PERFORMANCE_MESSAGE) {
                if (task.props.studyID !== id) throw new Error(`performance message references a different study ${task.props.studyID}`);
                task.props.tasks.forEach(({ id }) => {
                    if (!set.has(id)) throw new Error(`performance message references a non-existent or future task ${id}`);
                });
            }
        });
    });

    it('reorders background music conditions for sing evaluations', () => {
        // Evaluations have no prompts and 1 attempt
        const tasks0 = getTasks(0);
        const tasks1 = getTasks(1);
        for (let i = 0; i < tasks0.length; i++) {
            const t0 = tasks0[i];
            const t1 = tasks1[i];
            if (t0.type === StudyTaskType.SING && !t0.props.withPrompts && t0.props.maxAttempts === 1) {
                if (t1.type !== StudyTaskType.SING)
                    throw new Error(`task ${i} was not a sing task with latin square 1, but it was for latin square 0`);

                // Ensure t1 is also an evaluation
                if (t1.props.withPrompts || !t1.props.maxAttempts || t1.props.maxAttempts > 1)
                    throw new Error(`task ${i} with id ${t0.id} was not an evaluation for latin square 1, but it was for latin square 0`);

                // Ensure different background status
                if (t0.props.hasBackground === t1.props.hasBackground)
                    throw new Error(`task ${i} with id ${t0.id} needs to use a latin square for background music`);
            }
        }
    });

    it('reorders targets for sing tasks', () => {
        const tasks0 = getTasks(0);
        const tasks1 = getTasks(1);
        for (let i = 0; i < tasks0.length; i++) {
            const t0 = tasks0[i];
            const t1 = tasks1[i];
            if (t0.type === StudyTaskType.SING) {
                if (t1.type !== StudyTaskType.SING)
                    throw new Error(`task ${i} with id ${t0.id} was not a sing task with latin square 1, but it was for latin square 0`);
                const t0Targets = t0.props.targets.map((t) => t.value);
                const t1Targets = t1.props.targets.map((t) => t.value);
                const isIdentical = t0Targets.every((val, idx) => t1Targets[idx] === val);

                if (isIdentical) throw new Error(`task ${i} with id ${t0.id} had an identical targets for both latin squares 0 and 1`);
            }
        }
    });
});
