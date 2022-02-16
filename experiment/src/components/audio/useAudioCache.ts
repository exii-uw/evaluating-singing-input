import { TaskTarget } from '../tasks/sing/target';
import React from 'react';
import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { getAudioURL } from './getAudioURL';
import { getCachedAudio } from './getCachedAudio';
import { audioContext } from './audioContext';

interface CacheParams {
    targets: TaskTarget[];
    keyNumber: number;
    octave: number;
    pauseCache?: boolean;
}

export const useAudioCache = ({ targets, keyNumber, octave, pauseCache }: CacheParams) => {
    const { audioContext: ctx } = React.useContext(audioContext);
    React.useEffect(() => {
        if (octave === 0 && keyNumber === 0) return; // skip if nothing has been loaded yet
        if (pauseCache) return; // Don't do any caching

        const sub = from(targets)
            .pipe(
                mergeMap((target) => {
                    return getCachedAudio(getAudioURL({ keyNumber, octave, target }), ctx);
                })
            )
            .subscribe({
                error: (e) => console.error('Critical error loading target file:', e.strerror)
            });

        return () => sub.unsubscribe();
    }, [targets, keyNumber, octave, ctx, pauseCache]);
};
