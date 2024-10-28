import { jwtDecode } from 'jwt-decode';

export default function GetUserRole(token) {
    let isAuthenticated = !!token
    var userRole = null
    if (isAuthenticated) {
        userRole = jwtDecode(token).user_type
    }
    return userRole
}