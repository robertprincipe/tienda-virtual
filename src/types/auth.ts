export interface SessionUser {
  id: number;
  email: string;
  name: string;
  roleId: number;
  photoUrl?: string | null;
}

export interface SessionData {
  user?: SessionUser;
}
