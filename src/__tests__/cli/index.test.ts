import { fetchUserData } from '../../cli/commands/fetch-users'
import { listUserData } from '../../cli/commands/list-users'
import { fetchUser, fetchUserLanguages } from '../../github/api'
import { createUser, getUserByUsername, updateUser } from '../../database/user'
import { createOrUpdateRepository } from '../../database/repository'
import { db } from '../../database'

// Mock the console.log and console.error
const originalConsoleLog = console.log
const originalConsoleError = console.error

beforeAll(() => {
  console.log = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  console.log = originalConsoleLog
  console.error = originalConsoleError
})

// Mock the database
jest.mock('../../database', () => ({
  db: {
    tx: jest.fn(),
    any: jest.fn(),
  },
}))

// Mock the GitHub API
jest.mock('../../github/api', () => ({
  fetchUser: jest.fn(),
  fetchUserLanguages: jest.fn(),
}))

// Mock the database user functions
jest.mock('../../database/user', () => ({
  createUser: jest.fn(),
  getUserByUsername: jest.fn(),
  updateUser: jest.fn(),
}))

// Mock the database repository functions
jest.mock('../../database/repository', () => ({
  createOrUpdateRepository: jest.fn(),
}))

describe('CLI', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchUserData', () => {
    const mockUser = {
      login: 'testuser',
      name: 'Test User',
      location: 'Test Location',
      public_repos: 10,
    }

    const mockRepositories = [
      {
        name: 'repo1',
        languages: { JavaScript: 1000, TypeScript: 2000 },
      },
    ]

    it('should fetch and save user data successfully', async () => {
      ;(fetchUser as jest.Mock).mockResolvedValue(mockUser)
      ;(fetchUserLanguages as jest.Mock).mockResolvedValue(mockRepositories)
      ;(getUserByUsername as jest.Mock).mockResolvedValue(null)
      ;(createUser as jest.Mock).mockResolvedValue({ id: 1 })
      ;(createOrUpdateRepository as jest.Mock).mockResolvedValue(undefined)
      ;(db.tx as jest.Mock).mockImplementation((callback) => callback(db))

      await fetchUserData('testuser')

      expect(fetchUser).toHaveBeenCalledWith('testuser')
      expect(fetchUserLanguages).toHaveBeenCalledWith('testuser')
      expect(createUser).toHaveBeenCalled()
      expect(createOrUpdateRepository).toHaveBeenCalled()
      expect(console.log).toHaveBeenCalledWith('User testuser saved.')
    })

    it('should update existing user data', async () => {
      ;(fetchUser as jest.Mock).mockResolvedValue(mockUser)
      ;(fetchUserLanguages as jest.Mock).mockResolvedValue(mockRepositories)
      ;(getUserByUsername as jest.Mock).mockResolvedValue({ id: 1 })
      ;(updateUser as jest.Mock).mockResolvedValue({ id: 1 })
      ;(createOrUpdateRepository as jest.Mock).mockResolvedValue(undefined)
      ;(db.tx as jest.Mock).mockImplementation((callback) => callback(db))

      await fetchUserData('testuser')

      expect(updateUser).toHaveBeenCalled()
      expect(console.log).toHaveBeenCalledWith('User testuser updated.')
    })

    it('should handle errors during fetch', async () => {
      const error = new Error('API Error')
      ;(fetchUser as jest.Mock).mockRejectedValue(error)

      await fetchUserData('testuser')

      expect(console.error).toHaveBeenCalledWith('Error:', error.message)
    })
  })

  describe('listUserData', () => {
    const mockUsers = [
      {
        github_username: 'user1',
        name: 'User One',
        location: 'Location 1',
        public_repos: 5,
      },
      {
        github_username: 'user2',
        name: 'User Two',
        location: 'Location 2',
        public_repos: 10,
      },
    ]

    it('should list all users when no filters are provided', async () => {
      ;(db.any as jest.Mock).mockResolvedValue(mockUsers)

      await listUserData()

      expect(db.any).toHaveBeenCalledWith(
        expect.stringContaining('SELECT DISTINCT u.*'),
        [],
      )
      expect(console.log).toHaveBeenCalledWith('\nUsers in database:')
    })

    it('should filter users by location', async () => {
      ;(db.any as jest.Mock).mockResolvedValue([mockUsers[0]])

      await listUserData('Location 1')

      expect(db.any).toHaveBeenCalledWith(
        expect.stringContaining('WHERE LOWER(u.location)'),
        ['%Location 1%'],
      )
    })

    it('should filter users by language', async () => {
      ;(db.any as jest.Mock).mockResolvedValue([mockUsers[0]])

      await listUserData(undefined, 'JavaScript')

      expect(db.any).toHaveBeenCalledWith(
        expect.stringContaining('JOIN programming_languages'),
        ['%JavaScript%'],
      )
    })

    it('should handle no users found', async () => {
      ;(db.any as jest.Mock).mockResolvedValue([])

      await listUserData()

      expect(console.log).toHaveBeenCalledWith(
        'No users found in the database.',
      )
    })

    it('should handle database errors', async () => {
      const error = new Error('Database Error')
      ;(db.any as jest.Mock).mockRejectedValue(error)

      await listUserData()

      expect(console.error).toHaveBeenCalledWith('Error:', error.message)
    })
  })
})
