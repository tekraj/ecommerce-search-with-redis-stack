import type { User } from '@ecommerce/database';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { login as loginService, whoIAm } from 'src/services/auth-service';

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (data: { email: string, password: string }) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!authToken);
  const [isLoading, setIsLoading] = useState(false);

  // Mutation for login
  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: (data: { email: string; password: string }) => loginService(data),
    onError: () => {
      console.log('dsaflkdsajflkdsa');
      toast.error('Invalid Email/Password');
    },
    onSuccess: (data) => {
      if (!data.token) {
        toast.error('Invalid Email/Password');
        return;
      }
      const { token, ...rest } = data;
      localStorage.setItem('token', token);
      setAuthToken(token);
      setIsAuthenticated(true);
      setUser(rest);

    },
  });
  const login = (data: { email: string, password: string }) => {
    loginMutation.mutate(data);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    window.location.reload();
  };
  const { data: authUser, isError, isLoading: isLoadingUseData, refetch: getUserInfo } = useQuery({
    queryKey: ['whoami'],
    queryFn: whoIAm,
    enabled: !!authToken
  }
  );
  useEffect(() => {
    if (authToken) {
      void getUserInfo();
    }
  }, [getUserInfo, authToken]);
  useEffect(() => {
    if (!authToken) {
      return;
    }
    if (isLoadingUseData) {
      return;
    }
    if (authUser && !isError) {
      setUser(authUser);
      setIsAuthenticated(true);
      localStorage.setItem('token', authUser.token);
    } else if (isError) {
      logout();
    }
    setIsLoading(isLoadingUseData);

  }, [authUser, isError, isLoading, authToken, isLoadingUseData]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
