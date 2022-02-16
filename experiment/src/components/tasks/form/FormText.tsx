import React from 'react';
import FormItemBox from './FormItemBox';

export interface FormTextProps {
    header: string;
    text: string | string[];
}

const FormText = ({ header, text }: FormTextProps): React.ReactElement<FormTextProps> => {
    return <FormItemBox header={header} text={text} headerType="h4" />;
};

export default FormText;
