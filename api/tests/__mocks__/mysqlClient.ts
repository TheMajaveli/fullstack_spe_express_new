// Mock MySQL connection pool
export const dbMock = {
  execute: jest.fn(),
  query: jest.fn(),
  end: jest.fn(),
};
