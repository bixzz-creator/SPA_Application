import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { User, IUser, UserRole } from '../models/user.model';

export interface LoginPayload {
  userId: string;
  password: string;
  role: string;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: UserRole;
    status: string;
  };
}

export class AuthService {
  async login(payload: LoginPayload): Promise<AuthResult> {
    const { userId, password, role } = payload;

    // Find user with password field included
    const user = await User.findOne({ userId: userId.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.status === 'INACTIVE') {
      throw new Error('Account is deactivated. Contact an administrator.');
    }

    // Validate password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Validate role — NEVER trust frontend role, always use DB role
    const requestedRole = role.toUpperCase();
    if (user.role !== requestedRole) {
      throw new Error('Invalid role for this account');
    }

    // Generate JWT
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: (user as IUser & { _id: unknown })._id?.toString() ?? '',
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  private generateToken(user: IUser): string {
    const payload = {
      id: (user as IUser & { _id: unknown })._id?.toString(),
      userId: user.userId,
      role: user.role,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }
}

export const authService = new AuthService();
