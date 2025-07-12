export interface JwtPayload {
    sub: string;  // ID do usuário
    username: string;
    role: string;
  }