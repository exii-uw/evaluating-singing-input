import { Observable } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';
import { IAudioContext } from 'standardized-audio-context';

const blobToArrayBuffer = (blob: Blob) =>
    new Observable<ArrayBuffer>((sub) => {
        const reader = new FileReader();
        const onSuccess = () => {
            sub.next(reader.result as ArrayBuffer);
            sub.complete();
        };
        const onError = (event: ProgressEvent<FileReader>) => {
            sub.error(event);
            sub.complete();
        };

        reader.addEventListener('loadend', onSuccess);
        reader.addEventListener('error', onError);
        reader.readAsArrayBuffer(blob);

        return () => {
            reader.removeEventListener('loadend', onSuccess);
            reader.removeEventListener('error', onError);
        };
    });

const dbVersion = 1;
const dbName = 'audioCache';
const objectStoreName = 'audioFiles';

// Gets the database
const getDB = () =>
    new Observable<IDBDatabase>((sub) => {
        const req = indexedDB.open(dbName, dbVersion);
        req.onerror = (event) => {
            sub.error(event);
            sub.complete();
        };
        req.onsuccess = (event) => {
            // @ts-ignore
            sub.next(event.target.result as IDBDatabase);
            sub.complete();
        };
        req.onupgradeneeded = (event) => {
            // @ts-ignore
            const db = event.target.result as IDBDatabase;
            db.createObjectStore(objectStoreName);
        };
    });

export const clearCachedAudio = () => {
    getDB().subscribe((db) => {
        const objectStore = db.transaction([objectStoreName], 'readwrite').objectStore(objectStoreName);
        objectStore.clear();
    });
};

// NOTE: blobs are NOT supported in Safari, but ArrayBuffers are not working in Chrome.
const fromLive = (url: string): Observable<Blob> => fromFetch(url).pipe(mergeMap((res) => res.blob()));

// Attempts to get audio from cache
export const getCachedAudio = (url: string, ctx: IAudioContext): Observable<AudioBuffer> => {
    return getDB().pipe(
        mergeMap(
            (db) =>
                new Observable<Blob>((sub) => {
                    const objectStore = db.transaction([objectStoreName], 'readonly').objectStore(objectStoreName);
                    const request = objectStore.get(url);
                    request.onerror = (event) => {
                        sub.error(event);
                        sub.complete();
                    };
                    request.onsuccess = () => {
                        if (request.result === undefined) sub.error();
                        else sub.next(request.result);
                        sub.complete();
                    };
                })
        ),
        catchError(() => {
            return fromLive(url).pipe(
                // Silently cache it when it arrives
                tap((buffer) => {
                    getDB().subscribe((db) => {
                        try {
                            db.transaction([objectStoreName], 'readwrite').objectStore(objectStoreName).put(buffer, url);
                        } catch (err) {
                            // Do nothing if we failed to cache; it's fine
                        }
                    });
                })
            );
        }),
        mergeMap((blob) => blobToArrayBuffer(blob)),
        mergeMap((buffer) => ctx.decodeAudioData(buffer))
    );
};
