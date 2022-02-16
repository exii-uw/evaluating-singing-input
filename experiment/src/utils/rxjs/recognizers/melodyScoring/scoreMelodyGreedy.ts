import { Melody, MelodyState } from '../melodyRecognizer';

interface Interval {
    interval: number;
    duration: number;
}

// Record the durations of all items in the melodies, sort by the date.
// WARNING: this is inefficient and can easily be improved when necessary.
export const scoreMelodyGreedy = (melodies: Melody[], intervals: number[]): MelodyState[] => {
    const distinctIntervals = intervals.reduce<Interval[]>((acc, interval) => {
        if (acc.length === 0 || acc[acc.length - 1].interval !== interval) acc.push({ interval, duration: 1 });
        else acc[acc.length - 1] = { interval, duration: acc[acc.length - 1].duration };
        return acc;
    }, []);

    return melodies.map((melody) => {
        let intervalPos = 0;
        const melIntervals = melody.intervals.map((interval) => {
            while (intervalPos < intervals.length && distinctIntervals[intervalPos].interval !== interval) intervalPos++;
            return {
                interval: interval,
                duration: intervalPos < distinctIntervals.length ? distinctIntervals[intervalPos].duration : 0
            };
        });
        return {
            ...melody,
            score: melIntervals.reduce((acc: number, interval: Interval) => acc + interval.duration, 0)
        };
    });
};
