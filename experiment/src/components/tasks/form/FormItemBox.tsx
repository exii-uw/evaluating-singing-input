import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import ErrorIcon from '@material-ui/icons/Error';
import FormHelperText from '@material-ui/core/FormHelperText';

interface Props {
    header?: string;
    headerType: 'h4' | 'h5';
    error?: string;
    text?: string | string[];
    children?: React.ReactNode;
}

const useStyles = makeStyles<Theme, Props>((theme) => ({
    root: {
        margin: theme.spacing(1, 0, 6),
        position: 'relative'
    },
    header: ({ error }) => ({
        paddingRight: error ? theme.spacing(2) : 0,
        color: theme.palette.text.primary
    }),
    errorIcon: {
        color: theme.palette.error.main,
        position: 'absolute',
        top: '0.15rem',
        right: '0.25rem'
    },
    text: ({ error }) => ({
        color: theme.palette.text.primary,
        marginTop: theme.spacing(1.5)
    }),
    children: {
        margin: theme.spacing(2, 0.5)
    }
}));

const FormItemBox = (props: Props): React.ReactElement<Props> => {
    const classes = useStyles(props);
    const { header, headerType, error, text, children } = props;
    return (
        <div className={classes.root}>
            {error && <ErrorIcon className={classes.errorIcon} />}
            {header && (
                <Typography variant={headerType} className={classes.header}>
                    {header}
                </Typography>
            )}
            {text &&
                (typeof text === 'string' ? (
                    <Typography className={classes.text}>{text}</Typography>
                ) : (
                    text.map((txt) => (
                        <Typography key={txt} className={classes.text}>
                            {txt}
                        </Typography>
                    ))
                ))}
            {children && <div className={classes.children}>{children}</div>}
            {error && <FormHelperText error>{error}</FormHelperText>}
        </div>
    );
};

FormItemBox.defaultProps = {
    headerType: 'h5'
};

export default FormItemBox;
