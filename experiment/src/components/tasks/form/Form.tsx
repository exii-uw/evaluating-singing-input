import React from 'react';
import Page from '../../page/Page';
import FormText from './FormText';
import { FormItem, FormTypes } from './formTypes';
import FormRadio from './FormRadio';
import FormTextField from './FormTextField';
import FormCheckbox from './FormCheckbox';
import Button from '@material-ui/core/Button';
import { Alert } from '@material-ui/lab';
import ButtonBox from '../../common/ButtonBox';

export interface FormProps {
    header: string;
    title?: string;
    form: FormItem[];
    children?: React.ReactNode;
    onCancel?: () => void;
    onComplete?: (responses: Record<string, string | string[]>) => void;
}

const Form = (props: FormProps): React.ReactElement<FormProps> => {
    const [state, setState] = React.useState<Record<string, string | string[]>>({});
    const [errors, setErrors] = React.useState<Record<string, string | undefined>>({});
    const [isValid, setIsValid] = React.useState(true);

    const validate = () => {
        let isValid = true;

        // Validate, show errors as appropriate
        props.form.forEach((item) => {
            if (item.getError) {
                const err = item.getError(state[item.id]);
                if (err) {
                    setErrors((errs) => ({ ...errs, [item.id]: err }));
                    isValid = false;
                } else {
                    setErrors((errs) => ({ ...errs, [item.id]: undefined }));
                }
            }
        });

        setIsValid(isValid);
        if (isValid && props.onComplete) props.onComplete(state);
    };

    return (
        <Page header={props.header} title={props.title || props.header}>
            {props.children}
            {props.form.map((item) => {
                switch (item.type) {
                    case FormTypes.TEXT:
                        return <FormText key={item.id} {...item} />;
                    case FormTypes.RADIO:
                        return (
                            <FormRadio
                                key={item.id}
                                {...item}
                                value={state[item.id] as string | undefined}
                                setValue={(value) => setState({ ...state, [item.id]: value })}
                                error={errors[item.id]}
                            />
                        );
                    case FormTypes.TEXT_FIELD:
                        return (
                            <FormTextField
                                key={item.id}
                                {...item}
                                value={state[item.id] as string | undefined}
                                setValue={(value) => setState({ ...state, [item.id]: value })}
                                error={errors[item.id]}
                            />
                        );
                    case FormTypes.CHECKBOX:
                        return (
                            <FormCheckbox
                                key={item.id}
                                {...item}
                                value={state[item.id] as string[] | undefined}
                                setValue={(value) => setState({ ...state, [item.id]: value })}
                                error={errors[item.id]}
                            />
                        );
                    default:
                        return <></>;
                }
            })}
            {!isValid && (
                <ButtonBox>
                    <Alert severity="error">
                        There are errors on this form. Go back and verify your information is filled and correct.
                    </Alert>
                </ButtonBox>
            )}
            <ButtonBox>
                {props.onCancel && <Button onClick={props.onCancel}>Cancel</Button>}
                <Button onClick={validate} color="primary" variant="contained">
                    Next
                </Button>
            </ButtonBox>
        </Page>
    );
};

export default Form;
