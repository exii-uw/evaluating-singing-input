import FormItemBox from './FormItemBox';
import TextField from '@material-ui/core/TextField';
import React from 'react';

interface FormTextFieldProps {
    header: string;
    text?: string;
    multiline?: boolean;
    label: string;
    value: string | undefined;
    setValue: (s: string) => void;
    error?: string;
}

const FormTextField = ({
    header,
    text,
    multiline,
    label,
    value,
    setValue,
    error
}: FormTextFieldProps): React.ReactElement<FormTextFieldProps> => {
    return (
        <FormItemBox header={header} text={text} error={error}>
            <TextField
                label={label}
                variant="outlined"
                fullWidth={true}
                multiline={multiline}
                rows={3}
                value={value || ''}
                onChange={(e) => setValue(e.target.value)}
            />
        </FormItemBox>
    );
};

export default FormTextField;
