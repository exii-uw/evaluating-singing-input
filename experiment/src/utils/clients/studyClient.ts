import { StudyTaskType } from '../../components/study/studyTasks';
import { from, Observable } from 'rxjs';
import { collection, doc, getDoc, getDocs, getFirestore, setDoc, QuerySnapshot } from 'firebase/firestore';
import { currUser$, getFirst } from '../../components/auth/observableUser';
import { map, mergeMap, scan, timeout } from 'rxjs/operators';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { listParticipants } from './participantsClient';

export interface StudyResult<Details = any> {
    type: StudyTaskType;
    studyId: string;
    taskId: string;
    taskIdx: number;
    details: Details;
    doneAt: Date;
}

interface StudyData {
    nextIdx: number;
    isDone: boolean;
    start?: Date;
    end?: Date;
}

interface StudyDataWithId extends StudyData {
    studyId: string;
}

export interface UserData {
    uid: string;
    idx: number;
    isMusical: boolean;
    data: Record<string, StudyDataWithId>; // data for each study ID completed
}

const convertStudies = (docs: QuerySnapshot<unknown>): Record<string, StudyDataWithId> => {
    const result: Record<string, StudyDataWithId> = {};
    docs.forEach((doc) => {
        result[doc.id] = { ...(doc.data() as StudyData), studyId: doc.id };
    });
    return result;
};

export const getAllStudies = (): Observable<Record<string, StudyDataWithId>> => {
    const db = getFirestore();
    return currUser$.pipe(
        getFirst(),
        timeout(1000),
        mergeMap((user) => getDocs(collection(db, 'users', user.uid, 'studies'))),
        map(convertStudies)
    );
};

const toUserData = (arr: string[], isMusical: boolean): UserData[] => arr.map((uid, idx) => ({ uid, idx, isMusical, data: {} }));

export const getAllStudiesForAllUsers = (): Observable<UserData[]> => {
    const db = getFirestore();
    return listParticipants().pipe(
        // Get each participant individually
        mergeMap((participants) => {
            return from([...toUserData(participants.musical, true), ...toUserData(participants.nonmusical, false)]);
        }),
        // Retrieve the study info for each participant
        mergeMap((user) => {
            return from(getDocs(collection(db, 'users', user.uid, 'studies'))).pipe(
                map(convertStudies),
                map((data) => ({ ...user, data }))
            );
        }),
        // Throw into an unordered array
        scan((acc: UserData[], user) => [...acc, user], [])
    );
};

export const getStudyStatus = (studyID: string): Observable<StudyData | null> => {
    const db = getFirestore();
    return currUser$.pipe(
        getFirst(),
        mergeMap((user) => getDoc(doc(db, 'users', user.uid, 'studies', studyID))),
        map((doc) => {
            if (doc.exists()) return doc.data() as StudyData;
            else return null;
        })
    );
};

export const setStudyStatus = (studyID: string, data: StudyData): Observable<void> => {
    const db = getFirestore();
    // Use merge to retain start time if change later
    return currUser$.pipe(
        getFirst(),
        mergeMap((user) => setDoc(doc(db, 'users', user.uid, 'studies', studyID), data, { merge: true }))
    );
};

export const getStudyTaskResults = (studyID: string, taskID: string): Observable<StudyResult | null> => {
    const db = getFirestore();
    return currUser$.pipe(
        getFirst(),
        mergeMap((user) => getDoc(doc(db, 'users', user.uid, 'studies', studyID, 'tasks', taskID))),
        map((doc) => {
            if (doc.exists()) return doc.data() as StudyResult;
            else return null;
        })
    );
};

export const setStudyTaskResults = (studyID: string, taskID: string, data: StudyResult): Observable<void> => {
    const db = getFirestore();
    return currUser$.pipe(
        getFirst(),
        mergeMap((user) => setDoc(doc(db, 'users', user.uid, 'studies', studyID, 'tasks', taskID), data))
    );
};

export const saveAudioFile = (studyID: string, taskID: string, blob: Blob) => {
    const storage = getStorage();
    return currUser$.pipe(
        getFirst(),
        mergeMap((user) => {
            const path = `users/${user.uid}/study-${studyID}/${taskID}.mp3`;
            const docRef = ref(storage, path);
            return uploadBytes(docRef, blob);
        })
    );
};
