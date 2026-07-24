import axios from "axios";

import { apiClient } from "@/lib/api-client";

import type {
  ManagedUser,
  ManagedUserFilters,
  ManagedUserPage,
  ManagedUserRole,
} from "../types/admin-user";

interface ManagedUserPageResponse {
  success: true;
  data: ManagedUserPage;
}

interface ManagedUserResponse {
  success: true;
  data: { user: ManagedUser };
}

const getAdminUserError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return new Error(error.response?.data.message ?? fallback);
  }
  return new Error(fallback);
};

export const getManagedUsers = async (
  filters: ManagedUserFilters,
): Promise<ManagedUserPage> => {
  try {
    const response = await apiClient.get<ManagedUserPageResponse>(
      "/admin/users",
      { params: filters },
    );
    return response.data.data;
  } catch (error) {
    throw getAdminUserError(error, "Unable to load platform users");
  }
};

export const changeManagedUserRole = async (
  userId: string,
  role: ManagedUserRole,
): Promise<ManagedUser> => {
  try {
    const response = await apiClient.patch<ManagedUserResponse>(
      `/admin/users/${userId}/role`,
      { role },
    );
    return response.data.data.user;
  } catch (error) {
    throw getAdminUserError(error, "Unable to change this user’s role");
  }
};

export const removeManagedUser = async (userId: string): Promise<void> => {
  try {
    await apiClient.delete(`/admin/users/${userId}`);
  } catch (error) {
    throw getAdminUserError(error, "Unable to remove this user");
  }
};
