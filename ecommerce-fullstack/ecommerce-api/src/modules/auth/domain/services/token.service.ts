export type TokenPayload = {
  sub: string;
  email: string;
  role: string;
  type?: 'access' | 'refresh';
};

export abstract class TokenService {
  abstract sign(payload: TokenPayload): Promise<string>;
  abstract signRefresh(payload: TokenPayload): Promise<string>;
  abstract verifyRefresh(token: string): Promise<TokenPayload>;
}
