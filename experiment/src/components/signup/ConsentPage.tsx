import { FormCheckboxItem, FormTypes } from '../tasks/form/formTypes';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Form from '../tasks/form/Form';

interface Props {
    header: string;
    onComplete?: (responses: Record<string, string | string[]>) => void;
}

const useStyles = makeStyles<Theme>((theme) => ({
    embed: {
        width: '100%',
        height: '75vh',
        margin: theme.spacing(4, 0)
    }
}));

const consentForm: FormCheckboxItem[] = [
    {
        type: FormTypes.CHECKBOX,
        id: 'consent',
        header: 'To participate, consent using the checkbox below.',
        options: ['I agree of my own free will to participate in the study.'],
        getError: (values) => (!values || values.length === 0 ? 'This must be checked to participate in the study' : undefined)
    }
];

const ConsentPage = ({ header, onComplete }: Props): React.ReactElement => {
    const classes = useStyles();

    return (
        <Form header={header} title="Consent Form" form={consentForm} onComplete={onComplete}>
            <Typography>Please read the consent form below and check the box at the end of the page.</Typography>
            <embed className={classes.embed} src="/consent.pdf" />
        </Form>
    );
};

export default ConsentPage;
