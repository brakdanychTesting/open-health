import '@testing-library/jest-dom';

if (!global.fetch) {
  global.fetch = (async () => { throw new Error('fetch not mocked'); }) as any;
}

process.env.CURRENT_DEPLOYMENT_ENV = process.env.CURRENT_DEPLOYMENT_ENV || 'local';