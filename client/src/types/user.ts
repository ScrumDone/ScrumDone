export type UserSummary = {
  id: string;
  name: string;
};

export type UserCreateDto = {
  name: string;
  roleId: string;
  profilePictureUrl?: string | null;
};

export type UserUpdateDto = {
  name?: string | null;
  roleId?: string | null;
  profilePictureUrl?: string | null;
};

export type UserQueryParams = {
  page?: number;
  limit?: number;
};

export type UserPermission = {
  permissionName: string;
  id: string;
};
