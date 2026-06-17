import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse, LoginInput, RegisterInput, User } from "@/types";

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      api.post<AuthResponse>("/api/auth/register", input).then((r) => r.data),
    onSuccess: ({ user, accessToken }) => setAuth(user, accessToken),
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (input: LoginInput) =>
      api.post<AuthResponse>("/api/auth/login", input).then((r) => r.data),
    onSuccess: ({ user, accessToken }) => setAuth(user, accessToken),
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/auth/logout"),
    onSettled: () => {
      logout();
      qc.clear();
    },
  });
}

export function useCurrentUser() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery<User>({
    queryKey: ["auth", "me"],
    queryFn: () => api.get("/api/auth/me").then((r) => r.data),
    enabled: !!accessToken,
    retry: false,
    staleTime: 5 * 60_000,
  });
}
