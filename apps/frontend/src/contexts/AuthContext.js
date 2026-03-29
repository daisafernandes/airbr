import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('@airbr:token'));
    const signIn = useCallback((newToken) => {
        localStorage.setItem('@airbr:token', newToken);
        setToken(newToken);
    }, []);
    const signOut = useCallback(() => {
        localStorage.removeItem('@airbr:token');
        setToken(null);
    }, []);
    const value = useMemo(() => ({
        token,
        isAuthenticated: !!token,
        signIn,
        signOut,
    }), [token, signIn, signOut]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
