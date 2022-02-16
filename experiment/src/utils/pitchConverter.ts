import { VocalState } from '../components/detector/VoiceDetector';
import { mod12 } from './math';

const notes: Record<number, string> = {
    0: 'A',
    1: 'A#',
    2: 'B',
    3: 'C',
    4: 'C#',
    5: 'D',
    6: 'D#',
    7: 'E',
    8: 'F',
    9: 'F#',
    10: 'G',
    11: 'G#'
};

export const convertNoteToString = (noteNum: number, includeOctave: boolean = true): string => {
    const octave = Math.floor((noteNum + 9) / 12);
    const noteName = notes[mod12(noteNum)];
    return `${noteName}${includeOctave ? octave : ''}`;
};

const numericNote: Record<number, string> = {
    '-1': '⬇',
    0: '1',
    1: '', // 'Minor 2nd',
    2: '2',
    3: '', // 'Minor 3rd',
    4: '3',
    5: '4',
    6: '', // 'Aug. 4th',
    7: '5',
    8: '', // 'Minor 6th',
    9: '6',
    10: '', // 'Minor 7th',
    11: '7',
    12: '8',
    13: '⬆'
};

export const convertNumericNoteToString = (intervalSize: number): string => {
    const interval = Math.max(-1, Math.min(13, intervalSize));
    return numericNote[interval];
};

const intervals: Record<number, string> = {
    '-1': '⬇',
    0: 'Perf. unison',
    1: '', // 'Minor 2nd',
    2: 'Major 2nd',
    3: '', // 'Minor 3rd',
    4: 'Major 3rd',
    5: 'Perfect 4th',
    6: '', // 'Aug. 4th',
    7: 'Perfect 5th',
    8: '', // 'Minor 6th',
    9: 'Major 6th',
    10: '', // 'Minor 7th',
    11: 'Major 7th',
    12: 'Perfect 8ve',
    13: '⬆'
};

export const convertIntervalToString = (intervalSize: number): string => {
    const interval = Math.max(-1, Math.min(13, intervalSize));
    return intervals[interval];
};

const scalePitches: Record<number, string> = {
    '-1': '⬇',
    0: 'Tonic',
    1: '',
    2: 'Supertonic',
    3: '',
    4: 'Mediant',
    5: 'Subdominant',
    6: '',
    7: 'Dominant',
    8: '',
    9: 'Submediant',
    10: '',
    11: 'Leading Tone',
    12: 'Tonic',
    13: '⬆'
};

export const convertScalePitchToString = (intervalSize: number): string => {
    const interval = Math.max(-1, Math.min(13, intervalSize));
    return scalePitches[interval];
};

export interface ReadableVocalState {
    error: number; // between -0.5 and +0.5
    note: string;
    noteNum: number;
    hz: number; // frequency hz
    volume: number;
    time: number;
}

const a4Frequency = 440;
const multiplier = Math.pow(2, 1 / 12);

export const convertHzToNoteNum = (hz: number): number => Math.log(hz / a4Frequency) / Math.log(multiplier) + 48;

export const convertNoteNumToHz = (noteNum: number): number => Math.pow(multiplier, noteNum - 48) * a4Frequency;

export const convertHzToInterval = (start: number, end: number): number => Math.log(end / start) / Math.log(multiplier);

export const convertPitchToReadable = (state: VocalState): ReadableVocalState => {
    const rawNoteNum = convertHzToNoteNum(state.pitch);
    const roundUp = rawNoteNum >= 0 && rawNoteNum % 1 >= 0.5;
    const noteNum = roundUp ? Math.ceil(rawNoteNum) : Math.floor(rawNoteNum);
    return {
        error: roundUp ? -1 + (rawNoteNum % 1) : rawNoteNum % 1,
        note: convertNoteToString(noteNum),
        hz: state.pitch,
        volume: state.volume,
        noteNum,
        time: performance.now()
    };
};
