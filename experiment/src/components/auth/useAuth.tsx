import { getAuth, User } from 'firebase/auth';
import React from 'react';

const useAuth = () => {
    const [user, setUser] = React.useState<User | null>(null);
    React.useEffect(() => {
        // Return for unsubscribe
        const unsubscribe = getAuth().onAuthStateChanged((user) => setUser(user));
        return () => unsubscribe();
    }, []);

    return user;
};

export default useAuth;
