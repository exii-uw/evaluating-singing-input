import React from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

interface Props<ID> {
    options: { id: ID; content: React.ReactNode }[];
    value: ID;
    setValue: (id: ID) => void;
}

function ToggleButtons<ID>({ options, value, setValue }: Props<ID>) {
    return (
        <ToggleButtonGroup value={value} onChange={(_, newVal) => setValue(newVal)} exclusive>
            {options.map((opt) => (
                <ToggleButton value={opt.id}>{opt.content}</ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}

export default ToggleButtons;
