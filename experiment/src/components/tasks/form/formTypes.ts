import { FormTextProps } from './FormText';

export enum FormTypes {
    TEXT = 'TEXT',
    RADIO = 'RADIO',
    TEXT_FIELD = 'TEXT_FIELD',
    CHECKBOX = 'CHECKBOX'
}

interface FormItemBase {
    id: string;
    getError?: (value: any) => string | undefined;
}

interface FormTextItem extends FormTextProps, FormItemBase {
    type: FormTypes.TEXT;
}

interface FormOptionItem extends FormItemBase {
    header: string;
    text?: string;
    options: string[];
}

interface FormRadioItem extends FormOptionItem {
    type: FormTypes.RADIO;
    variant?: 'horizontal' | '';
}

export interface FormCheckboxItem extends FormOptionItem {
    type: FormTypes.CHECKBOX;
}

interface FormTextFieldItem extends FormItemBase {
    header: string;
    text?: string;
    multiline?: boolean;
    label: string;
    type: FormTypes.TEXT_FIELD;
    id: string;
}

export type FormItem = FormTextItem | FormRadioItem | FormCheckboxItem | FormTextFieldItem;
