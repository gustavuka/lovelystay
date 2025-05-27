import { db } from '../../database'
import { createOrUpdateRepository } from '../../database/repository'
import type { GitHubUser, RepositoryWithLanguages } from '../../github/api'

jest.mock('../../database', () => ({
  db: {
    one: jest.fn(),
    oneOrNone: jest.fn(),
    none: jest.fn(),
    any: jest.fn(),
    tx: jest.fn((callback) =>
      callback({
        one: jest.fn(),
        oneOrNone: jest.fn(),
        none: jest.fn(),
        any: jest.fn(),
      }),
    ),
  },
}))

describe('Repository Database Functions', () => {
  const mockUser: GitHubUser = {
    login: 'testuser',
    name: 'Test User',
    location: 'Test Location',
    public_repos: 10,
  }

  const mockRepo: RepositoryWithLanguages = {
    name: 'test-repo',
    languages: {
      TypeScript: 1000,
      JavaScript: 500,
    },
  }

  const userId = 1

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createOrUpdateRepository', () => {
    it('should create a new repository with languages', async () => {
      const repoId = 1
      const mockDb = {
        oneOrNone: jest.fn().mockResolvedValueOnce(null),
        one: jest
          .fn()
          .mockResolvedValueOnce({ id: repoId }) // repository creation
          .mockResolvedValueOnce({ id: 1 }) // TypeScript language
          .mockResolvedValueOnce({ id: 2 }), // JavaScript language
        none: jest.fn(),
      }
      ;(db.tx as jest.Mock).mockImplementationOnce((callback) =>
        callback(mockDb),
      )

      const result = await createOrUpdateRepository(db, userId, mockRepo)
      expect(result).toEqual({ id: repoId })

      // Verify repository creation
      expect(mockDb.oneOrNone).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id FROM repositories'),
        [userId, mockRepo.name],
      )

      expect(mockDb.one).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO repositories'),
        [userId, mockRepo.name],
      )

      // Verify language creation
      expect(mockDb.one).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO programming_languages'),
        ['TypeScript'],
      )

      expect(mockDb.one).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO programming_languages'),
        ['JavaScript'],
      )
    })

    it('should update existing repository languages', async () => {
      const repoId = 1
      const mockDb = {
        oneOrNone: jest.fn().mockResolvedValueOnce({ id: repoId }),
        one: jest
          .fn()
          .mockResolvedValueOnce({ id: 1 }) // TypeScript language
          .mockResolvedValueOnce({ id: 3 }), // Python language
        none: jest.fn(),
      }
      ;(db.tx as jest.Mock).mockImplementationOnce((callback) =>
        callback(mockDb),
      )

      const updatedRepo: RepositoryWithLanguages = {
        name: mockRepo.name,
        languages: {
          TypeScript: 2000,
          Python: 1500,
        },
      }

      const result = await createOrUpdateRepository(db, userId, updatedRepo)
      expect(result).toEqual({ id: repoId })

      // Verify repository lookup
      expect(mockDb.oneOrNone).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id FROM repositories'),
        [userId, updatedRepo.name],
      )

      // Verify language creation/update
      expect(mockDb.one).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO programming_languages'),
        ['TypeScript'],
      )

      expect(mockDb.one).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO programming_languages'),
        ['Python'],
      )

      // Verify language bytes update
      expect(mockDb.none).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO repository_languages'),
        [repoId, 1, 2000],
      )

      expect(mockDb.none).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO repository_languages'),
        [repoId, 3, 1500],
      )
    })
  })
})
