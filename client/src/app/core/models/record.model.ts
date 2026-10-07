export interface Record {
  _id?: string;
  recordId: string;
  title: string;
  category: RecordCategory;
  status: RecordStatus;
  owner: string;
  description?: string;
  priority?: RecordPriority;
  createdAt?: string;
  updatedAt?: string;
}

export type RecordStatus = 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
export type RecordCategory = 'Finance' | 'HR' | 'IT' | 'Operations' | 'Compliance' | 'Legal';
export type RecordPriority = 'Low' | 'Medium' | 'High';

export interface RecordStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  rejected: number;
}

export interface RecordsResponse {
  success: boolean;
  count: number;
  records: Record[];
}
