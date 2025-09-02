// Authentication removed - always return authenticated state
export function useAuth() {
  const defaultUser = {
    id: 'default-user',
    name: 'User',
    email: 'user@example.com'
  };

  return {
    user: defaultUser,
    isLoading: false,
    isAuthenticated: true,
  };
}
