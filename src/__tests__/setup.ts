import { config } from 'dotenv'

// Load environment variables for tests
config()

// Mock environment variables for testing
process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'test-token'

// Increase Jest timeout for async operations
jest.setTimeout(10000)
