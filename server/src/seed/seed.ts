import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { config } from '../config/config';
import { User } from '../models/user.model';
import { Record } from '../models/record.model';

const users = [
  {
    userId: 'admin',
    name: 'Administrator',
    email: 'admin@accesshub.com',
    password: 'admin123',
    role: 'ADMIN' as const,
    status: 'ACTIVE' as const,
  },
  {
    userId: 'john',
    name: 'John Smith',
    email: 'john@accesshub.com',
    password: 'user123',
    role: 'GENERAL_USER' as const,
    status: 'ACTIVE' as const,
  },
  {
    userId: 'sarah',
    name: 'Sarah Johnson',
    email: 'sarah@accesshub.com',
    password: 'user123',
    role: 'GENERAL_USER' as const,
    status: 'ACTIVE' as const,
  },
  {
    userId: 'mike',
    name: 'Michael Brown',
    email: 'mike@accesshub.com',
    password: 'user123',
    role: 'GENERAL_USER' as const,
    status: 'ACTIVE' as const,
  },
  {
    userId: 'emily',
    name: 'Emily Davis',
    email: 'emily@accesshub.com',
    password: 'user123',
    role: 'GENERAL_USER' as const,
    status: 'INACTIVE' as const,
  },
  {
    userId: 'user',
    name: 'Demo User',
    email: 'user@accesshub.com',
    password: 'user123',
    role: 'GENERAL_USER' as const,
    status: 'ACTIVE' as const,
  },
];

const records = [
  // John's records
  {
    recordId: 'REC001',
    title: 'Q4 Budget Review',
    category: 'Finance' as const,
    status: 'Completed' as const,
    owner: 'john',
    description: 'Annual Q4 budget review and approval process.',
    priority: 'High' as const,
  },
  {
    recordId: 'REC002',
    title: 'Employee Onboarding - IT Setup',
    category: 'HR' as const,
    status: 'In Progress' as const,
    owner: 'john',
    description: 'New employee onboarding and IT equipment setup.',
    priority: 'Medium' as const,
  },
  {
    recordId: 'REC003',
    title: 'Software License Audit',
    category: 'IT' as const,
    status: 'Pending' as const,
    owner: 'john',
    description: 'Annual audit of all software licenses in use.',
    priority: 'Low' as const,
  },
  // Sarah's records
  {
    recordId: 'REC004',
    title: 'Compliance Policy Update',
    category: 'Compliance' as const,
    status: 'In Progress' as const,
    owner: 'sarah',
    description: 'Update compliance policies to meet new regulatory standards.',
    priority: 'High' as const,
  },
  {
    recordId: 'REC005',
    title: 'Contract Renewal - Vendor A',
    category: 'Legal' as const,
    status: 'Pending' as const,
    owner: 'sarah',
    description: 'Review and renew vendor contract due for expiration.',
    priority: 'Medium' as const,
  },
  {
    recordId: 'REC006',
    title: 'Marketing Budget Allocation',
    category: 'Finance' as const,
    status: 'Completed' as const,
    owner: 'sarah',
    description: 'Final allocation of marketing budget for Q1.',
    priority: 'Medium' as const,
  },
  // Mike's records
  {
    recordId: 'REC007',
    title: 'Data Center Migration',
    category: 'IT' as const,
    status: 'In Progress' as const,
    owner: 'mike',
    description: 'Migrating on-premise data center to cloud infrastructure.',
    priority: 'High' as const,
  },
  {
    recordId: 'REC008',
    title: 'Supply Chain Optimization',
    category: 'Operations' as const,
    status: 'Pending' as const,
    owner: 'mike',
    description: 'Review and optimize supply chain for cost reduction.',
    priority: 'Medium' as const,
  },
  {
    recordId: 'REC009',
    title: 'Annual Performance Review',
    category: 'HR' as const,
    status: 'Completed' as const,
    owner: 'mike',
    description: 'Annual performance evaluation for department.',
    priority: 'Low' as const,
  },
  // Emily's records
  {
    recordId: 'REC010',
    title: 'Regulatory Filing Q3',
    category: 'Compliance' as const,
    status: 'Rejected' as const,
    owner: 'emily',
    description: 'Q3 regulatory filings submitted for review.',
    priority: 'High' as const,
  },
  // Demo user's records
  {
    recordId: 'REC011',
    title: 'Application Review',
    category: 'HR' as const,
    status: 'Completed' as const,
    owner: 'user',
    description: 'Review submitted job applications for open positions.',
    priority: 'Medium' as const,
  },
  {
    recordId: 'REC012',
    title: 'Infrastructure Cost Analysis',
    category: 'Finance' as const,
    status: 'Pending' as const,
    owner: 'user',
    description: 'Analyze and report on current infrastructure costs.',
    priority: 'Low' as const,
  },
  {
    recordId: 'REC013',
    title: 'Security Policy Review',
    category: 'IT' as const,
    status: 'In Progress' as const,
    owner: 'user',
    description: 'Review and update IT security policies and procedures.',
    priority: 'High' as const,
  },
];

async function seed(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Record.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`👤 Created user: ${userData.userId} (${userData.role})`);
    }

    // Create records
    for (const recordData of records) {
      const record = new Record(recordData);
      await record.save();
      console.log(`📝 Created record: ${recordData.recordId} - ${recordData.title}`);
    }

    console.log('\n✨ Seed completed successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('  Admin:       admin / admin123');
    console.log('  Demo User:   user / user123');
    console.log('  John:        john / user123');
    console.log('  Sarah:       sarah / user123');
    console.log('  Mike:        mike / user123');
    console.log('  Emily:       emily / user123 (INACTIVE)');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
