import React from 'react';
import { audioVolume$ } from '../detector/shared';

const useGain = () => {
    const [gain, setGain] = React.useState(0);
    React.useEffect(() => {
        const sub = audioVolume$.subscribe((volume) => setGain(volume));
        return () => sub.unsubscribe();
    }, []);

    return [gain, (volume: number) => audioVolume$.next(volume)] as const;
};

export default useGain;
