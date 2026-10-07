import { User, IUser, UserRole, UserStatus } from '../models/user.model';
import { FilterQuery } from 'mongoose';

export interface CreateUserPayload {
  userId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status?: UserStatus;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export class UserService {
  async getAllUsers(filters: UserFilters = {}): Promise<IUser[]> {
    const query: FilterQuery<IUser> = {};

    if (filters.role) query['role'] = filters.role;
    if (filters.status) query['status'] = filters.status;
    if (filters.search) {
      query['$or'] = [
        { userId: { $regex: filters.search, $options: 'i' } },
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return User.find(query).sort({ createdAt: -1 });
  }

  async getUserById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async getUserByUserId(userId: string): Promise<IUser | null> {
    return User.findOne({ userId: userId.toLowerCase() });
  }

  async createUser(payload: CreateUserPayload): Promise<IUser> {
    const existing = await User.findOne({ userId: payload.userId.toLowerCase() });
    if (existing) {
      throw new Error(`User ID '${payload.userId}' already exists`);
    }

    const emailExists = await User.findOne({ email: payload.email.toLowerCase() });
    if (emailExists) {
      throw new Error(`Email '${payload.email}' already in use`);
    }

    const user = new User({
      ...payload,
      userId: payload.userId.toLowerCase(),
      email: payload.email.toLowerCase(),
    });

    return user.save();
  }

  async updateUser(id: string, payload: UpdateUserPayload): Promise<IUser | null> {
    const user = await User.findById(id);
    if (!user) return null;

    if (payload.email && payload.email !== user.email) {
      const emailExists = await User.findOne({
        email: payload.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (emailExists) {
        throw new Error(`Email '${payload.email}' already in use`);
      }
    }

    Object.assign(user, payload);
    if (payload.email) user.email = payload.email.toLowerCase();

    return user.save();
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { status }, { new: true });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return result !== null;
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    admins: number;
    generalUsers: number;
  }> {
    const [total, active, inactive, admins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'ACTIVE' }),
      User.countDocuments({ status: 'INACTIVE' }),
      User.countDocuments({ role: 'ADMIN' }),
    ]);

    return {
      total,
      active,
      inactive,
      admins,
      generalUsers: total - admins,
    };
  }
}

export const userService = new UserService();
