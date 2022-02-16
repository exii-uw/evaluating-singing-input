import { TaskType, UniversalRecognizerState } from '../../../../utils/rxjs/recognizers/universalRecognizer';
import { MelodyTaskTarget, TaskTarget } from '../target';
import { TaskProgressState } from '../../../../utils/rxjs/taskProgress';
import React from 'react';
import CircularPitchMeter, { noteNamesFrom } from './CircularPitchMeter';
import useTonic from '../../../audio/useTonic';
import { convertNumericNoteToString } from '../../../../utils/pitchConverter';
import { mod12 } from '../../../../utils/math';

interface Props {
    state: TaskProgressState<TaskTarget, UniversalRecognizerState>;
    numberLabels: boolean;
}

const noteNumberLabels1 = new Array(12).fill(0).map((_, idx) => convertNumericNoteToString(idx) || '-');
const noteNumberLabels8 = ['(8)', ...noteNumberLabels1.slice(1)];

const getRecognizedFromState = (state: TaskProgressState<TaskTarget, UniversalRecognizerState>, keyNumber: number): number[] => {
    // Deals with case where noteNum = -Infinity at start
    if (!state.recognized || state.isDone) return [mod12(state.pitch.noteNum - keyNumber) || 0];
    switch (state.recognized.type) {
        case TaskType.PITCH:
            return [state.recognized.value];
        case TaskType.INTERVAL:
            return [state.recognized.startNote, state.recognized.value + state.recognized.startNote];
        case TaskType.MELODY:
            return state.recognized.value.map((interval) => (state.recognized as MelodyTaskTarget).startNote + interval);
    }
};

const PitchIndicatorFromState = ({ state, numberLabels }: Props): React.ReactElement => {
    const [tonic] = useTonic();
    const keyNumber = tonic % 12;
    const noteLabels = React.useMemo(() => noteNamesFrom(keyNumber), [keyNumber]);

    // Show the (8) number label iff we have something recognized that is not complete and we are above note 5 in either the
    // interval or melody modes.
    const noteNumberLabels =
        state.recognized &&
        !state.isDone &&
        ((state.type === TaskType.INTERVAL && state.recognized.value > 7) ||
            (state.type === TaskType.MELODY && state.intervals.length > 0 && state.intervals[state.intervals.length - 1] > 7))
            ? noteNumberLabels8
            : noteNumberLabels1;
    return (
        <CircularPitchMeter
            noteLabels={numberLabels ? noteNumberLabels : noteLabels}
            // Deal with when noteNum = -Infinity at start
            noteNum={Math.max(state.pitch.noteNum - keyNumber, 0)}
            error={state.pitch.error || 0}
            recognized={getRecognizedFromState(state, keyNumber)}
            progress={state.recognized && !state.isDone ? 1 : 0}
        />
    );
};

PitchIndicatorFromState.defaultProps = {
    numberLabels: true
};

export default PitchIndicatorFromState;
