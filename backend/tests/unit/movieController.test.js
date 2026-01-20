const pool = require('../../config/database/db');
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../../controllers/movieController');

// Mock de la base de données
jest.mock('../../config/database/db', () => ({
  query: jest.fn(),
}));

describe('MovieController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAllMovies', () => {
    it('devrait retourner une liste de films avec pagination', async () => {
      const mockMovies = [
        { id: 1, title: 'Matrix', director: 'Wachowski', rating: 8.7 },
        { id: 2, title: 'Inception', director: 'Nolan', rating: 8.8 },
      ];

      pool.query
        .mockResolvedValueOnce([{ total: 2 }]) // Count query
        .mockResolvedValueOnce([mockMovies]); // Data query

      req.query = { page: '1', limit: '10' };

      await getAllMovies(req, res);

      expect(res.json).toHaveBeenCalledWith({
        data: mockMovies,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('devrait appliquer les filtres de catégorie', async () => {
      pool.query
        .mockResolvedValueOnce([{ total: 1 }])
        .mockResolvedValueOnce([{ id: 1, title: 'Matrix' }]);

      req.query = { category: '1', page: '1', limit: '10' };

      await getAllMovies(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining([1])
      );
    });

    it('devrait appliquer la recherche', async () => {
      pool.query
        .mockResolvedValueOnce([{ total: 1 }])
        .mockResolvedValueOnce([{ id: 1, title: 'Matrix' }]);

      req.query = { search: 'matrix', page: '1', limit: '10' };

      await getAllMovies(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('LIKE'),
        expect.any(Array)
      );
    });
  });

  describe('getMovieById', () => {
    it('devrait retourner un film par ID', async () => {
      const mockMovie = { id: 1, title: 'Matrix', director: 'Wachowski' };

      pool.query.mockResolvedValueOnce([[mockMovie]]);

      req.params.id = '1';

      await getMovieById(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, title: 'Matrix' })
      );
    });

    it('devrait retourner 404 si le film n\'existe pas', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      req.params.id = '999';

      await getMovieById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Movie not found' });
    });

    it('devrait retourner 400 pour un ID invalide', async () => {
      req.params.id = 'invalid';

      await getMovieById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('createMovie', () => {
    it('devrait créer un nouveau film', async () => {
      const mockResult = { insertId: 1 };
      const mockMovie = { id: 1, title: 'Matrix', director: 'Wachowski' };

      pool.query
        .mockResolvedValueOnce([mockResult])
        .mockResolvedValueOnce([[mockMovie]]);

      req.body = {
        title: 'Matrix',
        director: 'Wachowski',
        release_year: 1999,
        rating: 8.7,
      };

      await createMovie(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockMovie);
    });

    it('devrait retourner 400 si le titre est manquant', async () => {
      req.body = { director: 'Wachowski' };

      await createMovie(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'title is required' });
    });
  });
});

