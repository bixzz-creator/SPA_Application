import mongoose, { Document, Schema } from 'mongoose';

export type RecordStatus = 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
export type RecordCategory =
  | 'Finance'
  | 'HR'
  | 'IT'
  | 'Operations'
  | 'Compliance'
  | 'Legal';

export interface IRecord extends Document {
  recordId: string;
  title: string;
  category: RecordCategory;
  status: RecordStatus;
  owner: string; // references user.userId
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  createdAt: Date;
  updatedAt: Date;
}

const RecordSchema = new Schema<IRecord>(
  {
    recordId: {
      type: String,
      required: [true, 'Record ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: ['Finance', 'HR', 'IT', 'Operations', 'Compliance', 'Legal'],
      required: [true, 'Category is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Rejected'],
      default: 'Pending',
      required: true,
    },
    owner: {
      type: String,
      required: [true, 'Owner is required'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
  },
  {
    timestamps: true,
  }
);

export const Record = mongoose.model<IRecord>('Record', RecordSchema);
