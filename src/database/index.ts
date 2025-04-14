import pgPromise from 'pg-promise'
import { config } from 'dotenv'

// Load environment variables
config()

const pgp = pgPromise()
const db = pgp(process.env.DATABASE_URL!)

export { db }
