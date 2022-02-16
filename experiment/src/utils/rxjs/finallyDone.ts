import { concat, Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';

interface Props<S extends State> {
    checkDone?: (state: S) => boolean;
}

interface State {
    isDone: boolean;
}

export function finallyDone<S extends State>({ checkDone }: Props<S> = {}) {
    return (source$: Observable<S>): Observable<S> => {
        const srcWithReplay$ = source$.pipe(shareReplay(1));
        return concat(
            srcWithReplay$,
            // Take the last replay and convert the isDone
            srcWithReplay$.pipe(
                filter((state) => (checkDone ? checkDone(state) : true)),
                map((state) => ({ ...state, isDone: true }))
            )
        );
    };
}
