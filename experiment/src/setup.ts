import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';
import { currUser$ } from './components/auth/observableUser';
import { filter, mergeMap } from 'rxjs/operators';
import { getCalibrationData } from './utils/clients/calibrationClient';
import { tonic$ } from './components/detector/shared';

export const setupFirebase = () => {
    if (getApps().length === 0) initializeApp(firebaseConfig);

    // Sync calibration with the server when we log in
    currUser$
        .pipe(
            filter((user) => user !== null),
            mergeMap(() => getCalibrationData())
        )
        .subscribe((result) => {
            tonic$.next(result.details.startNote);
        });
};
