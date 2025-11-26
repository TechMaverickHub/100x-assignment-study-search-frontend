# Login API Integration

## Changes Made

### 1. **API Service (`src/services/api.js`)**
- ✅ Added `authAPI` with `login()`, `logout()`, and `refreshToken()` methods
- ✅ Updated token storage to use `accessToken` and `refreshToken` (instead of `authToken`)
- ✅ Added response interceptor for automatic token refresh (ready for future implementation)
- ✅ Updated request interceptor to use `accessToken` from localStorage

### 2. **Login Component (`src/pages/Login.jsx`)**
- ✅ Changed from username/role selection to email/password authentication
- ✅ Integrated with actual login API endpoint (`POST /api/user/login/`)
- ✅ Added loading state with spinner
- ✅ Added error handling and display
- ✅ Maps API role response to frontend role:
  - `"Super Admin"` → `"superadmin"`
  - `"Regular User"` → `"user"`
- ✅ Stores JWT tokens (access and refresh) in localStorage
- ✅ Navigates based on user role after successful login

### 3. **Auth Context (`src/context/AuthContext.jsx`)**
- ✅ Updated to store full user object (pk, email, firstName, lastName, role, etc.)
- ✅ Stores user data as JSON in localStorage
- ✅ Updated logout to call API and clear all tokens
- ✅ Improved token persistence on page reload

### 4. **Layout Component (`src/components/Layout.jsx`)**
- ✅ Updated to display user's full name or email (instead of username)
- ✅ Falls back gracefully if name is not available

## API Integration Details

### Login Endpoint
```
POST /api/user/login/
Content-Type: application/json

Request Body:
{
  "email": "user@email.com",
  "password": "password123"
}
```

### Response Structure
```json
{
  "message": "Login successful.",
  "status": 200,
  "results": {
    "refresh": "eyJhbGci...",
    "access": "eyJhbGci...",
    "user": {
      "pk": 1,
      "email": "user@email.com",
      "first_name": "John",
      "last_name": "Doe",
      "delivery_time": "08:00:00",
      "is_active": true,
      "role": {
        "pk": 2,
        "name": "Regular User"  // or "Super Admin"
      }
    }
  }
}
```

## Token Management

### Storage
- `accessToken`: JWT access token (used for API authentication)
- `refreshToken`: JWT refresh token (for token renewal)
- `user`: JSON stringified user object

### Usage
- Access token is automatically added to all API requests via axios interceptor
- Token format: `Authorization: Bearer <accessToken>`

## Role Mapping

| API Role Name | Frontend Role | Dashboard Access |
|--------------|---------------|------------------|
| "Super Admin" | `"superadmin"` | Admin Dashboard |
| "Regular User" | `"user"` | User Dashboard |

## Error Handling

- ✅ Network errors are caught and displayed
- ✅ API error responses are parsed and shown to user
- ✅ Invalid credentials show user-friendly error message
- ✅ Loading states prevent duplicate submissions

## Security Notes

1. **CSRF Token**: The curl example includes a CSRF token, but for JWT-based API authentication, CSRF tokens are typically not required. The backend should have CSRF exempt for API endpoints.

2. **Token Storage**: Currently using localStorage. For production, consider:
   - Using httpOnly cookies (requires backend support)
   - Implementing token refresh logic
   - Adding token expiration checks

3. **Password**: Never stored or logged. Only sent during login request.

## Testing

To test the login:
1. Start the frontend: `yarn dev`
2. Navigate to `http://localhost:3000/login`
3. Enter valid credentials:
   - Email: `abhishek@email.com`
   - Password: `12345`
4. Should redirect to appropriate dashboard based on role

## Next Steps (Optional Enhancements)

1. **Token Refresh**: Implement automatic token refresh when access token expires
2. **Remember Me**: Add option to persist login across sessions
3. **Password Reset**: Add forgot password functionality
4. **Session Management**: Add session timeout handling
5. **Multi-factor Auth**: If backend supports it

## Files Modified

- ✅ `src/services/api.js` - Added auth API and token interceptors
- ✅ `src/pages/Login.jsx` - Complete rewrite for email/password login
- ✅ `src/context/AuthContext.jsx` - Updated user data structure and token handling
- ✅ `src/components/Layout.jsx` - Updated user display name

