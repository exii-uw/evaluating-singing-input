// Gets the string representing the currently recognized interaction
import { TaskType } from './rxjs/recognizers/universalRecognizer';
import { convertNoteToString, convertNumericNoteToString } from './pitchConverter';
import { TaskTarget } from '../components/tasks/sing/target';

export const getNumberStringForTarget = (target: TaskTarget): string => {
    switch (target.type) {
        case TaskType.PITCH:
            return `${convertNumericNoteToString(target.value)}`;
        case TaskType.INTERVAL:
            return `${convertNumericNoteToString(target.startNote)}-${convertNumericNoteToString(target.startNote + target.value)}`;
        case TaskType.MELODY:
            return target.value
                .slice(1)
                .reduce(
                    (acc, interval) => `${acc}-${convertNumericNoteToString(interval + target.startNote)}`,
                    `${convertNumericNoteToString(target.startNote + target.value[0])}`
                );
    }
};

export const getLetterStringForTarget = (target: TaskTarget, key: number, includeOctave = true): string => {
    const adjust = (n: number) => n + key;
    switch (target.type) {
        case TaskType.PITCH:
            return convertNoteToString(adjust(target.value), includeOctave);
        case TaskType.INTERVAL:
            return `${convertNoteToString(adjust(target.startNote), includeOctave)}–${convertNoteToString(
                adjust(target.value),
                includeOctave
            )}`;
        case TaskType.MELODY:
            return target.value.reduce((acc, next) => {
                const note = convertNoteToString(adjust(next + target.startNote), includeOctave);
                return acc.length > 0 ? `${acc}–${note}` : note;
            }, '');
    }
};
