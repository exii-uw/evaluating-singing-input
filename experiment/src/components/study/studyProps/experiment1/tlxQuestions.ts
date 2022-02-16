import { FormItem, FormTypes } from '../../../tasks/form/formTypes';
import { radioButtonValidator } from '../../../tasks/form/formValidators';

export const tlxQuestions: FormItem[] = [
    {
        type: FormTypes.RADIO,
        id: 'mental-demand',
        header: 'Mental demand: how mentally demanding were the tasks?',
        options: ['Very low', 'Low', 'Somewhat low', 'Neutral', 'Somewhat high', 'High', 'Very high'],
        variant: 'horizontal',
        getError: radioButtonValidator
    },
    {
        type: FormTypes.RADIO,
        id: 'physical-demand',
        header: 'Physical demand: how physically demanding were the tasks?',
        options: ['Very low', 'Low', 'Somewhat low', 'Neutral', 'Somewhat high', 'High', 'Very high'],
        variant: 'horizontal',
        getError: radioButtonValidator
    },
    {
        type: FormTypes.RADIO,
        id: 'temporal-demand',
        header: 'Temporal demand: how hurried or rushed was the pace of the task?',
        options: ['Very low', 'Low', 'Somewhat low', 'Neutral', 'Somewhat high', 'High', 'Very high'],
        variant: 'horizontal',
        getError: radioButtonValidator
    },
    {
        type: FormTypes.RADIO,
        id: 'performance-before-training',
        header: 'Performance: how successful were you in accomplishing tasks BEFORE the training stage?',
        options: ['Perfect', 'Successful', 'Somewhat successful', 'Neutral', 'Somewhat unsuccessful', 'Unsuccessful', 'Failure'],
        variant: 'horizontal',
        getError: radioButtonValidator
    },
    {
        type: FormTypes.RADIO,
        id: 'performance-after-training',
        header: 'Performance: how successful were you in accomplishing tasks AFTER the training stage?',
        options: ['Perfect', 'Successful', 'Somewhat successful', 'Neutral', 'Somewhat unsuccessful', 'Unsuccessful', 'Failure'],
        variant: 'horizontal',
        getError: radioButtonValidator
    },
    {
        type: FormTypes.RADIO,
        id: 'effort-before-training',
        header: 'Effort: how hard did you have to work to accomplish your level of performance BEFORE the two training stages?',
        options: ['Very low', 'Low', 'Somewhat low', 'Neutral', 'Somewhat high', 'High', 'Very high'],
        variant: 'horizontal',
        getError: radioButtonValidator
    },
    {
        type: FormTypes.RADIO,
        id: 'effort-after-training',
        header: 'Effort: how hard did you have to work to accomplish your level of performance AFTER the two training stages?',
        options: ['Very low', 'Low', 'Somewhat low', 'Neutral', 'Somewhat high', 'High', 'Very high'],
        variant: 'horizontal',
        getError: radioButtonValidator
    },
    {
        type: FormTypes.RADIO,
        id: 'frustration',
        header: 'Frustration: How insecure, discouraged, irritated, stressed, and annoyed were you?',
        options: ['Very low', 'Low', 'Somewhat low', 'Neutral', 'Somewhat high', 'High', 'Very high'],
        variant: 'horizontal',
        getError: radioButtonValidator
    }
];
