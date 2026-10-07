import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AccessHub API',
      version: '1.0.0',
      description: 'Role-Based User Management Portal REST API',
      contact: {
        name: 'AccessHub Team',
        email: 'support@accesshub.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['userId', 'password', 'role'],
          properties: {
            userId: { type: 'string', example: 'admin' },
            password: { type: 'string', example: 'admin123' },
            role: {
              type: 'string',
              enum: ['ADMIN', 'GENERAL_USER'],
              example: 'ADMIN',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'GENERAL_USER'] },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Record: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            recordId: { type: 'string' },
            title: { type: 'string' },
            category: { type: 'string' },
            status: { type: 'string' },
            owner: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
