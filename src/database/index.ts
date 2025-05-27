import pgPromise from 'pg-promise'

const pgp = pgPromise()
const db = pgp(process.env.DATABASE_URL!)

const closeConnection = async (): Promise<void> => {
  try {
    await db.$pool.end()
  } catch (error) {
    console.error('Error closing database connection:', error)
    throw error
  }
}

export { db, closeConnection }
