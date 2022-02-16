import { PitchDetector } from 'pitchy';
import { interval, Observable, Subject, Subscription } from 'rxjs';
import { shareReplay, startWith } from 'rxjs/operators';
import { IAudioContext, IAudioNode } from 'standardized-audio-context';

export interface VocalState {
    pitch: number; // From 0 to 1000 (approx.)
    clarity: number; // From 0 to 1
    volume: number; // From 0 to 100
    time: number;
}

class VoiceDetector {
    private readonly subscriptions: Subscription[] = [];
    private readonly nodes: IAudioNode<any>[] = [];
    private readonly events$: Subject<VocalState> = new Subject();
    private readonly state$: Observable<VocalState>;
    private readonly audioContext: IAudioContext;
    constructor(audioContext: IAudioContext) {
        this.audioContext = audioContext;
        this.state$ = this.events$.pipe(startWith({ pitch: 0, clarity: 0, volume: 0, time: -10000 }), shareReplay(1));

        if (!navigator.mediaDevices) throw new Error('Error getting media devices from browser: none are available');

        navigator.mediaDevices
            // Don't disable echoCancellation, noiseSuppression, autoGainControl for best results
            .getUserMedia({ audio: true })
            .then((stream) => {
                const sourceNode = audioContext.createMediaStreamSource(stream);
                this.nodes.push(sourceNode);

                const analyserNode = audioContext.createAnalyser();
                analyserNode.fftSize = 2048;
                sourceNode.connect(analyserNode);
                this.nodes.push(analyserNode);

                // For processing the pitch
                const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
                const timeData = new Float32Array(detector.inputLength);
                const freqData = new Uint8Array(analyserNode.frequencyBinCount);
                audioContext.resume();

                // Do this every 50 ms
                this.subscriptions.push(
                    interval(50).subscribe(() => {
                        analyserNode.getFloatTimeDomainData(timeData);
                        const [pitch, clarity] = detector.findPitch(timeData, audioContext.sampleRate);

                        analyserNode.getByteFrequencyData(freqData);
                        const volume = this.getVolume(freqData);
                        this.events$.next({ pitch, clarity, volume, time: performance.now() });
                    })
                );
            });
    }

    private getVolume(input: Uint8Array): number {
        return input.reduce((acc, next) => acc + next / input.length, 0);
    }

    public resume(): void {
        this.audioContext.resume();
    }

    public getState(): Observable<VocalState> {
        return this.state$;
    }

    public cleanup(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.nodes.forEach((node) => node.disconnect());
    }
}

export default VoiceDetector;
