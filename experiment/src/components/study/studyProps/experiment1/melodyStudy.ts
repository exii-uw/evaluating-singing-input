import { StudyProps } from '../../Study';
import { StudyTask, StudyTaskType } from '../../studyTasks';
import { MelodyTaskTarget } from '../../../tasks/sing/target';
import { RecognizerMap, TaskType } from '../../../../utils/rxjs/recognizers/universalRecognizer';
import { FormTypes } from '../../../tasks/form/formTypes';
import { studyId } from '../studyId';
import { reorderLatinSquare, reorderRandom } from '../variations/reorder';
import { varyBackgroundMusic } from '../variations/backgroundMusic';
import { radioButtonValidator } from '../../../tasks/form/formValidators';
import { insertBetween } from '../variations/insertBetween';
import { repeatEach, repeatTask } from '../variations/repeat';
import { Melody } from '../../../../utils/rxjs/recognizers/melodyRecognizer';
import { tlxQuestions } from './tlxQuestions';

const tonicMelodies = [
    [0, 4, 2],
    [0, 4, 7],
    [0, 7, 4],
    [0, 7, 12],
    [0, 2, 4],
    [0, 5, 0],
    [0, 7, 0]
].map((intervals, id) => ({ intervals, id: `${id}` }));
const recognizers: RecognizerMap = {
    0: { type: TaskType.MELODY, melodies: tonicMelodies },
    1: { type: TaskType.PITCH },
    2: { type: TaskType.PITCH },
    3: { type: TaskType.PITCH },
    4: { type: TaskType.PITCH },
    5: { type: TaskType.PITCH },
    6: { type: TaskType.PITCH },
    7: { type: TaskType.PITCH },
    8: { type: TaskType.PITCH },
    9: { type: TaskType.PITCH },
    10: { type: TaskType.PITCH },
    11: { type: TaskType.PITCH }
};

const toTargets = (arr: Melody[]): MelodyTaskTarget[] => {
    return arr.map<MelodyTaskTarget>((melody) => ({
        type: TaskType.MELODY,
        value: melody.intervals,
        id: melody.id,
        startNote: 0
    }));
};

const embedID = 'EoyFPwVqhhI';
const breakTask = (item: StudyTask): StudyTask => ({
    id: `msg-${item.id}`,
    type: StudyTaskType.VIDEO,
    props: {
        title: 'Break',
        text: 'Feel free to take a break and drink some water before clicking "Next."',
        embedID,
        startHidden: true
    }
});

export const melodyStudyProps: StudyProps = {
    id: studyId.MELODY_STUDY,
    dependencies: [studyId.INTERVAL_STUDY],
    name: '4. Melody tasks',
    description: 'Sing sequences of three pitches to control your computer',
    time: 19,
    getTasks: (latinSquare: number) => [
        {
            id: 'headphones',
            type: StudyTaskType.HEADPHONE_MESSAGE,
            props: {
                title: 'Headphones'
            }
        },
        {
            id: 'video',
            type: StudyTaskType.VIDEO,
            props: {
                title: 'Melody task tutorial',
                text: 'Before you start performing the tasks, watch this short video demonstration.',
                embedID
            }
        },
        {
            id: 'silence-pre-evaluation',
            type: StudyTaskType.RECORD,
            props: {}
        },
        {
            id: 'msg-pre-evaluation',
            type: StudyTaskType.VIDEO,
            props: {
                title: 'Melody task pre-evaluation',
                text:
                    'The next two blocks of tasks will establish a baseline for your performance. After each block, you will have an opportunity to take a break. Your voice will be recorded for these blocks.',
                embedID,
                startHidden: true
            }
        },
        // Rearrangeable section for when there is(n't) background music
        ...insertBetween(
            reorderLatinSquare(
                varyBackgroundMusic(() => ({
                    id: `pre-evaluation`,
                    type: StudyTaskType.SING,
                    props: {
                        title: 'Melody task pre-evaluation',
                        targets: toTargets(reorderRandom([...tonicMelodies, ...tonicMelodies])),
                        recognizers,
                        withPrompts: false,
                        hideFeedback: true,
                        maxAttempts: 1,
                        isRecorded: true
                    }
                })),
                latinSquare
            ),
            breakTask
        ),
        {
            id: 'performance-pre-evaluation',
            type: StudyTaskType.PERFORMANCE_MESSAGE,
            props: {
                title: 'Pre-evaluation results',
                text: 'Recording has finished',
                multiAttempt: false,
                studyID: studyId.MELODY_STUDY,
                tasks: [
                    { id: 'pre-evaluation-with-music', label: 'With music' },
                    { id: 'pre-evaluation-without-music', label: 'Without music' }
                ]
            }
        },
        {
            id: 'silence-training',
            type: StudyTaskType.RECORD,
            props: {}
        },
        {
            id: 'msg-training-I',
            type: StudyTaskType.VIDEO,
            props: {
                title: 'Melody task training I',
                text:
                    'Your baseline performance has been recorded. The next block of tasks ask you to repeatedly perform each task to improve your performance. Audio prompts will indicate the melodies to sing. Feel free to take a break and drink some water before clicking "Next."',
                embedID,
                startHidden: true
            }
        },
        {
            id: 'training-I',
            type: StudyTaskType.SING,
            props: {
                title: 'Melody task training I',
                targets: toTargets(repeatEach(reorderRandom(tonicMelodies), 2)),
                recognizers,
                withInitialPrompts: true,
                withPrompts: true,
                maxAttempts: 2
            }
        },
        {
            id: 'msg-training-II',
            type: StudyTaskType.VIDEO,
            props: {
                title: 'Melody task training II',
                text:
                    'The next three blocks of tasks are similar to the previous one except tasks are randomly ordered. Feel free to take a break and drink some water before clicking "Next."',
                embedID,
                startHidden: true
            }
        },
        ...insertBetween(
            repeatTask(
                () => ({
                    id: 'training-II',
                    type: StudyTaskType.SING,
                    props: {
                        title: 'Melody task training II',
                        targets: toTargets(reorderRandom([...tonicMelodies, ...tonicMelodies])),
                        recognizers,
                        withPrompts: true,
                        maxAttempts: 2
                    }
                }),
                3
            ),
            breakTask
        ),
        {
            id: 'silence-post-evaluation',
            type: StudyTaskType.RECORD,
            props: {}
        },
        {
            id: 'msg-post-evaluation',
            type: StudyTaskType.VIDEO,
            props: {
                title: 'Melody task post-evaluation',
                text:
                    'The next two blocks of tasks will measure your performance after the training blocks. Your voice will be recorded for these blocks. Feel free to take a break and drink some water before clicking "Next."',
                embedID,
                startHidden: true
            }
        },
        // Rearrangeable section for when there is(n't) background music
        ...insertBetween(
            reorderLatinSquare(
                varyBackgroundMusic(() => ({
                    id: 'post-evaluation',
                    type: StudyTaskType.SING,
                    props: {
                        title: 'Melody task post-evaluation',
                        targets: toTargets(reorderRandom([...tonicMelodies, ...tonicMelodies])),
                        recognizers,
                        withPrompts: false,
                        hideFeedback: true,
                        maxAttempts: 1,
                        isRecorded: true
                    }
                })),
                latinSquare
            ),
            breakTask
        ),
        {
            id: 'performance-post-evaluation',
            type: StudyTaskType.PERFORMANCE_MESSAGE,
            props: {
                title: 'Post-evaluation results',
                text: 'Recording has finished',
                multiAttempt: false,
                studyID: studyId.MELODY_STUDY,
                tasks: [
                    { id: 'post-evaluation-with-music', label: 'With music' },
                    { id: 'post-evaluation-without-music', label: 'Without music' }
                ]
            }
        },
        {
            id: 'msg-participant-rating',
            type: StudyTaskType.MESSAGE,
            props: {
                title: 'Melody task rating',
                text:
                    'Now that you have experience singing melodies to interact with your computer, we want to know what you think. Fill out the form on the next page.'
            }
        },
        {
            id: 'participant-rating',
            type: StudyTaskType.FORM,
            props: {
                title: 'Melody task rating',
                form: [
                    // Technical
                    {
                        type: FormTypes.RADIO,
                        id: 'recognize-pitch-effectiveness',
                        header: 'How often did the application correctly recognize the melodies you sang?',
                        text: 'Your response should not consider your own ability to perform the tasks.',
                        options: [
                            '0-20% of the time',
                            '20-40% of the time',
                            '40-60% of the time',
                            '60-80% of the time',
                            '80-100% of the time'
                        ],
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'recognize-pitch-effectiveness-2',
                        header: 'To what extent was the application successful at recognizing the melodies you sang?',
                        text: 'Your response should not consider your own ability to perform the tasks.',
                        options: [
                            'Very unsuccessful',
                            'Unsuccessful',
                            'Somewhat unsuccessful',
                            'Neither successful nor unsuccessful',
                            'Somewhat successful',
                            'Successful',
                            'Very successful'
                        ],
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'technical-problems',
                        header: 'Were there any technical problems you encountered when using the application?',
                        text: 'If there were no technical problems, leave this blank.',
                        label: 'Add any technical problems here...'
                    },
                    // Perceived task difficulty
                    ...tlxQuestions,
                    {
                        type: FormTypes.RADIO,
                        id: 'background-music',
                        header: 'Did the presence of background music make the tasks easier or harder?',
                        options: ['Much harder', 'Harder', 'Somewhat harder', 'No effect', 'Somewhat easier', 'Easier', 'Much easier'],
                        variant: 'horizontal',
                        getError: radioButtonValidator
                    },
                    // Enjoyability
                    {
                        type: FormTypes.RADIO,
                        id: 'enjoyability',
                        header: 'To what extent did you find the tasks enjoyable?',
                        options: [
                            'Very unenjoyable',
                            'Unenjoyable',
                            'Slightly unenjoyable',
                            'Neither enjoyable nor unenjoyable',
                            'Slightly enjoyable',
                            'Enjoyable',
                            'Very enjoyable'
                        ],
                        getError: radioButtonValidator
                    },
                    // Extra
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'thoughts',
                        header: 'Is there anything else you want us to know?',
                        multiline: true,
                        label: 'Your thoughts'
                    }
                ]
            }
        }
    ]
};
