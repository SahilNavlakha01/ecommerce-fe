interface User {
  id: string | number;
  name: string;
  email: string;
  role?: number;
  userRole?: number;
  companyName?: string;
  city?: string;
  state?: string;
  businessType?: string;
  phone?: string;
}

interface AuthCookieResult {
  token: string | null;
  user: User | null;
}

export const setAuthCookie = (token: string, user: User, userType: 'admin' | 'user' = 'admin'): void => {
  const tokenKey = userType === 'admin' ? 'adminToken' : 'userToken';
  const userKey = userType === 'admin' ? 'adminUser' : 'userData';

  document.cookie = `${tokenKey}=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
  document.cookie = `${userKey}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${7 * 24 * 60 * 60}`;
};

export const getAuthCookie = (userType: 'admin' | 'user' = 'admin'): AuthCookieResult => {
  const cookies = document.cookie.split(';');
  const tokenKey = userType === 'admin' ? 'adminToken' : 'userToken';
  const userKey = userType === 'admin' ? 'adminUser' : 'userData';

  const token = cookies.find(c => c.trim().startsWith(`${tokenKey}=`))?.split('=')[1] || null;
  const userCookie = cookies.find(c => c.trim().startsWith(`${userKey}=`))?.split('=').slice(1).join('=');
  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie));
    } catch {
      try { user = JSON.parse(userCookie); } catch { user = null; }
    }
  }
  return { token, user };
};

export const clearAuthCookie = (userType: 'admin' | 'user' = 'admin'): void => {
  const tokenKey = userType === 'admin' ? 'adminToken' : 'userToken';
  const userKey = userType === 'admin' ? 'adminUser' : 'userData';

  document.cookie = `${tokenKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${userKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export const getAuthToken = (userType: 'admin' | 'user' = 'admin'): string => {
  const { token } = getAuthCookie(userType);
  return token || '';
};

export const isAuthenticated = (userType: 'admin' | 'user' = 'admin'): boolean => {
  const { token } = getAuthCookie(userType);
  return !!token;
};

export const isAdminAuthenticated = (): boolean => isAuthenticated('admin');
export const isUserAuthenticated = (): boolean => isAuthenticated('user');

export const isCustomerLoggedIn = (): boolean => {
  try {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('userToken='))
      ?.split('=')[1];

    const userData = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=')[1];

    if (!token || !userData) return false;

    const decoded = JSON.parse(atob(token.split('.')[1]));
    const userDataObj = JSON.parse(decodeURIComponent(userData));

    return (decoded.role === 1 || decoded.role === 2) && decoded.id === userDataObj.id;
  } catch {
    return false;
  }
};