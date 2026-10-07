import { Response } from 'express';
import { userService } from '../services/user.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UserRole, UserStatus } from '../models/user.model';

export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const filters = {
      role: req.query['role'] as UserRole | undefined,
      status: req.query['status'] as UserStatus | undefined,
      search: req.query['search'] as string | undefined,
    };

    const users = await userService.getAllUsers(filters);

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    res.status(500).json({ success: false, message });
  }
};

export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await userService.getUserById(req.params['id']!);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user';
    res.status(500).json({ success: false, message });
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    const user = await userService.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile';
    res.status(500).json({ success: false, message });
  }
};

export const createUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    const statusCode = message.includes('already exists') || message.includes('already in use') ? 409 : 500;
    res.status(statusCode).json({ success: false, message });
  }
};

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await userService.updateUser(req.params['id']!, req.body);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    const statusCode = message.includes('already in use') ? 409 : 500;
    res.status(statusCode).json({ success: false, message });
  }
};

export const updateUserStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body as { status: UserStatus };
    const user = await userService.updateUserStatus(req.params['id']!, status);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({
      success: true,
      message: `User ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`,
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update status';
    res.status(500).json({ success: false, message });
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Prevent admin from deleting themselves
    if (req.params['id'] === req.user?.id) {
      res.status(400).json({ success: false, message: 'Cannot delete your own account' });
      return;
    }

    const deleted = await userService.deleteUser(req.params['id']!);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    res.status(500).json({ success: false, message });
  }
};

export const getUserStats = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const stats = await userService.getUserStats();
    res.status(200).json({ success: true, stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stats';
    res.status(500).json({ success: false, message });
  }
};
