import { IAudioContext, IAudioNode, IGainNode } from 'standardized-audio-context';
import { BehaviorSubject, Observable, of, Subject, Subscription, timer } from 'rxjs';
import { audit, concatMap, filter, map, mergeMap, scan, take, tap } from 'rxjs/operators';

interface GainChange {
    to: number; // in [0, 1]
    duration: number; // in ms
    at?: number; // in ms
}

class Mutex {
    private readonly inUse$ = new BehaviorSubject<boolean>(false);

    public lock(): Observable<boolean> {
        // Wait until it's available, then take it
        return this.inUse$.pipe(
            filter((inUse) => !inUse),
            take(1),
            tap(() => this.inUse$.next(true))
        );
    }

    public unlock(): void {
        this.inUse$.next(false);
    }
}

class GainNode {
    private readonly gain: IGainNode<IAudioContext>;
    private readonly mutex = new Mutex();
    private readonly queue$ = new Subject<GainChange>();
    private readonly context: IAudioContext;
    private readonly mainSubscription: Subscription;
    private lastValue: number;
    constructor(context: IAudioContext) {
        this.context = context;
        this.lastValue = 1;
        this.gain = context.createGain();

        this.mainSubscription = this.queue$
            .pipe(
                // Delay them if they request a delay
                mergeMap((change) => {
                    const time = performance.now();
                    return timer(change.at || 0).pipe(map(() => ({ ...change, time })));
                }),
                scan(
                    (acc, change) => ({
                        ...change,
                        bestTime: Math.max(acc.bestTime, change.time)
                    }),
                    { to: 1, duration: 0, time: 0, bestTime: 0 }
                ),
                // Only keep changes that are the most recent possible
                filter((change) => change.time === change.bestTime),
                audit(() => this.mutex.lock()),
                concatMap((change) => {
                    if (change.duration > 0) {
                        this.gain.gain.setValueAtTime(this.lastValue, context.currentTime);
                        this.gain.gain.linearRampToValueAtTime(change.to, context.currentTime + change.duration / 1000);
                        return timer(change.duration).pipe(map(() => change.to));
                    } else {
                        this.gain.gain.setValueAtTime(change.to, context.currentTime);
                        return of(change.to);
                    }
                })
            )
            .subscribe((newValue) => {
                this.lastValue = newValue;
                this.mutex.unlock();
            });
    }

    public connect(node: IAudioNode<any>) {
        this.gain.connect(node);
    }

    public node(): IAudioNode<any> {
        return this.gain;
    }

    public schedule(change: GainChange) {
        this.queue$.next(change);
    }

    public disconnect() {
        this.gain.disconnect();
        this.mainSubscription.unsubscribe();
    }
}

export default GainNode;
