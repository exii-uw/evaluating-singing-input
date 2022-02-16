import React from 'react';
import { sustainLength$ } from '../detector/shared';

const useSustainLength = () => {
    const [sustainLength, setSustainLength] = React.useState(0);
    React.useEffect(() => {
        const sub = sustainLength$.subscribe((sus) => setSustainLength(sus));
        return () => sub.unsubscribe();
    }, []);

    return [sustainLength, (sustain: number) => sustainLength$.next(sustain)] as const;
};

export default useSustainLength;
