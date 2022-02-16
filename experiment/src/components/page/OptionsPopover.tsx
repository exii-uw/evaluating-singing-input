import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import Popover from '@material-ui/core/Popover';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';

interface OptionsPopoverProps {
    children?: React.ReactNode;
}

const useStyles = makeStyles<Theme>((theme) => ({
    fab: {
        position: 'fixed',
        bottom: theme.spacing(2),
        right: theme.spacing(2)
    },
    icon: {
        marginRight: theme.spacing(1)
    },
    children: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        width: 'min(calc(100vw - 2rem), 20rem)'
    }
}));

const OptionsPopover = ({ children }: OptionsPopoverProps): React.ReactElement => {
    const classes = useStyles();

    const anchor = React.useRef(null);
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <IconButton ref={anchor} aria-label="settings" onClick={() => setOpen((o) => !o)}>
                <SettingsIcon />
            </IconButton>
            <Popover
                open={open}
                anchorEl={anchor.current}
                onClose={() => setOpen(false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: -15,
                    horizontal: 0
                }}
            >
                <div className={classes.children}>{children}</div>
            </Popover>
        </>
    );
};

export default OptionsPopover;
