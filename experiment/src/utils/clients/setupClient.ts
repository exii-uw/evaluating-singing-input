import { SingTaskResult } from '../rxjs/taskProgress';
import { TaskTarget } from '../../components/tasks/sing/target';
import { Observable } from 'rxjs';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { currUser$, getFirst } from '../../components/auth/observableUser';
import { mergeMap } from 'rxjs/operators';

interface SetupData {
    audioTest: SingTaskResult<TaskTarget>[];
    consent: Record<string, string | string[]>;
    musicality: Record<string, string | string[]>;
    isMusical: boolean;
}

export const setSetupData = (data: SetupData): Observable<void> => {
    const db = getFirestore();
    return currUser$.pipe(
        getFirst(),
        mergeMap((user) => setDoc(doc(db, 'users', user.uid), data))
    );
};
