import { TaskTarget } from '../tasks/sing/target';
import { TaskType } from '../../utils/rxjs/recognizers/universalRecognizer';

interface AudioParams {
    target: TaskTarget;
    keyNumber: number;
    octave: number;
}

export const getAudioURL = ({ target, keyNumber, octave }: AudioParams): string => {
    switch (target.type) {
        case TaskType.PITCH:
            const n = target.value + keyNumber + octave * 12;
            return `/audio/note/note-N${n % 12}-O${Math.floor(n / 12)}.mp3`;
        case TaskType.INTERVAL:
            return `/audio/interval/interval-N${keyNumber}-O${octave}-I${target.value}.mp3`;
        case TaskType.MELODY:
            return `/audio/melody${target.startNote}/melody${target.startNote}-N${keyNumber}-O${octave}-M${target.id}.mp3`;
    }
};
