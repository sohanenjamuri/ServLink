import { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user data is in cookies on initial load
    const storedUser = Cookies.get('user');
    const storedToken = Cookies.get('token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from cookies', e);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    // Store in cookies with 7 days expiration
    Cookies.set('user', JSON.stringify(userData), { expires: 7 });
    Cookies.set('token', token, { expires: 7 });
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('user');
    Cookies.remove('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
