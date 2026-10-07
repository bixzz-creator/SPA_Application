import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  getUserById,
  getMe,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getUserStats,
} from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { delayMiddleware } from '../middleware/delay.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get('/me', getMe);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     tags: [Users]
 */
router.get('/stats', requireAdmin, getUserStats);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, GENERAL_USER]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: delay
 *         schema:
 *           type: integer
 *         description: Artificial delay in milliseconds (max 10000)
 */
router.get('/', requireAdmin, delayMiddleware, getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 */
router.get('/:id', requireAdmin, getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 */
router.post(
  '/',
  requireAdmin,
  [
    body('userId')
      .notEmpty()
      .withMessage('User ID is required')
      .isAlphanumeric()
      .withMessage('User ID must be alphanumeric')
      .isLength({ min: 3, max: 20 })
      .withMessage('User ID must be 3-20 characters'),
    body('name')
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 }),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['ADMIN', 'GENERAL_USER'])
      .withMessage('Invalid role'),
    validateRequest,
  ],
  createUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Users]
 */
router.put(
  '/:id',
  requireAdmin,
  [
    body('name').optional().isLength({ min: 2, max: 100 }),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['ADMIN', 'GENERAL_USER']),
    validateRequest,
  ],
  updateUser
);

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Update user status (Admin only)
 *     tags: [Users]
 */
router.patch(
  '/:id/status',
  requireAdmin,
  [
    body('status')
      .isIn(['ACTIVE', 'INACTIVE'])
      .withMessage('Status must be ACTIVE or INACTIVE'),
    validateRequest,
  ],
  updateUserStatus
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 */
router.delete('/:id', requireAdmin, deleteUser);

export default router;
