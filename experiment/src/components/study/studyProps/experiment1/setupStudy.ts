import { StudyProps } from '../../Study';
import { StudyTaskType } from '../../studyTasks';
import { FormTypes } from '../../../tasks/form/formTypes';
import { studyId } from '../studyId';
import { numberValidator, radioButtonValidator } from '../../../tasks/form/formValidators';

export const setupStudyProps: StudyProps = {
    id: studyId.SETUP_STUDY,
    dependencies: [],
    name: '1. Setup',
    description: 'For collecting demographic information and calibrating the system.',
    time: 5,
    getTasks: () => [
        {
            id: 'demographics',
            type: StudyTaskType.FORM,
            props: {
                title: 'Demographics',
                form: [
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'age',
                        header: 'What is your age?',
                        label: 'Age',
                        getError: numberValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'gender',
                        header: 'What gender do you identify with?',
                        options: ['Male', 'Female', 'Non-binary', 'Prefer to self-disclose', 'Prefer not to say'],
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'gender-other',
                        header: 'If you chose "Prefer to self-disclose," please specify.',
                        text: 'This question is optional.',
                        label: 'Gender'
                    },
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'laptop-hours-per-week',
                        header: 'How many hours per day do you use a laptop or desktop?',
                        label: 'Hours per day',
                        getError: numberValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'laptop-people-within-earshot',
                        header: 'When using a laptop or desktop, are there typically people nearby who can hear you speaking?',
                        options: ['Yes', 'No'],
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'musical-experience-private',
                        header: 'How many years of private musical lessons have you had?',
                        text: 'These include weekly or biweekly vocal or instrument lessons with at most 3 students in the class.',
                        label: 'Years of private lessons',
                        getError: numberValidator
                    },
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'musical-experience-group',
                        header: 'How many years of group musical lessons have you had?',
                        text:
                            'These include weekly or biweekly vocal or instrument lessons with 4 or more students in the class. These exclude mandatory grade school classes, but include extracurriculars.',
                        label: 'Years of group lessons',
                        getError: numberValidator
                    },
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'musical-experience-voice',
                        header: 'How many years of voice training have you had?',
                        text: 'This includes private and group lessons, such as choir.',
                        label: 'Years of voice training',
                        getError: numberValidator
                    },
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'musical-experience-ear-training',
                        header: 'How many years of ear training have you had?',
                        text:
                            'This includes private or group training for sight-singing and recognizing pitches and intervals, as well as recognizing chords, chord progressions, and scales.',
                        label: 'Years of ear training',
                        getError: numberValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'singing-tendencies',
                        header: 'How often do you sing?',
                        text: 'This includes informally (while showering, cooking, etc) or formally (practicing, performing).',
                        options: ['Rarely', 'Monthly', 'Biweekly', 'Weekly', 'Every other day', 'Daily', 'Multiple times a day'],
                        variant: 'horizontal',
                        getError: radioButtonValidator
                    }
                ]
            }
        },
        {
            id: 'calibrate',
            type: StudyTaskType.CALIBRATE
        }
    ]
};
