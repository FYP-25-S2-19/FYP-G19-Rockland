// /lib/auth-utils.ts
export interface TokenPayload {
  user_id: number
  email: string
  user_type_id: number
  user_type_name: string
  first_name: string
  last_name: string
  exp: number
  iat: number
}

// Define the return types for getAuthInfo
export type AuthInfoSuccess = {
  isAuthenticated: true
  token: string
  email: string
  userId: number
  userType: string
  firstName: string
  lastName: string
  fullName: string
}

export type AuthInfoFailure = {
  isAuthenticated: false
  error: string
}

export type AuthInfo = AuthInfoSuccess | AuthInfoFailure

// Decode JWT token without verification (client-side only)
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    // JWT has 3 parts: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    // Decode the payload (middle part)
    const payload = parts[1]
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '=='.substr(0, (4 - payload.length % 4) % 4)
    
    // Decode base64
    const decodedPayload = atob(paddedPayload)
    
    // Parse JSON
    const parsedPayload: TokenPayload = JSON.parse(decodedPayload)
    
    console.log('🔍 Decoded token payload:', parsedPayload) // Debug log
    
    return parsedPayload
  } catch (error) {
    console.error('❌ Error decoding token:', error)
    return null
  }
}

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token)
  if (!payload) return true
  
  const currentTime = Math.floor(Date.now() / 1000)
  const isExpired = payload.exp < currentTime
  
  if (isExpired) {
    console.log('❌ Token is expired')
  } else {
    const timeLeft = payload.exp - currentTime
    console.log(`✅ Token valid for ${Math.floor(timeLeft / 60)} more minutes`)
  }
  
  return isExpired
}

// Get user email from token
export const getEmailFromToken = (token: string): string | null => {
  const payload = decodeToken(token)
  return payload?.email || null
}

// Get user ID from token
export const getUserIdFromToken = (token: string): number | null => {
  const payload = decodeToken(token)
  return payload?.user_id || null
}

// Get user type from token
export const getUserTypeFromToken = (token: string): string | null => {
  const payload = decodeToken(token)
  return payload?.user_type_name || null
}

// Get full name from token
export const getFullNameFromToken = (token: string): string | null => {
  const payload = decodeToken(token)
  if (!payload) return null
  
  const firstName = payload.first_name || ''
  const lastName = payload.last_name || ''
  return `${firstName} ${lastName}`.trim() || null
}

// Complete authentication check with proper TypeScript typing
export const getAuthInfo = (): AuthInfo => {
  const token = localStorage.getItem('adminToken')
  
  if (!token) {
    console.log('❌ No token found in localStorage')
    return { isAuthenticated: false, error: 'No token found' }
  }
  
  if (isTokenExpired(token)) {
    console.log('❌ Token expired, cleaning up localStorage')
    // Clean up expired token
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminEmail')
    localStorage.removeItem('isAdminLoggedIn')
    return { isAuthenticated: false, error: 'Token expired' }
  }
  
  const payload = decodeToken(token)
  if (!payload) {
    console.log('❌ Invalid token payload')
    return { isAuthenticated: false, error: 'Invalid token payload' }
  }
  
  const { email, user_id, user_type_name, first_name, last_name } = payload
  
  if (!email) {
    console.log('❌ No email in token payload')
    return { isAuthenticated: false, error: 'Invalid token payload - no email' }
  }
  
  console.log('✅ Authentication successful:', { 
    email, 
    userId: user_id, 
    userType: user_type_name,
    name: `${first_name} ${last_name}`
  })
  
  return {
    isAuthenticated: true,
    token,
    email,
    userId: user_id,
    userType: user_type_name,
    firstName: first_name,
    lastName: last_name,
    fullName: `${first_name} ${last_name}`.trim()
  }
}

// Type guard to check if auth is successful
export const isAuthSuccess = (authInfo: AuthInfo): authInfo is AuthInfoSuccess => {
  return authInfo.isAuthenticated === true
}

// Helper function to safely get email from auth info
export const getEmailFromAuthInfo = (authInfo: AuthInfo): string | null => {
  return isAuthSuccess(authInfo) ? authInfo.email : null
}

// Helper function to safely get token from auth info
export const getTokenFromAuthInfo = (authInfo: AuthInfo): string | null => {
  return isAuthSuccess(authInfo) ? authInfo.token : null
}