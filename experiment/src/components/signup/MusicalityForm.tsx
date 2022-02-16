import Form from '../tasks/form/Form';
import { FormItem, FormTypes } from '../tasks/form/formTypes';

interface Props {
    header: string;
    onComplete: (isMusical: boolean, results: Record<string, string | string[]>) => void;
}

const options = [
    'Strongly disagree',
    'Disagree',
    'Slightly disagree',
    'Neither agree nor disagree',
    'Slightly agree',
    'Agree',
    'Strongly agree'
];

const questionId = 'good-singer';

const form: FormItem[] = [
    {
        id: questionId,
        type: FormTypes.RADIO,
        variant: 'horizontal',
        header: 'I consider myself a good singer.',
        text: 'Rate your agreement with the statement.',
        options,
        getError: (val: any) => (typeof val === 'string' ? undefined : 'Select a radio button')
    }
];

const MusicalityForm = ({ onComplete, header }: Props) => {
    return (
        <Form
            header={header}
            title="Musicality"
            form={form}
            onComplete={(results) => {
                const isMusical = options.indexOf(results[questionId] as string) > 4; // better than slightly agree
                onComplete(isMusical, results);
            }}
        />
    );
};

MusicalityForm.defaultProps = {
    header: 'Musicality'
};

export default MusicalityForm;
