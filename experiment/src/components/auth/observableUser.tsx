import { Observable } from 'rxjs';
import { getAuth, User } from 'firebase/auth';
import { filter, map, take } from 'rxjs/operators';

export const currUser$ = new Observable<User | null>((sub) => {
    // Return to unsubscribe from auth changes
    return getAuth().onAuthStateChanged((user) => {
        sub.next(user);
    });
});

export function getFirst<T>() {
    return (obs: Observable<T | null>): Observable<T> =>
        obs.pipe(
            filter((user) => user !== null),
            map<T | null, T>((user) => user as T), // Hack for type safety
            take(1)
        );
}
