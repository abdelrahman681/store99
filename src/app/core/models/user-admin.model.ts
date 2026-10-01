/**
 * One row of GET api/User/GetAllRole. The API currently returns the account UserDTO, which has no Id —
 * the id is read from `id` / `userId` as soon as the backend sends it (see adminUserId()).
 */
export interface AdminUser {
  id?: string;
  userId?: string;
  displayName: string;
  email: string;
  pictureUrl?: string | null;
  gender?: string | null;
  age?: number | null;
  roleName?: string | null;
  roles?: string[] | null;
  [key: string]: any;
}

export interface RoleSelection { name: string; isSelected: boolean; }
export interface UserRolePayload { userId: string; roles: RoleSelection[]; }

export function adminUserId(u: AdminUser): string | null {
  return u.id ?? u.userId ?? u['userID'] ?? u['Id'] ?? null;
}

export function adminUserRoles(u: AdminUser): string[] {
  if (u.roles?.length) return u.roles;
  return u.roleName ? [u.roleName] : [];
}
