import React from 'react';
import Form from '../form/Form';
import { FormItem, FormTypes } from '../form/formTypes';
import { CalibrationTask, CalibrationTaskType } from './calibrationTasks';
import CalibrationSingPage from './CalibrationSingPage';
import MessagePage from '../message/MessagePage';
import RangeSelectionPage from './rangeSelection/RangeSelectionPage';
import { convertNoteToString } from '../../../utils/pitchConverter';
import { tonic$ } from '../../detector/shared';
import VideoPage from '../video/VideoPage';

export interface CalibrationResult {
    startNote: number;
    minNote: number;
    maxNote: number;
}

export interface CalibrationProps {
    header: string;
    onComplete?: (result: CalibrationResult) => void;
}

const getError = (val: any) => (val === undefined ? 'This question is required' : undefined);
const pluralize = (num: number, word: string) => `${num} ${word}${num !== 1 ? 's' : ''}`;

const comfortFormID = 'comfort-2';
const comfortForm = (isHigh: boolean): FormItem[] => [
    {
        id: comfortFormID,
        header: `Can you comfortably sing ${isHigh ? 'higher' : 'lower'}?`,
        type: FormTypes.RADIO,
        options: ['Yes', 'No'],
        getError
    }
];

const Calibration = ({ onComplete }: CalibrationProps): React.ReactElement<CalibrationProps> => {
    const [currIdx, setCurrIdx] = React.useState(0);
    const [prvIdx, setPrvIdx] = React.useState(-1);
    const [minNote, setMinNote] = React.useState(0);
    const [maxNote, setMaxNote] = React.useState(0);
    const [error, setError] = React.useState('');

    const next = () => {
        setPrvIdx(currIdx);
        setCurrIdx((idx) => idx + 1);
    };
    const prev = () => {
        setPrvIdx(currIdx);
        setCurrIdx((idx) => idx - 1);
    };

    const calibrationTasks: CalibrationTask[] = [
        // Tutorial
        {
            type: CalibrationTaskType.VIDEO,
            props: {
                header: 'Calibration',
                text: 'Before you start performing the calibration, watch this short video demonstration.',
                embedID: '5SB1mcJ9nw0',
                onComplete: next
            }
        },
        // Get bottom of range
        {
            type: CalibrationTaskType.SING,
            props: {
                header: 'Calibration',
                startMessage:
                    prvIdx - 1 === currIdx
                        ? `This time, try going a bit lower. Sing a comfortable, low pitch`
                        : `Sing a pitch that is low but still comfortable`,
                onComplete: (note: number) => {
                    setMinNote(note);
                    next();
                }
            }
        },
        {
            type: CalibrationTaskType.FORM,
            props: {
                header: 'Calibration',
                form: comfortForm(false),
                onComplete: (responses) => {
                    if (responses[comfortFormID] !== 'No') prev();
                    else next();
                }
            }
        },
        {
            type: CalibrationTaskType.SING,
            props: {
                error,
                header: 'Calibration',
                startMessage:
                    prvIdx - 1 === currIdx
                        ? `This time, try going a bit higher. Sing a comfortable, high pitch`
                        : `Sing a pitch that is high but still comfortable`,
                onComplete: (note: number) => {
                    if (note < minNote) {
                        setError('The pitch you sang was lower than what you sang last time. Sing a higher pitch than last time.');
                    } else {
                        setError('');
                        setMaxNote(note);
                        next();
                    }
                }
            }
        },
        {
            type: CalibrationTaskType.FORM,
            props: {
                header: 'Calibration',
                form: comfortForm(true),
                onComplete: (responses) => {
                    if (responses[comfortFormID] !== 'No') prev();
                    else next();
                }
            }
        },
        {
            type: CalibrationTaskType.MESSAGE,
            props: {
                header: 'Calibration',
                text: `Your range is from ${convertNoteToString(minNote)} to ${convertNoteToString(maxNote)}. ${
                    maxNote - minNote < 12
                        ? `The minimum range required for this study is 1 octave and the system has determined your range is ${pluralize(
                              12 - (maxNote - minNote),
                              'semitone'
                          )} too small. In the following task, make sure you select a range that is comfortable for you.`
                        : ''
                }`,
                onComplete: next
            }
        },
        {
            type: CalibrationTaskType.MESSAGE,
            props: {
                header: 'Calibration',
                text:
                    'On the next page, you will be selecting the range of pitches you will be singing during the study. Take your time to select the range that is most comfortable for you.',
                onComplete: next
            }
        },
        {
            type: CalibrationTaskType.RANGE_SELECTION,
            props: {
                header: 'Calibration',
                minNote,
                maxNote,
                onComplete: (startNote) => {
                    tonic$.next(startNote); // Set the tonic on this device
                    onComplete ? onComplete({ minNote, maxNote, startNote }) : next();
                },
                restart: () => {
                    setPrvIdx(currIdx);
                    setCurrIdx(0);
                }
            }
        },
        {
            type: CalibrationTaskType.MESSAGE,
            props: {
                header: 'Calibration',
                text: 'Calibration complete!'
            }
        }
    ];

    const currTask = calibrationTasks[currIdx];
    switch (currTask.type) {
        case CalibrationTaskType.VIDEO:
            return <VideoPage {...currTask.props} />;
        case CalibrationTaskType.SING:
            return <CalibrationSingPage {...currTask.props} />;
        case CalibrationTaskType.FORM:
            return <Form {...currTask.props} />;
        case CalibrationTaskType.MESSAGE:
            return <MessagePage {...currTask.props} />;
        case CalibrationTaskType.RANGE_SELECTION:
            return <RangeSelectionPage {...currTask.props} />;
    }
};

Calibration.defaultProps = {
    header: 'Calibration'
};

export default Calibration;
