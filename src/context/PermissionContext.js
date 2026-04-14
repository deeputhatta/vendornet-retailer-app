import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'retailer_admin';
  const isStaff = user?.role === 'retailer_staff';
  const permissions = user?.permissions || {};

  const can = (permission) => {
    if (isAdmin) return true;
    return permissions[permission] === true;
  };

  const canAny = (...perms) => perms.some(p => can(p));

  return (
    <PermissionContext.Provider value={{ isAdmin, isStaff, permissions, can, canAny }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);