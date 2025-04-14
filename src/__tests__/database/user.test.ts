import { db } from '../../database'
import { createUser, updateUser, getUserByUsername } from '../../database/user'
import type { GitHubUser } from '../../github/api'

jest.mock('../../database', () => ({
  db: {
    one: jest.fn(),
    oneOrNone: jest.fn(),
    none: jest.fn(),
  },
}))

describe('User Database Functions', () => {
  const mockUser: GitHubUser = {
    login: 'testuser',
    name: 'Test User',
    location: 'Test Location',
    public_repos: 10,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockId = 1
      const mockUserData = {
        id: mockId,
        github_username: mockUser.login,
        name: mockUser.name,
        location: mockUser.location,
        public_repos: mockUser.public_repos,
      }

      ;(db.one as jest.Mock).mockResolvedValueOnce({ id: mockId })
      ;(db.oneOrNone as jest.Mock).mockResolvedValueOnce(mockUserData)

      const result = await createUser(db, mockUser)
      expect(result).toEqual({ id: mockId })

      expect(db.one).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [
          mockUser.login,
          mockUser.name,
          mockUser.location,
          mockUser.public_repos,
        ],
      )

      const savedUser = await getUserByUsername(db, mockUser.login)
      expect(savedUser).toMatchObject({
        github_username: mockUser.login,
        name: mockUser.name,
        location: mockUser.location,
        public_repos: mockUser.public_repos,
      })
    })

    it('should throw on duplicate username', async () => {
      ;(db.one as jest.Mock).mockRejectedValueOnce(new Error('Duplicate key'))
      await expect(createUser(db, mockUser)).rejects.toThrow('Duplicate key')
    })
  })

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const mockId = 1
      const updatedUser: GitHubUser = {
        ...mockUser,
        name: 'Updated Name',
        location: 'Updated Location',
        public_repos: 20,
      }

      const mockUpdatedData = {
        id: mockId,
        github_username: updatedUser.login,
        name: updatedUser.name,
        location: updatedUser.location,
        public_repos: updatedUser.public_repos,
      }

      ;(db.one as jest.Mock).mockResolvedValueOnce({ id: mockId })
      ;(db.oneOrNone as jest.Mock).mockResolvedValueOnce(mockUpdatedData)

      const result = await updateUser(db, updatedUser)
      expect(result).toEqual({ id: mockId })

      expect(db.one).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [
          updatedUser.login,
          updatedUser.name,
          updatedUser.location,
          updatedUser.public_repos,
        ],
      )

      const savedUser = await getUserByUsername(db, updatedUser.login)
      expect(savedUser).toMatchObject({
        github_username: updatedUser.login,
        name: updatedUser.name,
        location: updatedUser.location,
        public_repos: updatedUser.public_repos,
      })
    })

    it('should throw when updating non-existent user', async () => {
      ;(db.one as jest.Mock).mockRejectedValueOnce(new Error('User not found'))
      await expect(updateUser(db, mockUser)).rejects.toThrow('User not found')
    })
  })

  describe('getUserByUsername', () => {
    it('should return null for non-existent user', async () => {
      ;(db.oneOrNone as jest.Mock).mockResolvedValueOnce(null)
      const result = await getUserByUsername(db, 'nonexistent')
      expect(result).toBeNull()
    })

    it('should return user data for existing user', async () => {
      const mockId = 1
      const mockUserData = {
        id: mockId,
        github_username: mockUser.login,
        name: mockUser.name,
        location: mockUser.location,
        public_repos: mockUser.public_repos,
      }

      ;(db.oneOrNone as jest.Mock).mockResolvedValueOnce(mockUserData)

      const result = await getUserByUsername(db, mockUser.login)
      expect(result).toMatchObject({
        github_username: mockUser.login,
        name: mockUser.name,
        location: mockUser.location,
        public_repos: mockUser.public_repos,
      })

      expect(db.oneOrNone).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users'),
        [mockUser.login],
      )
    })
  })
})
