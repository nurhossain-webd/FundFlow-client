export type ManagedUserRole = "supporter" | "creator" | "admin";

export interface ManagedUser {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: ManagedUserRole;
  credits: number;
  raisedCredits: number;
  status: "active" | "suspended";
  isCurrentAdmin: boolean;
  createdAt: string;
}

export interface ManagedUserPage {
  users: ManagedUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ManagedUserFilters {
  page: number;
  limit: number;
  search?: string;
  role?: ManagedUserRole;
}
