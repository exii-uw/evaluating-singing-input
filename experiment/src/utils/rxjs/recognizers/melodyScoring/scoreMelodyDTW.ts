import { Melody, MelodyState } from '../melodyRecognizer';

// Implementation of https://en.wikipedia.org/wiki/Dynamic_time_warping#Implementation
export const scoreMelodyDTW = (melodies: Melody[], intervals: number[]): MelodyState[] => {
    return melodies.map((melody) => {
        const dtw = Array.from(Array(melody.intervals.length + 1), () => Array(intervals.length + 1).fill(Number.MAX_SAFE_INTEGER));
        dtw[0][0] = 0;

        // Fill dtwScores
        for (let i = 1; i <= melody.intervals.length; i++) {
            for (let j = 1; j <= intervals.length; j++) {
                const cost = Math.abs(melody.intervals[i - 1] - intervals[j - 1]);
                dtw[i][j] = cost + Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
            }
        }

        return {
            ...melody,
            score: -dtw[melody.intervals.length][intervals.length] // Turn to negative because DTW gives a cost rather than a score
        };
    });
};
