// swagger.js
module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'My Shop API',
    version: '1.0.0',
    description: 'API documentation for My Shop',
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3001}`,
      description: 'Local server',
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
  },
  security: [
    {
      BearerAuth: [],
    },
  ],

  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name:     { type: 'string' },
                  email:    { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email:    { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful, returns token' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/products': {
      get: {
        summary: 'Get all products',
        tags: ['Products'],
        responses: { 200: { description: 'List of products' } },
      },
      post: {
        summary: 'Create a product (admin)',
        tags: ['Products'],
        responses: { 201: { description: 'Product created' } },
      },
    },
    '/api/products/{id}': {
      get: {
        summary: 'Get product by ID',
        tags: ['Products'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Product details' } },
      },
      put: {
        summary: 'Update product (admin)',
        tags: ['Products'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Product updated' } },
      },
      delete: {
        summary: 'Delete product (admin)',
        tags: ['Products'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Product deleted' } },
      },
    },
    '/api/cart': {
      get:  { summary: 'Get cart',    tags: ['Cart'], responses: { 200: { description: 'Cart contents' } } },
      post: { summary: 'Add to cart', tags: ['Cart'], responses: { 200: { description: 'Item added' } } },
    },
    '/api/orders': {
      get:  { summary: 'Get orders',  tags: ['Orders'], responses: { 200: { description: 'List of orders' } } },
      post: { summary: 'Place order', tags: ['Orders'], responses: { 201: { description: 'Order placed' } } },
    },
    '/api/users': {
      get: { summary: 'Get all users (admin)', tags: ['Users'], responses: { 200: { description: 'List of users' } } },
    },
  },
};