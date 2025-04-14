import axios from 'axios'
import {
  fetchUser,
  fetchUserLanguages,
  GitHubUser,
  RepositoryWithLanguages,
} from '../../github/api'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('GitHub API Functions', () => {
  const username = 'testuser'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchUser', () => {
    const mockGitHubResponse = {
      data: {
        login: username,
        name: 'Test User',
        location: 'Test Location',
        public_repos: 10,
      },
    }

    it('should fetch and return GitHub user data', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockGitHubResponse)

      const result = await fetchUser(username)

      expect(result).toEqual(mockGitHubResponse.data)
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://api.github.com/users/${username}`,
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
        },
      )
    })

    it('should throw error for non-existent user', async () => {
      const error = {
        response: {
          status: 404,
        },
      }
      mockedAxios.get.mockRejectedValueOnce(error)
      mockedAxios.isAxiosError.mockReturnValueOnce(true)

      await expect(fetchUser('nonexistent')).rejects.toThrow(
        "User 'nonexistent' not found",
      )
    })

    it('should throw error for rate limit exceeded', async () => {
      const error = {
        response: {
          status: 403,
        },
      }
      mockedAxios.get.mockRejectedValueOnce(error)
      mockedAxios.isAxiosError.mockReturnValueOnce(true)

      await expect(fetchUser(username)).rejects.toThrow(
        'Rate limit exceeded or invalid token',
      )
    })
  })

  describe('fetchUserLanguages', () => {
    const mockRepos = {
      data: [
        {
          name: 'repo1',
          languages_url:
            'https://api.github.com/repos/testuser/repo1/languages',
        },
        {
          name: 'repo2',
          languages_url:
            'https://api.github.com/repos/testuser/repo2/languages',
        },
      ],
    }

    const mockLanguages1 = {
      data: {
        JavaScript: 1000,
        TypeScript: 2000,
      },
    }

    const mockLanguages2 = {
      data: {
        Python: 3000,
        Ruby: 4000,
      },
    }

    it('should fetch and return repository languages', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockRepos)
        .mockResolvedValueOnce(mockLanguages1)
        .mockResolvedValueOnce(mockLanguages2)

      const result = await fetchUserLanguages(username)

      expect(result).toEqual([
        {
          name: 'repo1',
          languages: mockLanguages1.data,
        },
        {
          name: 'repo2',
          languages: mockLanguages2.data,
        },
      ])

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://api.github.com/users/${username}/repos`,
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
          params: {
            per_page: 100,
            sort: 'updated',
          },
        },
      )
    })

    it('should throw error for non-existent user', async () => {
      const error = {
        response: {
          status: 404,
        },
      }
      mockedAxios.get.mockRejectedValueOnce(error)
      mockedAxios.isAxiosError.mockReturnValueOnce(true)

      await expect(fetchUserLanguages('nonexistent')).rejects.toThrow(
        "User 'nonexistent' not found",
      )
    })

    it('should throw error for rate limit exceeded', async () => {
      const error = {
        response: {
          status: 403,
        },
      }
      mockedAxios.get.mockRejectedValueOnce(error)
      mockedAxios.isAxiosError.mockReturnValueOnce(true)

      await expect(fetchUserLanguages(username)).rejects.toThrow(
        'Rate limit exceeded or invalid token',
      )
    })
  })
})
