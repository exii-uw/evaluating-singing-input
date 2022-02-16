import { TaskType } from '../../../utils/rxjs/recognizers/universalRecognizer';

export interface PitchTaskTarget {
    type: TaskType.PITCH;
    value: number;
}

export interface IntervalTaskTarget {
    type: TaskType.INTERVAL;
    value: number;
    startNote: number; // Start note (0 is the tonic note)
}

export interface MelodyTaskTarget {
    type: TaskType.MELODY;
    id: string;
    value: number[];
    startNote: number;
}

export type TaskTarget = PitchTaskTarget | IntervalTaskTarget | MelodyTaskTarget;
