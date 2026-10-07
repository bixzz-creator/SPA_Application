import { Router } from 'express';
import {
  getRecords,
  getRecordById,
  getRecordStats,
  createRecord,
  updateRecord,
  deleteRecord,
} from '../controllers/record.controller';
import { authenticate } from '../middleware/auth.middleware';
import { delayMiddleware } from '../middleware/delay.middleware';

const router = Router();

// All record routes require authentication
router.use(authenticate);


/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: Get records (filtered by role)
 *     tags: [Records]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: delay
 *         schema:
 *           type: integer
 *         description: Artificial delay in milliseconds (0-10000). Used for async demo.
 *         example: 3000
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, In Progress, Completed, Rejected]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Finance, HR, IT, Operations, Compliance, Legal]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 records:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Record'
 *       401:
 *         $ref: '#/components/schemas/ApiError'
 */
router.get('/', delayMiddleware, getRecords);

/**
 * @swagger
 * /api/records/stats:
 *   get:
 *     summary: Get record statistics (role-filtered)
 *     tags: [Records]
 */
router.get('/stats', getRecordStats);

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get single record by ID
 *     tags: [Records]
 */
router.get('/:id', getRecordById);
router.post('/', createRecord);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);

export default router;

