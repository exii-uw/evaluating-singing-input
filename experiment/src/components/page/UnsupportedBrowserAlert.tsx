import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import React from 'react';

const UnsupportedBrowserAlert = (): React.ReactElement => {
    return (
        <Snackbar
            open={navigator.userAgent.indexOf('Chrome') === -1}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center'
            }}
        >
            <MuiAlert variant="filled" severity="error" elevation={6}>
                Your browser is not supported. Please use Chrome on a laptop or desktop.
            </MuiAlert>
        </Snackbar>
    );
};

export default UnsupportedBrowserAlert;
