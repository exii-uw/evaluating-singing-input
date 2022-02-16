import { AudioContext, IAudioContext, IGainNode } from 'standardized-audio-context';
import React from 'react';
import { audioVolume$ } from '../detector/shared';
import GainNode from './GainNode';

// Get a single AudioContext for our entire application. We use subscriptions to make
// sure it loads properly.

interface AudioContextContents {
    audioContext: AudioContext;
    gain: IGainNode<IAudioContext>;
    backgroundGain: GainNode;
    foregroundGain: GainNode;
}

const context = new AudioContext();
export const defaultAudioContext: AudioContextContents = {
    audioContext: context,
    gain: context.createGain(),
    backgroundGain: new GainNode(context),
    foregroundGain: new GainNode(context)
};
defaultAudioContext.backgroundGain.connect(defaultAudioContext.gain);
defaultAudioContext.foregroundGain.connect(defaultAudioContext.gain);
defaultAudioContext.gain.connect(context.destination);

audioVolume$.subscribe((volume) => defaultAudioContext.gain.gain.setValueAtTime(volume, 0));

export const audioContext = React.createContext<AudioContextContents>(defaultAudioContext);
