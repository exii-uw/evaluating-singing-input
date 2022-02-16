import React from 'react';
import { tonic$ } from '../detector/shared';

const useTonic = () => {
    const [tonic, setTonic] = React.useState(0);
    React.useEffect(() => {
        const sub = tonic$.subscribe((volume) => setTonic(volume));
        return () => sub.unsubscribe();
    }, []);

    return [tonic, (volume: number) => tonic$.next(volume)] as const;
};

export default useTonic;
