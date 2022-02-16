import { audioContext } from '../../audio/audioContext';
import React from 'react';
import { IAudioContext, IOscillatorNode } from 'standardized-audio-context';
import { convertNoteNumToHz } from '../../../utils/pitchConverter';

const useSine = () => {
    const ctx = React.useContext(audioContext);
    const oscillator = React.useRef<IOscillatorNode<IAudioContext>>();
    const currNote = React.useRef(-1);

    const start = (noteNum: number): void => {
        oscillator.current = ctx.audioContext.createOscillator();
        oscillator.current.type = 'sine';
        oscillator.current.frequency.value = convertNoteNumToHz(noteNum);
        oscillator.current.connect(ctx.foregroundGain.node());
        currNote.current = noteNum;
        oscillator.current.start(0);
    };

    const stop = () => {
        if (oscillator.current) {
            oscillator.current.stop();
            oscillator.current.disconnect();
            oscillator.current = undefined;
            currNote.current = -1;
        }
    };

    const toggle = (noteNum: number): void => {
        const shouldStart = noteNum !== currNote.current;
        stop();
        if (shouldStart) start(noteNum);
    };

    return { start, stop, toggle };
};

export default useSine;
