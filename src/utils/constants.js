export const userRolesEnum = {
  admin: "admin",
  user: "user",
  projectAdmin: "project_admin",
  member: "member",
};

export const statusEnum = {
  active: "active",
  inactive: "inactive",
  pending: "pending",
};

export const availableRoles = Object.values(userRolesEnum);

export const taskStatusEnum = {
  todo: "todo",
  inProgress: "in_progress",
  done: "done",
  cancelled: "cancelled",
};

export const availableTaskStatuses = Object.values(taskStatusEnum);
