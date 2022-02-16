import { combineLatest, from, Observable } from 'rxjs';
import { currUser$, getFirst } from '../../components/auth/observableUser';
import { map, mergeMap, timeout } from 'rxjs/operators';
import { doc, getDoc, getFirestore, runTransaction } from 'firebase/firestore';

const participantListVersion = 'v3';

interface Participants {
    musical: string[];
    nonmusical: string[];
}

interface Participant {
    idx: number;
    isMusical: boolean;
}

// Lists ids of all participants (anonymous).
export const listParticipants = (): Observable<Participants> => {
    const db = getFirestore();
    return from(getDoc(doc(db, 'participants', participantListVersion))).pipe(
        map((document) => {
            if (!document.exists()) return { musical: [], nonmusical: [] };
            return document.data() as Participants;
        })
    );
};

// Returns index of participant for a given participant type
export const setParticipant = (isMusical: boolean): Observable<Participant> => {
    const key = isMusical ? 'musical' : 'nonmusical';
    const db = getFirestore();
    return currUser$.pipe(
        getFirst(),
        timeout(1000),
        mergeMap((user) =>
            runTransaction(db, (transaction) => {
                const docRef = doc(db, 'participants', participantListVersion);
                return transaction.get(docRef).then((users) => {
                    // If doc does not exist, create it
                    if (!users.exists()) {
                        transaction.set(docRef, { musical: [], nonmusical: [], [key]: [user.uid] });
                        return { idx: 0, isMusical };
                    }

                    // Otherwise, add the user
                    const data = users.data();
                    transaction.set(docRef, {
                        ...data,
                        [key]: [...data[key], user.uid]
                    });
                    return { idx: data[key].length, isMusical };
                });
            })
        )
    );
};

export const getParticipant = (): Observable<Participant> => {
    const db = getFirestore();
    const user$ = currUser$.pipe(getFirst(), timeout(1000));
    return combineLatest([user$, getDoc(doc(db, 'participants', participantListVersion))]).pipe(
        map(([user, document]) => {
            if (!document.exists()) throw new Error('participants document does not exist');
            const participants = document.data() as Participants;

            const musicalIdx = participants.musical.findIndex((curr) => curr === user.uid);
            if (musicalIdx > -1) return { idx: musicalIdx, isMusical: true };

            const nonmusicalIdx = participants.nonmusical.findIndex((curr) => curr === user.uid);
            if (nonmusicalIdx > -1) return { idx: nonmusicalIdx, isMusical: false };

            throw new Error(`participants document does not have a user ${user.uid}`);
        })
    );
};
