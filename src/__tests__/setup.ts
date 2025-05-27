import { config } from 'dotenv'

config()

process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'test-token'

jest.setTimeout(10000)
