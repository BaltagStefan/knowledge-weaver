import { useAuthStore, useUIStore } from '@/store/appStore';
import { authApi } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { t } from '@/lib/i18n';

export function useAuth() {
  const { user, token, isLoading, setUser, setLoading, logout: logoutStore, isAdmin } = useAuthStore();
  const { language } = useUIStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch current user on mount
  const { refetch: refetchUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: false, // Manual control
    retry: false,
  });

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await refetchUser();
        if (userData.data) {
          setUser(userData.data);
        }
      } catch {
        // User not authenticated - that's okay
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Check if we have a token in session storage
    const storedToken = sessionStorage.getItem('auth_token');
    if (storedToken) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [refetchUser, setUser, setLoading]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (password: string) => authApi.login({ password }),
    onSuccess: async (data) => {
      if (data.success) {
        // Refresh user data
        const userData = await refetchUser();
        if (userData.data) {
          setUser(userData.data);
          toast({
            title: t('common.success', language),
            description: t('auth.loginTitle', language),
          });
          navigate('/admin');
        }
      } else {
        toast({
          title: t('common.error', language),
          description: t('auth.invalidCredentials', language),
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: t('common.error', language),
        description: t('auth.invalidCredentials', language),
        variant: 'destructive',
      });
    },
  });

  const login = useCallback((password: string) => {
    loginMutation.mutate(password);
  }, [loginMutation]);

  const logout = useCallback(() => {
    authApi.logout();
    logoutStore();
    queryClient.clear();
    navigate('/');
    toast({
      title: t('auth.logout', language),
    });
  }, [logoutStore, queryClient, navigate, language]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: isAdmin(),
    login,
    logout,
    isLoggingIn: loginMutation.isPending,
  };
}
