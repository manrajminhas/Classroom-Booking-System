import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret123',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findByID(payload.sub); 
    
    if (user && (user as any).isBlocked) {
        throw new UnauthorizedException('Account has been blocked.');
    }

    return { userID: payload.sub, username: payload.username, role: payload.role };
  }
}