import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children, redirectTo, role }) {
    let isAuthenticated = !!localStorage.getItem('token');
    let userRole = null;

    if (isAuthenticated) {
        try {
            const decodedToken = jwtDecode(localStorage.getItem('token'));
            userRole = decodedToken.user_type;
            const exp = decodedToken.exp;

            if (Date.now() >= exp * 1000) {
                alert('Login Timeout!');
                localStorage.removeItem('token');
                return <Navigate to={'/login'} />;
            }
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem('token');
            return <Navigate to={'/login'} />;
        }
    }

    return isAuthenticated && role?.includes(userRole) ? children : <Navigate to={redirectTo} />;
}
