export const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  movie: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  watchlist: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  },
  rating: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    aggregate: jest.fn(),
  },
  history: {
    findMany: jest.fn(),
    upsert: jest.fn(),
  },
  movieCategory: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
};

