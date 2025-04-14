import axios from 'axios'

const GITHUB_API_URL = 'https://api.github.com'

export interface GitHubUser {
  login: string
  name: string
  location: string
  public_repos: number
}

export interface Repository {
  name: string
  languages_url: string
}

export interface LanguageStats {
  [language: string]: number
}

export interface RepositoryWithLanguages {
  name: string
  languages: LanguageStats
}

export const fetchUser = async (username: string): Promise<GitHubUser> => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/users/${username}`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`User '${username}' not found`)
      }
      if (error.response?.status === 403) {
        throw new Error('Rate limit exceeded or invalid token')
      }
    }
    throw error
  }
}

export const fetchUserLanguages = async (
  username: string,
): Promise<RepositoryWithLanguages[]> => {
  try {
    const reposResponse = await axios.get<Repository[]>(
      `${GITHUB_API_URL}/users/${username}/repos`,
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

    const languageResponses = await Promise.all(
      reposResponse.data.map(async (repo) => {
        const response = await axios.get<LanguageStats>(repo.languages_url, {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
        })
        return {
          name: repo.name,
          languages: response.data,
        }
      }),
    )

    return languageResponses
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`User '${username}' not found`)
      }
      if (error.response?.status === 403) {
        throw new Error('Rate limit exceeded or invalid token')
      }
    }
    throw error
  }
}
