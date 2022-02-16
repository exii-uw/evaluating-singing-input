import { BehaviorSubject } from 'rxjs';
import { CookieStorage } from 'cookie-storage';

export const cookieStorage = new CookieStorage();

const defaultTonic = 44;
export const tonic$ = new BehaviorSubject<number>(defaultTonic);

// Keep the cookie updated with the calibration
const initialTonic = cookieStorage.getItem('tonic');
if (initialTonic) tonic$.next(parseInt(initialTonic));
tonic$.subscribe((tonic) => cookieStorage.setItem('tonic', `${tonic}`));

export const defaultSustainLength = 4;
export const sustainLength$ = new BehaviorSubject<number>(defaultSustainLength);
// To allow changing the sustainLength$, simply uncomment below.
// const initialSustainLength = cookieStorage.getItem('sustainLength');
// if (initialSustainLength) sustainLength$.next(parseInt(initialSustainLength));
// sustainLength$.subscribe((sustainLength) => cookieStorage.setItem('sustainLength', `${sustainLength}`));

const defaultAudioVolume = 1;
export const audioVolume$ = new BehaviorSubject<number>(defaultAudioVolume);
// To allow changing the audioVolume$, simply uncomment below.
// const initialVolume = cookieStorage.getItem('audioVolume');
// if (initialVolume) audioVolume$.next(parseFloat(initialVolume));
// audioVolume$.subscribe((audioVolume) => cookieStorage.setItem('audioVolume', `${audioVolume}`));
