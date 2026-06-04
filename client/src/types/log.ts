export type UserSummary = {
  id: string;
  name: string;
  profilePictureUrl: string | null;
};

export type CooperationLog = {
  id: string;
  title: string;
  description: string | null;
  oldValue: string | null;
  newValue: string | null;
  author: UserSummary;
  createdAt: string;
  updatedAt: string;
};

export type CooperationLogCreateDto = {
  title: string | null;
  description: string | null;
};
