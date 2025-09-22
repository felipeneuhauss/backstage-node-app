const { createTestApp } = require('../helpers/testHelpers');

describe('Complete API Integration Test Suite', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('API Endpoints Overview', () => {
    it('should have all expected endpoints available', async () => {
      const response = await app.get('/');

      expect(response.status).toBe(200);
      expect(response.body.endpoints).toEqual({
        health: '/health',
        apiStatus: '/api-status',
        api: '/api',
        users: '/api/users',
        services: '/api/services'
      });
    });

    it('should maintain consistent API version across endpoints', async () => {
      const [rootResponse, apiResponse] = await Promise.all([
        app.get('/'),
        app.get('/api')
      ]);

      expect(rootResponse.body.version).toBe('1.0.0');
      expect(apiResponse.body.version).toBe('1.0.0');
    });

    it('should have consistent service name across status endpoints', async () => {
      const [healthResponse, statusResponse] = await Promise.all([
        app.get('/health'),
        app.get('/api-status')
      ]);

      expect(statusResponse.body.service.name).toBe('backstage-node-app');
    });
  });

  describe('Cross-Endpoint Data Consistency', () => {
    it('should have consistent timestamps across all endpoints', async () => {
      const responses = await Promise.all([
        app.get('/'),
        app.get('/health'),
        app.get('/api-status'),
        app.get('/api/users'),
        app.get('/api/services')
      ]);

      const timestamps = responses.map(r => new Date(r.body.timestamp));
      
      timestamps.forEach(timestamp => {
        expect(timestamp).toBeInstanceOf(Date);
        expect(timestamp.getTime()).not.toBeNaN();
      });

      const timeDiff = Math.max(...timestamps) - Math.min(...timestamps);
      expect(timeDiff).toBeLessThan(5000);
    });

    it('should have consistent environment information', async () => {
      const [healthResponse, statusResponse] = await Promise.all([
        app.get('/health'),
        app.get('/api-status')
      ]);

      expect(healthResponse.body.environment).toBe('test');
      expect(statusResponse.body.service.environment).toBe('test');
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle high concurrent load', async () => {
      const endpoints = [
        '/',
        '/health',
        '/api-status',
        '/api',
        '/api/users',
        '/api/services'
      ];

      const promises = [];
      for (let i = 0; i < 20; i++) {
        const endpoint = endpoints[i % endpoints.length];
        promises.push(app.get(endpoint));
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should maintain response times under load', async () => {
      const startTime = Date.now();
      
      const promises = Array(10).fill().map(() => 
        app.get('/api-status')
      );
      
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.responseTime).toBeLessThan(1000);
      });
      
      expect(totalTime).toBeLessThan(5000);
    });

    it('should handle mixed request types concurrently', async () => {
      const promises = [
        app.get('/health'),
        app.get('/api/users'),
        app.get('/api/services'),
        app.get('/api/services/test-service'),
        app.post('/api/services').send({ name: 'Concurrent Test', version: '1.0.0' }),
        app.get('/non-existent-endpoint')
      ];

      const responses = await Promise.all(promises);
      
      expect(responses[0].status).toBe(200);
      expect(responses[1].status).toBe(200);
      expect(responses[2].status).toBe(200);
      expect(responses[3].status).toBe(200);
      expect(responses[4].status).toBe(201);
      expect(responses[5].status).toBe(404);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data consistency across multiple requests', async () => {
      const userResponses = await Promise.all([
        app.get('/api/users'),
        app.get('/api/users'),
        app.get('/api/users')
      ]);

      const serviceResponses = await Promise.all([
        app.get('/api/services'),
        app.get('/api/services'),
        app.get('/api/services')
      ]);

      userResponses.forEach(response => {
        expect(response.body.users).toEqual(userResponses[0].body.users);
        expect(response.body.total).toBe(userResponses[0].body.total);
      });

      serviceResponses.forEach(response => {
        expect(response.body.services).toEqual(serviceResponses[0].body.services);
        expect(response.body.total).toBe(serviceResponses[0].body.total);
      });
    });

    it('should generate consistent service IDs for same input', async () => {
      const serviceName = 'Consistent Test Service';
      
      const responses = await Promise.all([
        app.post('/api/services').send({ name: serviceName, version: '1.0.0' }),
        app.post('/api/services').send({ name: serviceName, version: '2.0.0' })
      ]);

      expect(responses[0].body.id).toBe('consistent-test-service');
      expect(responses[1].body.id).toBe('consistent-test-service');
    });
  });

  describe('Security and Headers', () => {
    it('should include security headers', async () => {
      const response = await app.get('/');

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });

    it('should handle CORS properly', async () => {
      const response = await app.get('/')
        .set('Origin', 'https://example.com');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should not expose sensitive information in error responses', async () => {
      const response = await app.get('/non-existent-endpoint');

      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).not.toHaveProperty('internal');
      expect(response.body).not.toHaveProperty('debug');
    });
  });

  describe('API Contract Compliance', () => {
    it('should follow RESTful conventions', async () => {
      const getResponse = await app.get('/api/services');
      const postResponse = await app.post('/api/services')
        .send({ name: 'REST Test', version: '1.0.0' });

      expect(getResponse.status).toBe(200);
      expect(postResponse.status).toBe(201);
    });

    it('should return appropriate HTTP status codes', async () => {
      const responses = await Promise.all([
        app.get('/'),
        app.get('/health'),
        app.get('/api-status'),
        app.get('/api'),
        app.get('/api/users'),
        app.get('/api/services'),
        app.get('/api/services/test'),
        app.post('/api/services').send({ name: 'Test', version: '1.0.0' }),
        app.post('/api/services').send({ name: 'Test' }),
        app.get('/non-existent')
      ]);

      expect(responses[0].status).toBe(200);
      expect(responses[1].status).toBe(200);
      expect(responses[2].status).toBe(200);
      expect(responses[3].status).toBe(200);
      expect(responses[4].status).toBe(200);
      expect(responses[5].status).toBe(200);
      expect(responses[6].status).toBe(200);
      expect(responses[7].status).toBe(201);
      expect(responses[8].status).toBe(400);
      expect(responses[9].status).toBe(404);
    });

    it('should maintain consistent JSON structure', async () => {
      const responses = await Promise.all([
        app.get('/api/users'),
        app.get('/api/services')
      ]);

      responses.forEach(response => {
        expect(response.body).toHaveProperty('timestamp');
        expect(typeof response.body.timestamp).toBe('string');
        expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
      });
    });
  });
});
