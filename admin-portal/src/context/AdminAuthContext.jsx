import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('streamvault_admin_auth') === 'true';
  });

  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('streamvault_admin_profile');
    return saved ? JSON.parse(saved) : {
      username: "admin@streamvault.internal",
      role: "SUPER_ADMIN",
      lastLogin: new Date().toISOString()
    };
  });

  const login = (username, password) => {
    // Default Admin Credentials (can be customized)
    const validUser = "admin";
    const validPass = "admin123";

    if ((username === validUser || username === "admin@streamvault.internal" || username === "nagar") && password === validPass) {
      setIsAdminLoggedIn(true);
      const profile = {
        username: username,
        role: "SUPER_ADMIN",
        lastLogin: new Date().toISOString()
      };
      setAdminUser(profile);
      localStorage.setItem('streamvault_admin_auth', 'true');
      localStorage.setItem('streamvault_admin_profile', JSON.stringify(profile));
      return { success: true };
    }
    return { success: false, message: "Invalid Admin Login ID or Password. Default is: admin / admin123" };
  };

  const logout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('streamvault_admin_auth');
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminLoggedIn, adminUser, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);

