import clsx from 'clsx';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import React from 'react';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

interface Props {
    isVisible?: boolean;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        position: 'fixed',
        top: '5rem',
        right: 'max(5%, calc(50% - 25rem))',
        transition: 'opacity 0.5s',
        opacity: 0.5,
        display: 'flex'
    },
    circle: {
        marginRight: '0.5rem',
        width: '1rem',
        height: '1rem',
        borderRadius: '50%',
        backgroundColor: theme.palette.error.main
    },
    focused: {
        opacity: 1
    },
    hidden: {
        opacity: 0
    }
}));

const RecordingIndicator = ({ isVisible }: Props) => {
    const classes = useStyles();
    const [isFocused, setIsFocused] = React.useState(true);

    React.useEffect(() => {
        if (isVisible) {
            const sub = interval(500)
                .pipe(map((n) => n > 4 || n % 2 === 1))
                .subscribe((focused) => setIsFocused(focused));
            return () => sub.unsubscribe();
        }
    }, [isVisible]);

    return (
        <div className={clsx(classes.root, isFocused && classes.focused, !isVisible && classes.hidden)}>
            <div className={classes.circle} />
            Recording...
        </div>
    );
};

export default RecordingIndicator;
