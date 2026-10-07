import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../app';
import { User } from '../models/user.model';
import { Record } from '../models/record.model';
import { config } from '../config/config';


const app = createApp();
let adminToken: string;
let userToken: string;

beforeAll(async () => {
  await mongoose.connect(config.mongoUri.replace('accesshub', 'accesshub_test'));

  // Clear test DB
  await User.deleteMany({});
  await Record.deleteMany({});

  // Create test admin
  const admin = new User({
    userId: 'testadmin',
    name: 'Test Admin',
    email: 'testadmin@test.com',
    password: 'admin123',
    role: 'ADMIN',
    status: 'ACTIVE',
  });
  await admin.save();

  // Create test user
  const user = new User({
    userId: 'testuser',
    name: 'Test User',
    email: 'testuser@test.com',
    password: 'user123',
    role: 'GENERAL_USER',
    status: 'ACTIVE',
  });
  await user.save();

  // Create test records
  await Record.create([
    {
      recordId: 'TREC001',
      title: 'Admin Record',
      category: 'IT',
      status: 'Completed',
      owner: 'testuser',
      description: 'Test record',
    },
    {
      recordId: 'TREC002',
      title: 'User Record',
      category: 'Finance',
      status: 'Pending',
      owner: 'testuser',
      description: 'Test record owned by testuser',
    },
  ]);
});

afterAll(async () => {
  await User.deleteMany({});
  await Record.deleteMany({});
  await mongoose.disconnect();
});

describe('POST /api/auth/login', () => {
  it('should login admin successfully', async () => {
    const res = await request(app).post('/api/auth/login').send({
      userId: 'testadmin',
      password: 'admin123',
      role: 'ADMIN',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('ADMIN');

    adminToken = res.body.token;
  });

  it('should login general user successfully', async () => {
    const res = await request(app).post('/api/auth/login').send({
      userId: 'testuser',
      password: 'user123',
      role: 'GENERAL_USER',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('GENERAL_USER');

    userToken = res.body.token;
  });

  it('should fail with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      userId: 'testadmin',
      password: 'wrongpassword',
      role: 'ADMIN',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should fail with wrong role', async () => {
    const res = await request(app).post('/api/auth/login').send({
      userId: 'testuser',
      password: 'user123',
      role: 'ADMIN',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should fail with non-existent user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      userId: 'nobody',
      password: 'nope',
      role: 'GENERAL_USER',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should fail with missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({
      userId: 'testadmin',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/users (Admin only)', () => {
  it('should return users for admin', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('should return 403 for general user', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/records (Role-based filtering)', () => {
  it('should return all records for admin', async () => {
    const res = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.records.length).toBeGreaterThanOrEqual(2);
  });

  it('should return only own records for general user', async () => {
    const res = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // All returned records should belong to the user
    res.body.records.forEach((r: { owner: string }) => {
      expect(r.owner).toBe('testuser');
    });
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/records');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/users (Admin only)', () => {
  it('should create user as admin', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: 'newuser',
        name: 'New User',
        email: 'newuser@test.com',
        password: 'pass123',
        role: 'GENERAL_USER',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should fail to create user as general user', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        userId: 'anotheruser',
        name: 'Another',
        email: 'another@test.com',
        password: 'pass123',
        role: 'GENERAL_USER',
      });

    expect(res.status).toBe(403);
  });
});
