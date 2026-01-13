import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  createParamDecorator
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "./auth.service";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => (target: any, key?: string, descriptor?: any) => {
  Reflect.defineMetadata(IS_PUBLIC_KEY, true, descriptor?.value ?? target);
  return descriptor ?? target;
};

export interface RequestUser {
  userId: string;
  email?: string;
  deviceId?: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser | undefined;
    return data ? user?.[data] : user;
  }
);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否是公开路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      if (isPublic) return true;
      throw new UnauthorizedException("No authorization header");
    }

    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) {
      if (isPublic) return true;
      throw new UnauthorizedException("Invalid authorization format");
    }

    try {
      const payload = this.authService.validateAccessToken(token);
      request.user = {
        userId: payload.sub,
        email: payload.email,
        deviceId: payload.deviceId
      } as RequestUser;
      return true;
    } catch {
      if (isPublic) return true;
      throw new UnauthorizedException("Invalid token");
    }
  }
}
