import { audioContext } from './audioContext';
import React from 'react';
import { combineLatest, concat, interval, of, Subscription, timer } from 'rxjs';
import { concatMap, delay, scan } from 'rxjs/operators';
import { IAudioContext, IAudioNode, IGainNode } from 'standardized-audio-context';
import { getCachedAudio } from './getCachedAudio';

const backgroundGain = 0.3;
const foregroundRampUpTime = 0.1;
const foregroundRampDownTime = 1;
const overlapTime = 0.5;
const pauseUntil = 0.5; // Avoid race conditions by waiting 0.5 seconds after creating things before starting them
const gainUpCurve: Float32Array = new Float32Array([0, 1]);
const gainDownCurve: Float32Array = new Float32Array([1, 0]);

interface Props {
    keyNumber: number;
    hasBackground?: boolean;
}

interface Gains {
    gainOut: IGainNode<IAudioContext>;
    toDisconnect?: IGainNode<IAudioContext>;
}

const useAudio = ({ keyNumber, hasBackground }: Props) => {
    const ctx = React.useContext(audioContext);

    React.useEffect(() => {
        const sources: IAudioNode<any>[] = [];
        const subscriptions: Subscription[] = [];

        if (hasBackground) {
            subscriptions.push(
                combineLatest([
                    getCachedAudio(`/audio/background/background-${keyNumber}-start.mp3`, ctx.audioContext),
                    getCachedAudio(`/audio/background/background-${keyNumber}-loop.mp3`, ctx.audioContext)
                ]).subscribe(([startAudio, loopAudio]) => {
                    const startSource = ctx.audioContext.createBufferSource();
                    startSource.buffer = startAudio;

                    // Create a gain node
                    const startGain = ctx.audioContext.createGain();
                    startSource.connect(startGain);
                    startGain.connect(ctx.backgroundGain.node());
                    sources.push(startGain);

                    // Start the sound
                    startSource.start(ctx.audioContext.currentTime + pauseUntil);

                    // Start when the start is done
                    subscriptions.push(
                        timer((startSource.buffer.duration - overlapTime) * 1000)
                            .pipe(
                                concatMap(() =>
                                    concat(of(0), interval((loopAudio.duration - overlapTime) * 1000)).pipe(
                                        scan<any, Gains>(
                                            ({ gainOut }) => {
                                                const loopSource = ctx.audioContext.createBufferSource();
                                                loopSource.buffer = loopAudio;

                                                // Create a gain node
                                                const gainIn = ctx.audioContext.createGain();
                                                gainIn.gain.setValueAtTime(0, ctx.audioContext.currentTime);
                                                sources.push(gainIn);

                                                // Connect the loop to the gain and start it
                                                loopSource.connect(gainIn);
                                                gainIn.connect(ctx.backgroundGain.node());
                                                loopSource.start(ctx.audioContext.currentTime + pauseUntil);

                                                gainIn.gain.setValueCurveAtTime(
                                                    gainUpCurve,
                                                    ctx.audioContext.currentTime + pauseUntil,
                                                    overlapTime
                                                );
                                                gainOut.gain.setValueCurveAtTime(
                                                    gainDownCurve,
                                                    ctx.audioContext.currentTime + pauseUntil,
                                                    overlapTime
                                                );

                                                return { gainOut: gainIn, toDisconnect: gainOut };
                                            },
                                            { gainOut: startGain }
                                        )
                                    )
                                ),
                                // Wait until the loop is over, then remove the old source node to clean things up
                                delay(2000 * overlapTime)
                            )
                            .subscribe(() => {
                                sources.shift()?.disconnect();
                            })
                    );
                })
            );
        }

        return () => {
            // Clean up the sources if we're unmounting, otherwise the sound will continue!
            sources.forEach((node) => node.disconnect());
            subscriptions.forEach((sub) => sub.unsubscribe());
        };
    }, [keyNumber, hasBackground, ctx]);

    // Can align timing with background music by recording start time of the music.
    const play = React.useCallback(
        (url: string) => {
            // Fade the background music
            const startAtGoal = ctx.audioContext.currentTime + foregroundRampUpTime;
            ctx.backgroundGain.schedule({ to: backgroundGain, duration: foregroundRampUpTime * 1000 });
            ctx.foregroundGain.schedule({ to: 1, duration: 100 });

            getCachedAudio(url, ctx.audioContext).subscribe((buffer) => {
                const source = ctx.audioContext.createBufferSource();
                source.buffer = buffer;

                const startAt = startAtGoal < ctx.audioContext.currentTime ? ctx.audioContext.currentTime : startAtGoal;
                source.connect(ctx.foregroundGain.node());
                source.start(startAt);

                // Bring back the background music
                ctx.backgroundGain.schedule({
                    to: 1,
                    duration: foregroundRampDownTime * 1000,
                    // at can be negative, acts as 0
                    at: (buffer.duration - foregroundRampDownTime) * 1000
                });
                ctx.foregroundGain.schedule({
                    to: 0,
                    duration: foregroundRampDownTime * 1000,
                    at: (buffer.duration - foregroundRampDownTime) * 1000
                });
            });
        },
        [ctx]
    );

    return { play };
};

export default useAudio;
