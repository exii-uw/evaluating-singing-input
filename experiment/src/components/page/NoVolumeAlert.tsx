import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import React from 'react';
import { audioVolume$ } from '../detector/shared';
import { take } from 'rxjs/operators';

const NoVolumeAlert = (): React.ReactElement => {
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
        audioVolume$.pipe(take(1)).subscribe((volume) => {
            if (volume === 0) setOpen(true);
        });
    }, []);

    return (
        <Snackbar
            open={open}
            onClose={() => setOpen(false)}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center'
            }}
        >
            <MuiAlert variant="filled" severity="info" elevation={6} onClose={() => setOpen(false)}>
                You previously turned your volume down to zero. Increase the volume by clicking the settings button at the top of the
                screen.
            </MuiAlert>
        </Snackbar>
    );
};

export default NoVolumeAlert;
