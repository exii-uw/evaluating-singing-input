import React from 'react';
import clsx from 'clsx';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import { timer } from 'rxjs';

interface Props {
    hidden: boolean;
    children: React.ReactNode;
}

const useStyles = makeStyles<Theme>(() => ({
    root: {
        opacity: 1,
        transition: 'opacity 0.2s'
    },
    hidden: {
        opacity: 0
    }
}));

const Hideable = ({ hidden, children }: Props): React.ReactElement => {
    const classes = useStyles();
    const [finallyHidden, setFinallyHidden] = React.useState(hidden);

    React.useEffect(() => {
        if (hidden) {
            const sub = timer(1500).subscribe(() => setFinallyHidden(hidden));
            return () => sub.unsubscribe();
        }
        setFinallyHidden(hidden);
    }, [hidden]);

    return <div className={clsx(classes.root, finallyHidden && classes.hidden)}>{children}</div>;
};

export default Hideable;
