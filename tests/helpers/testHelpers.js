const request = require('supertest');

const createTestApp = () => {
  const app = require('../../server');
  return request(app);
};

const expectValidTimestamp = (timestamp) => {
  expect(new Date(timestamp)).toBeInstanceOf(Date);
  expect(new Date(timestamp).getTime()).not.toBeNaN();
};

const expectValidHealthResponse = (response) => {
  expect(response.body).toHaveProperty('status');
  expect(response.body).toHaveProperty('uptime');
  expect(response.body).toHaveProperty('timestamp');
  expect(response.body).toHaveProperty('memory');
  expect(response.body).toHaveProperty('version');
  expect(response.body).toHaveProperty('environment');
  
  expectValidTimestamp(response.body.timestamp);
  expect(typeof response.body.uptime).toBe('number');
  expect(typeof response.body.memory).toBe('object');
  expect(typeof response.body.version).toBe('string');
};

const expectValidApiStatusResponse = (response) => {
  expect(response.body).toHaveProperty('service');
  expect(response.body).toHaveProperty('pod');
  expect(response.body).toHaveProperty('system');
  expect(response.body).toHaveProperty('git');
  expect(response.body).toHaveProperty('endpoints');
  expect(response.body).toHaveProperty('responseTime');
  
  expect(response.body.service).toHaveProperty('name');
  expect(response.body.service).toHaveProperty('version');
  expect(response.body.service).toHaveProperty('status');
  expect(response.body.service).toHaveProperty('uptime');
  expect(response.body.service).toHaveProperty('timestamp');
  expect(response.body.service).toHaveProperty('environment');
  expect(response.body.service).toHaveProperty('port');
  
  expectValidTimestamp(response.body.service.timestamp);
  expect(typeof response.body.service.uptime).toBe('number');
  expect(typeof response.body.responseTime).toBe('number');
};

const expectValidUserResponse = (response) => {
  expect(response.body).toHaveProperty('users');
  expect(response.body).toHaveProperty('total');
  expect(response.body).toHaveProperty('timestamp');
  
  expect(Array.isArray(response.body.users)).toBe(true);
  expect(typeof response.body.total).toBe('number');
  expectValidTimestamp(response.body.timestamp);
  
  response.body.users.forEach(user => {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('role');
  });
};

const expectValidServiceResponse = (response) => {
  expect(response.body).toHaveProperty('services');
  expect(response.body).toHaveProperty('total');
  expect(response.body).toHaveProperty('timestamp');
  
  expect(Array.isArray(response.body.services)).toBe(true);
  expect(typeof response.body.total).toBe('number');
  expectValidTimestamp(response.body.timestamp);
  
  response.body.services.forEach(service => {
    expect(service).toHaveProperty('id');
    expect(service).toHaveProperty('name');
    expect(service).toHaveProperty('status');
    expect(service).toHaveProperty('version');
    expect(service).toHaveProperty('lastDeployed');
  });
};

const expectValidSingleServiceResponse = (response) => {
  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('name');
  expect(response.body).toHaveProperty('status');
  expect(response.body).toHaveProperty('version');
  expect(response.body).toHaveProperty('lastDeployed');
  expect(response.body).toHaveProperty('endpoints');
  expect(response.body).toHaveProperty('dependencies');
  expect(response.body).toHaveProperty('metrics');
  
  expect(Array.isArray(response.body.endpoints)).toBe(true);
  expect(Array.isArray(response.body.dependencies)).toBe(true);
  expect(typeof response.body.metrics).toBe('object');
  expectValidTimestamp(response.body.lastDeployed);
};

module.exports = {
  createTestApp,
  expectValidTimestamp,
  expectValidHealthResponse,
  expectValidApiStatusResponse,
  expectValidUserResponse,
  expectValidServiceResponse,
  expectValidSingleServiceResponse
};
