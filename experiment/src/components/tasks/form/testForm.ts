import { FormItem, FormTypes } from './formTypes';

export const testForm: FormItem[] = [
    {
        type: FormTypes.TEXT,
        id: 'title',
        header: 'Title',
        text: 'Some text'
    },
    {
        type: FormTypes.RADIO,
        id: 'radio',
        header: '1. What is your quest?',
        text: 'For more details about your quest, please refer to your question sheet',
        options: ['To capture the magic pig', 'To pick a favourite colour', 'To pick a favorite color'],
        getError: (val) => (typeof val === 'string' ? undefined : 'Select a radio button')
    },
    {
        type: FormTypes.RADIO,
        id: 'radio-2',
        header: '1. What is your quest?',
        text: 'For more details about your quest, please refer to your question sheet',
        options: ['Strongly disagree', 'Disagree', 'Slightly disagree', 'Neutral', 'Slightly agree', 'Agree', 'Strongly agree'],
        getError: (val) => (typeof val === 'string' ? undefined : 'Select a radio button'),
        variant: 'horizontal'
    },
    {
        type: FormTypes.CHECKBOX,
        id: 'check',
        header: '2. What is your quest?',
        text: 'For more details about your quest, please refer to your question sheet',
        options: ['To capture the magic pig', 'To pick a favourite colour', 'To pick a favorite color']
    },
    {
        type: FormTypes.TEXT_FIELD,
        id: 'field',
        multiline: true,
        header: '3. This is a text field',
        label: 'Dump some text here',
        getError: (val) => (typeof val === 'string' && val.length > 0 ? undefined : 'This is a required field')
    },
    {
        type: FormTypes.TEXT_FIELD,
        id: 'field',
        header: '3. This is a text field',
        label: 'Dump some text here',
        getError: (val) => (typeof val === 'string' && val.length > 0 ? undefined : 'This is a required field')
    }
];
