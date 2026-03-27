import "fastify";

type AccessTokenPayload = {
  sub: string;
  email: string;
  emailVerified: boolean;
  typ: "access";
};

type RefreshTokenPayload = {
  sub: string;
  sid: string;
  tid: string;
  typ: "refresh";
};

declare module "fastify" {
  interface FastifyRequest {
    accessJwtVerify(options?: { onlyCookie?: boolean }): Promise<void>;
    refreshJwtVerify(options?: { onlyCookie?: boolean }): Promise<void>;
    user: AccessTokenPayload | RefreshTokenPayload;
  }

  interface FastifyReply {
    accessJwtSign(payload: AccessTokenPayload, options?: { expiresIn?: string }): Promise<string>;
    refreshJwtSign(payload: RefreshTokenPayload, options?: { expiresIn?: string }): Promise<string>;
  }
}
