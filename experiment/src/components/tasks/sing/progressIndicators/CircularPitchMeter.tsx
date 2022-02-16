import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../../theme';
import { convertNoteToString } from '../../../../utils/pitchConverter';
import clsx from 'clsx';
import { mod12 } from '../../../../utils/math';

interface PopupPitchMeterProps {
    noteNum: number;
    error: number;
    recognized: number[];
    progress: number;
    label?: string;
    noteLabels: string[];
}

const radius = 250;
const noteLabelRadius = 0.85;
const strokeWidth = 24;
const innerWidth = 70;
const center = radius + strokeWidth;

const useStyles = makeStyles<Theme, PopupPitchMeterProps>((theme) => ({
    root: {
        width: '15rem',
        height: '15rem',
        padding: '1rem',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '50%',
        boxShadow: theme.shadows[1]
    },
    svg: {
        width: '100%',
        height: '100%'
    },
    circle: {
        fill: 'transparent',
        stroke: '#FFF',
        strokeWidth: 4
    },
    arc: ({ progress }) => ({
        fill: progress > 0 ? theme.palette.primary.dark : theme.palette.background.paper,
        transition: 'fill 0.2s',
        strokeWidth: 0
    }),
    currentArc: ({ progress }) => ({
        fill: progress > 0 ? theme.palette.primary.main : theme.palette.text.primary,
        transition: 'fill 0.2s',
        strokeWidth: 0
    }),
    recognized: ({ progress, noteNum, recognized }) => ({
        fill: theme.palette.primary.main,
        transition: 'opacity 0.2s',
        strokeWidth: 0,
        opacity: progress > 0 && recognized.length && recognized[recognized.length - 1] === mod12(noteNum) ? 1 : 0
    }),
    label: {
        fill: '#FFF',
        fontFamily: theme.typography.fontFamily,
        fontSize: radius / 8,
        dominantBaseline: 'middle',
        textAnchor: 'middle',
        fontWeight: 300,
        transition: 'font-weight 0.2s'
    },
    currentLabel: {
        fontWeight: 700
    },
    centerLabel: {
        fontWeight: 400,
        fontSize: radius / 5
    },
    mask: {
        fill: 'transparent',
        stroke: '#FFF',
        strokeWidth: 2 * radius,
        transition: 'all 0.2s'
    }
}));

export const noteNamesFrom = (start: number) => new Array<string>(12).fill('').map((_, id) => convertNoteToString(id + start, false));

// Remove partial eventually
const CircularPitchMeter = (props: PopupPitchMeterProps) => {
    const classes = useStyles(props);

    // Angles for the curr note
    const currAngle = (props.noteNum - 0.5 + props.error) * (360 / 12) - 90; // in degrees
    const recogAngle = (props.noteNum - 0.5) * (360 / 12) - 90; // in degrees

    // Assemble array of pairs for showing intervals recognized
    const intervals: [number, number][] = [];
    for (let i = 0; i < props.recognized.length - 1; i++) {
        intervals.push([props.recognized[i], props.recognized[i + 1]]);
    }
    if (intervals.length === 0) intervals.push([props.recognized[0], props.recognized[0]]);

    return (
        <div className={classes.root}>
            <svg viewBox={`0 0 ${center * 2} ${center * 2}`} className={classes.svg}>
                {/* The current note being sung */}
                <mask id="currNoteMask">
                    <circle
                        r={radius}
                        cx={center}
                        cy={center}
                        className={classes.mask}
                        // 1/12 of the circumference
                        strokeDasharray={`${(1 / 12) * Math.PI * 2 * radius} ${Math.PI * 2 * radius}`}
                        transform={`rotate(${currAngle} ${center} ${center})`}
                    />
                    <circle r={radius} cx={center} cy={center} fill="#000" />
                </mask>
                <circle cx={center} cy={center} r={radius + strokeWidth} className={classes.currentArc} mask="url(#currNoteMask)" />

                {/* The intervals recognized */}
                {intervals.map((interval, idx) => {
                    const angleMagnitude = Math.min(Math.abs(interval[0] - interval[1]) + 1, 12) / 12; // in [0, 1]
                    const angle = (Math.min(interval[0], interval[1]) - 0.5) * (360 / 12) - 90; // in degrees
                    const r = radius - innerWidth * idx;

                    return (
                        <React.Fragment key={idx}>
                            <mask id={`intervalMask${idx}`}>
                                <circle
                                    r={r}
                                    cx={center}
                                    cy={center}
                                    className={classes.mask}
                                    // 1/12 of the circumference
                                    strokeDasharray={`${angleMagnitude * Math.PI * 2 * r} ${Math.PI * 2 * r}`}
                                    transform={`rotate(${angle} ${center} ${center})`}
                                />
                                <circle
                                    r={r - innerWidth} // Remove the inner chunk
                                    cx={center}
                                    cy={center}
                                    fill="#000"
                                />
                            </mask>
                            <circle cx={center} cy={center} r={r} className={classes.arc} mask={`url(#intervalMask${idx})`} />
                        </React.Fragment>
                    );
                })}

                {/* The current note being recognized */}
                <mask id="currRecognizedMask">
                    <circle
                        r={radius}
                        cx={center}
                        cy={center}
                        className={classes.mask}
                        // 1/12 of the circumference
                        strokeDasharray={`${(1 / 12) * Math.PI * 2 * radius} ${Math.PI * 2 * radius}`}
                        transform={`rotate(${recogAngle} ${center} ${center})`}
                    />
                    <circle
                        r={radius - intervals.length * innerWidth} // Remove the inner chunk
                        cx={center}
                        cy={center}
                        fill="#000"
                    />
                </mask>
                <circle cx={center} cy={center} r={radius} className={classes.recognized} mask="url(#currRecognizedMask)" />

                {/* The outlined circle */}
                <circle cx={center} cy={center} r={radius} className={classes.circle} />

                {/* The label in the center of the svg */}
                <text x={center} y={center} className={clsx(classes.label, classes.centerLabel)}>
                    {props.label}
                </text>
                {props.noteLabels.map((label, idx) => (
                    <text
                        x={center + Math.sin((idx * Math.PI) / 6) * radius * noteLabelRadius}
                        y={center - Math.cos((idx * Math.PI) / 6) * radius * noteLabelRadius}
                        key={`${label}-${idx}`}
                        className={clsx(classes.label, props.recognized.map((r) => mod12(r)).includes(idx) && classes.currentLabel)}
                    >
                        {label}
                    </text>
                ))}
            </svg>
        </div>
    );
};

CircularPitchMeter.defaultProps = {
    noteLabels: noteNamesFrom(0),
    startNum: 0,
    startError: 0,
    progress: 0
};

export default CircularPitchMeter;
