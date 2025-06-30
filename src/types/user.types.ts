export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    refresh_token?: string | null;
    created_at?: Date;
    updated_at?: Date;
  }