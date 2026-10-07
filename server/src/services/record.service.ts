import { Record, IRecord, RecordStatus, RecordCategory } from '../models/record.model';
import { FilterQuery } from 'mongoose';

export interface RecordFilters {
  owner?: string; // userId string
  status?: RecordStatus;
  category?: RecordCategory;
  search?: string;
}

export class RecordService {
  async getRecords(filters: RecordFilters = {}): Promise<IRecord[]> {
    const query: FilterQuery<IRecord> = {};

    if (filters.owner) query['owner'] = filters.owner;
    if (filters.status) query['status'] = filters.status;
    if (filters.category) query['category'] = filters.category;
    if (filters.search) {
      query['$or'] = [
        { title: { $regex: filters.search, $options: 'i' } },
        { recordId: { $regex: filters.search, $options: 'i' } },
        { owner: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return Record.find(query).sort({ createdAt: -1 });
  }

  async getRecordById(id: string): Promise<IRecord | null> {
    return Record.findById(id);
  }

  async getRecordStats(ownerFilter?: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    rejected: number;
  }> {
    const baseQuery = ownerFilter ? { owner: ownerFilter } : {};

    const [total, completed, pending, inProgress, rejected] = await Promise.all([
      Record.countDocuments(baseQuery),
      Record.countDocuments({ ...baseQuery, status: 'Completed' }),
      Record.countDocuments({ ...baseQuery, status: 'Pending' }),
      Record.countDocuments({ ...baseQuery, status: 'In Progress' }),
      Record.countDocuments({ ...baseQuery, status: 'Rejected' }),
    ]);

    return { total, completed, pending, inProgress, rejected };
  }

  async createRecord(data: Partial<IRecord>): Promise<IRecord> {
    return Record.create(data);
  }

  async updateRecord(id: string, data: Partial<IRecord>): Promise<IRecord | null> {
    return Record.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteRecord(id: string): Promise<IRecord | null> {
    return Record.findByIdAndDelete(id);
  }
}

export const recordService = new RecordService();

