"use client";

import {
  CircleAlert,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import { type FormEvent, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminUsers,
  useChangeManagedUserRole,
  useRemoveManagedUser,
} from "@/features/admin-users/hooks/use-admin-users";
import type {
  ManagedUser,
  ManagedUserRole,
} from "@/features/admin-users/types/admin-user";

const roles: Array<{ value: ManagedUserRole; label: string }> = [
  { value: "supporter", label: "Supporter" },
  { value: "creator", label: "Creator" },
  { value: "admin", label: "Admin" },
];

const roleLabels: Record<ManagedUserRole, string> = {
  supporter: "Supporter",
  creator: "Creator",
  admin: "Admin",
};

export default function AdminManageUsersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<ManagedUserRole | undefined>();
  const [processingUserId, setProcessingUserId] = useState<string>();
  const filters = {
    page,
    limit: 10,
    ...(search ? { search } : {}),
    ...(role ? { role } : {}),
  };
  const usersQuery = useAdminUsers(filters);
  const roleMutation = useChangeManagedUserRole();
  const removeMutation = useRemoveManagedUser();
  const users = usersQuery.data?.users ?? [];
  const pagination = usersQuery.data?.pagination;
  const isProcessing = roleMutation.isPending || removeMutation.isPending;

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const changeRole = async (user: ManagedUser, nextRole: ManagedUserRole) => {
    if (nextRole === user.role) {
      return;
    }

    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Change this user’s role?",
      text: `${user.displayName} will change from ${roleLabels[user.role]} to ${roleLabels[nextRole]}. Users with linked platform records cannot be changed.`,
      showCancelButton: true,
      confirmButtonText: "Change role",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#08717A",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      setProcessingUserId(user.id);
      await roleMutation.mutateAsync({ userId: user.id, role: nextRole });
      toast.success(`${user.displayName} is now a ${roleLabels[nextRole]}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to change user role",
      );
    } finally {
      setProcessingUserId(undefined);
    }
  };

  const removeUser = async (user: ManagedUser) => {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Remove this user?",
      text: `${user.displayName} will lose platform access. Historical records will be retained, and removal is blocked when active financial work remains.`,
      showCancelButton: true,
      confirmButtonText: "Remove user",
      cancelButtonText: "Keep user",
      confirmButtonColor: "#B83C4A",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      setProcessingUserId(user.id);
      await removeMutation.mutateAsync(user.id);
      if (page > 1 && users.length === 1) {
        setPage((current) => current - 1);
      }
      toast.success("User access removed; historical records were preserved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to remove user",
      );
    } finally {
      setProcessingUserId(undefined);
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
          Administration
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
          Manage users
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-ink-muted">
          Search platform profiles, manage roles, and safely revoke access
          without deleting financial history.
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border-subtle bg-white p-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <form onSubmit={submitSearch} className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Search users</span>
            <Search
              aria-hidden="true"
              className="absolute top-3 left-3 size-5 text-ink-muted"
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or email"
              maxLength={100}
              className="h-11 w-full rounded-[10px] border border-border bg-white pr-4 pl-10 text-sm text-ink-strong outline-none focus:border-flow-600 focus:ring-4 focus:ring-flow-100"
            />
          </label>
          <Button type="submit">Search</Button>
        </form>
        <label>
          <span className="sr-only">Filter users by role</span>
          <select
            value={role ?? ""}
            onChange={(event) => {
              setPage(1);
              setRole(
                (event.target.value as ManagedUserRole | "") || undefined,
              );
            }}
            className="h-11 w-full rounded-[10px] border border-border bg-white px-3 text-sm text-ink-strong outline-none focus:border-flow-600 focus:ring-4 focus:ring-flow-100"
          >
            <option value="">All roles</option>
            {roles.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">
          {pagination
            ? `${pagination.total.toLocaleString()} user${pagination.total === 1 ? "" : "s"}`
            : "Loading user count…"}
        </p>
        {usersQuery.isFetching && !usersQuery.isLoading ? (
          <span className="text-sm text-ink-muted" role="status">
            Updating…
          </span>
        ) : null}
      </div>

      {usersQuery.isLoading ? (
        <TableSkeleton rows={7} />
      ) : usersQuery.isError ? (
        <EmptyState
          icon={CircleAlert}
          title="Users could not be loaded"
          description={
            usersQuery.error instanceof Error
              ? usersQuery.error.message
              : "FundFlow could not reach the user management service."
          }
          action={
            <Button onClick={() => void usersQuery.refetch()}>Try again</Button>
          }
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No matching users"
          description="Try a different name, email address, or role filter."
        />
      ) : (
        <>
          <div className="space-y-4 xl:hidden">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                disabled={isProcessing}
                processing={processingUserId === user.id}
                onChangeRole={changeRole}
                onRemove={removeUser}
              />
            ))}
          </div>
          <div className="hidden xl:block">
            <Table className="min-w-[1040px]">
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Change role</TableHead>
                  <TableHead className="text-right">Remove</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <UserIdentity user={user} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "admin" ? "warning" : "info"}
                      >
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-ink-strong">
                      {user.credits.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.status} />
                    </TableCell>
                    <TableCell>
                      <RoleSelect
                        user={user}
                        disabled={isProcessing}
                        onChange={changeRole}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isProcessing || user.isCurrentAdmin}
                          isLoading={
                            processingUserId === user.id &&
                            removeMutation.isPending
                          }
                          loadingText="Removing…"
                          onClick={() => void removeUser(user)}
                          leftIcon={
                            <Trash2 aria-hidden="true" className="size-4" />
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <nav
          aria-label="User pagination"
          className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white p-4 sm:flex-row"
        >
          <p className="text-sm text-ink-muted">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={pagination.page <= 1 || isProcessing}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={
                pagination.page >= pagination.totalPages || isProcessing
              }
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function UserIdentity({ user }: { user: ManagedUser }) {
  const initials = user.displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-flow-50 font-bold text-flow-700">
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt=""
            width={44}
            height={44}
            unoptimized
            className="size-full object-cover"
          />
        ) : (
          initials || <UserRound aria-hidden="true" className="size-5" />
        )}
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink-strong">
          {user.displayName}
          {user.isCurrentAdmin ? (
            <span className="ml-2 text-xs text-flow-700">(You)</span>
          ) : null}
        </p>
        <p className="truncate text-xs text-ink-muted">{user.email}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ManagedUser["status"] }) {
  return status === "active" ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="error">Suspended</Badge>
  );
}

function RoleSelect({
  disabled,
  onChange,
  user,
}: {
  disabled: boolean;
  onChange: (user: ManagedUser, role: ManagedUserRole) => Promise<void>;
  user: ManagedUser;
}) {
  return (
    <select
      value={user.role}
      disabled={disabled || user.isCurrentAdmin}
      onChange={(event) =>
        void onChange(user, event.target.value as ManagedUserRole)
      }
      aria-label={`Change role for ${user.displayName}`}
      className="h-10 rounded-[10px] border border-border bg-white px-3 text-sm text-ink-strong outline-none focus:border-flow-600 focus:ring-4 focus:ring-flow-100 disabled:cursor-not-allowed disabled:bg-canvas-muted"
    >
      {roles.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function UserCard({
  disabled,
  onChangeRole,
  onRemove,
  processing,
  user,
}: {
  disabled: boolean;
  onChangeRole: (user: ManagedUser, role: ManagedUserRole) => Promise<void>;
  onRemove: (user: ManagedUser) => Promise<void>;
  processing: boolean;
  user: ManagedUser;
}) {
  return (
    <article className="rounded-2xl border border-border-subtle bg-white p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <UserIdentity user={user} />
        <StatusBadge status={user.status} />
      </div>
      <div className="mt-5 flex items-center justify-between rounded-xl bg-canvas-muted px-4 py-3">
        <span className="text-sm text-ink-muted">Available credits</span>
        <strong className="text-ink-strong">
          {user.credits.toLocaleString()}
        </strong>
      </div>
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-3">
        <RoleSelect user={user} disabled={disabled} onChange={onChangeRole} />
        <Button
          variant="destructive"
          size="icon"
          disabled={disabled || user.isCurrentAdmin}
          isLoading={processing}
          onClick={() => void onRemove(user)}
          aria-label={`Remove ${user.displayName}`}
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </Button>
      </div>
      {user.isCurrentAdmin ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
          <ShieldCheck aria-hidden="true" className="size-4 text-flow-700" />
          Your own Admin role and access are protected.
        </p>
      ) : null}
    </article>
  );
}
