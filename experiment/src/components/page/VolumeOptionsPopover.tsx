import React from 'react';
import OptionsPopover from './OptionsPopover';
import Slider from '@material-ui/core/Slider';
import useGain from '../audio/useGain';
import useSustainLength from '../audio/useSustainLength';

const VolumeOptionsPopover = (): React.ReactElement => {
    const [gain, setGain] = useGain();
    const [sustainLength, setSustainLength] = useSustainLength();

    return (
        <OptionsPopover>
            <h4>Audio volume</h4>
            <Slider
                value={gain}
                onChange={(_, val) => setGain(val as number)}
                min={0}
                max={1}
                step={0.05}
                defaultValue={1}
                valueLabelDisplay="auto"
            />
            <h4>Pitch selection time</h4>
            <p>Shorter is faster, but more challenging</p>
            <Slider
                value={sustainLength}
                onChange={(_, val) => setSustainLength(val as number)}
                min={2}
                max={10}
                step={1}
                valueLabelDisplay="auto"
            />
        </OptionsPopover>
    );
};

export default VolumeOptionsPopover;
