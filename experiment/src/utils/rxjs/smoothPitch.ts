import { VocalState } from '../../components/detector/VoiceDetector';
import { Observable } from 'rxjs';
import { convertHzToNoteNum, convertPitchToReadable, ReadableVocalState } from '../pitchConverter';
import { filter, map, scan } from 'rxjs/operators';
import { delayUnlikely } from './delayUnlikely';

interface Options {
    pitchWeight?: number;
    minClarity?: number;
    minVolume?: number;
}

export interface ComprehensiveVocalState {
    pitch: ReadableVocalState;
    raw: VocalState;
}

const breakTime = 500;
const defaultState: VocalState = {
    pitch: 0,
    clarity: 0,
    volume: 0,
    time: -breakTime
};
export const defaultComprehensiveVocalState: ComprehensiveVocalState = { raw: defaultState, pitch: convertPitchToReadable(defaultState) };

export const smoothPitch: () => (source$: Observable<VocalState>) => Observable<ComprehensiveVocalState> = (opts: Options = {}) => (
    source
) => {
    const options = {
        pitchWeight: 0.5,
        minClarity: 0.95,
        minVolume: 0,
        ...opts
    };

    return source.pipe(
        filter((state) => convertHzToNoteNum(state.pitch) >= 0 && state.clarity >= options.minClarity && state.volume >= options.minVolume),
        delayUnlikely(3),
        scan<VocalState, { smooth: VocalState; raw: VocalState }>(
            ({ smooth }, curr) => {
                return {
                    raw: curr,
                    smooth: {
                        ...curr,
                        // If it's been 500ms since last valid sound, don't do smoothing
                        pitch:
                            curr.time - smooth.time >= breakTime
                                ? curr.pitch
                                : curr.pitch * options.pitchWeight + smooth.pitch * (1 - options.pitchWeight)
                    }
                };
            },
            { raw: defaultState, smooth: defaultState }
        ),
        map(({ raw, smooth }) => ({ raw, pitch: convertPitchToReadable(smooth) }))
    );
};
