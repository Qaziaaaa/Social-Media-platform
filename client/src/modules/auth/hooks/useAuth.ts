import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getMe, loginUser, logoutUser, registerUser } from "@/services/auth.api";
import { queryKeys } from "@/lib/query-keys";

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: meData, isLoading, isFetching, isError } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getMe,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const authLoading = isLoading && (isFetching || !meData);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(queryKeys.auth.me, {
          success: true,
          data: data.data.user,
        });
        toast.success("Welcome back!");
        navigate("/");
      }
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Invalid credentials");
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({
      username,
      email,
      password,
      fullName,
    }: {
      username: string;
      email: string;
      password: string;
      fullName: string;
    }) => registerUser(username, email, password, fullName),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(queryKeys.auth.me, {
          success: true,
          data: data.data.user,
        });
        toast.success("Account created!");
        navigate("/");
      }
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Registration failed");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.me, null);
      queryClient.clear();
      toast.success("Logged out");
      navigate("/login");
    },
  });

  return {
    user: meData?.success ? meData.data : null,
    isAuthenticated: !!meData?.success,
    isLoading: authLoading,
    isError,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    register: registerMutation.mutate,
    registerLoading: registerMutation.isPending,
    logout: logoutMutation.mutate,
    logoutLoading: logoutMutation.isPending,
  };
}
