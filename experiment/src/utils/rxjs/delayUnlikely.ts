import { VocalState } from '../../components/detector/VoiceDetector';
import { Observable } from 'rxjs';
import { convertHzToNoteNum } from '../pitchConverter';

export const delayUnlikely = (maxDelay: number) => (source: Observable<VocalState>): Observable<VocalState> => {
    let lastPitchDone: VocalState | undefined = undefined;
    let delayed: VocalState[] = [];
    return new Observable((sub) => {
        source.subscribe({
            next: (state) => {
                if (!lastPitchDone) {
                    lastPitchDone = state;
                    delayed = [];
                    sub.next(state);
                } else if (Math.abs(convertHzToNoteNum(state.pitch) - convertHzToNoteNum(lastPitchDone.pitch)) > 12) {
                    // If we are 12 semitones off, delay this one, unless we already delayed,
                    // in which case release the floodgates
                    if (delayed.length < maxDelay) delayed.push(state);
                    else {
                        lastPitchDone = state;
                        delayed.forEach((s) => sub.next(s));
                        sub.next(state);
                        delayed = [];
                    }
                } else {
                    // Otherwise, we are golden! Just keep going.
                    // Note: this might skip the previous delayed item because it was unlikely to be good
                    lastPitchDone = state;
                    delayed = [];
                    sub.next(state);
                }
            }
        });
    });
};
