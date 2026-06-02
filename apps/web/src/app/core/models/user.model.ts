export interface User {
  id: string;
  name: string;
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  created: string;
  updated: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  emailVisibility?: boolean;
  password: string;
  passwordConfirm: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateProfileDTO {
  name?: string;
  password?: string;
  passwordConfirm?: string;
  oldPassword?: string;
}
