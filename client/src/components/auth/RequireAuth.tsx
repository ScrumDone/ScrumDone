import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthUserName } from '../../lib/authSession';

type RequireAuthProps = {
    children: React.ReactNode;
};

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
    const userName = useAuthUserName();
    const location = useLocation();

    if (!userName) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <>{children}</>;
};

export default RequireAuth;
