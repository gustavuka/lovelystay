import pgPromise from 'pg-promise'
import { config } from 'dotenv'

// Load environment variables
config()

const pgp = pgPromise()
const db = pgp(process.env.DATABASE_URL!)

// Function to close the database connection
const closeConnection = async () => {
  try {
    await db.$pool.end()
  } catch (error) {
    console.error('Error closing database connection:', error)
  }
}

export { db, closeConnection }
