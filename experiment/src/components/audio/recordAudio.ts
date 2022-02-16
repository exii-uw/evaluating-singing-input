// @ts-ignore
import MicRecorder from 'mic-recorder-to-mp3';
import { from, Observable, timer } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

const recorder = new MicRecorder({ bitRate: 256 });

// time should be in ms
export const recordAudioFor = (time: number): Observable<Blob> => {
    return from(recorder.start()).pipe(
        concatMap(() => timer(time)),
        concatMap<number, [any, Blob]>(() => recorder.stop().getMp3()),
        map(([_, blob]: [any, Blob]) => blob)
    );
};

export const recordAudio = (): (() => Observable<Blob>) => {
    recorder.start();
    return () => from<[any, Blob]>(recorder.stop().getMp3()).pipe(map(([_, blob]) => blob));
};
