import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export function useUser() {
  const { accessToken, setUser } = useAuthStore();

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await authAPI.getMe();
      setUser(data);
      return data;
    },
    enabled: !!accessToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (data) => authAPI.signup(data),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (data) => authAPI.resendVerification(data),
  });
}

export function useLogin() {
  const { loginSuccess } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => authAPI.login(data),
    onSuccess: ({ data }) => {
      loginSuccess(data.access, data.user);
      queryClient.setQueryData(["user"], data.user);
      navigate("/dashboard");
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authAPI.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
      navigate("/login");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data) => authAPI.changePassword(data),
  });
}

export function useUpdateProfile() {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: ({ data }) => {
      setUser(data);
      queryClient.setQueryData(["user"], data);
    },
  });
}

export function useUploadProfilePicture() {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => authAPI.uploadProfilePicture(formData),
    onSuccess: ({ data }) => {
      setUser(data);
      queryClient.setQueryData(["user"], data);
    },
  });
}

export function useDeleteProfilePicture() {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authAPI.deleteProfilePicture(),
    onSuccess: ({ data }) => {
      setUser(data);
      queryClient.setQueryData(["user"], data);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data) => authAPI.forgotPassword(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data) => authAPI.resetPassword(data),
  });
}
