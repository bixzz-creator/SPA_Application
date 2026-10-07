import { Response } from 'express';
import { recordService } from '../services/record.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { RecordStatus, RecordCategory } from '../models/record.model';

export const getRecords = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';

    const filters = {
      // RBAC: General Users can only see their own records
      owner: isAdmin ? undefined : req.user?.userId,
      status: req.query['status'] as RecordStatus | undefined,
      category: req.query['category'] as RecordCategory | undefined,
      search: req.query['search'] as string | undefined,
    };

    const records = await recordService.getRecords(filters);

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch records';
    res.status(500).json({ success: false, message });
  }
};

export const getRecordById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const record = await recordService.getRecordById(req.params['id']!);
    if (!record) {
      res.status(404).json({ success: false, message: 'Record not found' });
      return;
    }

    // RBAC: General Users can only view their own records
    if (req.user?.role !== 'ADMIN' && record.owner !== req.user?.userId) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have access to this record.',
      });
      return;
    }

    res.status(200).json({ success: true, record });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch record';
    res.status(500).json({ success: false, message });
  }
};

export const getRecordStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const ownerFilter = isAdmin ? undefined : req.user?.userId;
    const stats = await recordService.getRecordStats(ownerFilter);

    res.status(200).json({ success: true, stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stats';
    res.status(500).json({ success: false, message });
  }
};

export const createRecord = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, category, description, priority, status } = req.body;
    const recordId =
      req.body.recordId ||
      `REC-${Math.floor(100000 + Math.random() * 900000)}`;

    const newRecord = await recordService.createRecord({
      recordId,
      title,
      category,
      status: status || 'Pending',
      owner: req.user?.userId,
      description: description || '',
      priority: priority || 'Medium',
    });

    res.status(201).json({ success: true, record: newRecord });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create record';
    res.status(500).json({ success: false, message });
  }
};

export const updateRecord = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const record = await recordService.getRecordById(req.params['id']!);
    if (!record) {
      res.status(404).json({ success: false, message: 'Record not found' });
      return;
    }

    if (req.user?.role !== 'ADMIN' && record.owner !== req.user?.userId) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to update this record.',
      });
      return;
    }

    const updated = await recordService.updateRecord(req.params['id']!, req.body);
    res.status(200).json({ success: true, record: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update record';
    res.status(500).json({ success: false, message });
  }
};

export const deleteRecord = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const record = await recordService.getRecordById(req.params['id']!);
    if (!record) {
      res.status(404).json({ success: false, message: 'Record not found' });
      return;
    }

    if (req.user?.role !== 'ADMIN' && record.owner !== req.user?.userId) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to delete this record.',
      });
      return;
    }

    await recordService.deleteRecord(req.params['id']!);
    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete record';
    res.status(500).json({ success: false, message });
  }
};

