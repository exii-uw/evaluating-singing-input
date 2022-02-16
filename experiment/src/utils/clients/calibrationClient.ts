import { StudyResult } from './studyClient';
import { CalibrationResult } from '../../components/tasks/calibration/Calibration';
import { Observable } from 'rxjs';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { currUser$, getFirst } from '../../components/auth/observableUser';
import { filter, map, mergeMap, timeout } from 'rxjs/operators';
import { studyId } from '../../components/study/studyProps/studyId';

export const getCalibrationData = (studyID: string = studyId.SETUP_STUDY): Observable<StudyResult<CalibrationResult>> => {
    const db = getFirestore();
    return currUser$.pipe(
        getFirst(),
        timeout(1000),
        mergeMap((user) => getDoc(doc(db, 'users', user.uid, 'studies', studyID, 'tasks', 'calibrate'))),
        filter((doc) => doc.exists()),
        map((doc) => doc.data() as StudyResult<CalibrationResult>)
    );
};
