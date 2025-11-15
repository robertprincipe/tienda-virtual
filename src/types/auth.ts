export interface SessionUser {
  id: number;
  email: string;
  name: string;
  roleId: number;
}

export interface SessionData {
  user?: SessionUser;
}
