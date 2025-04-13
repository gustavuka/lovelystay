import { promises as fs } from 'fs'
import path from 'path'
import { db } from './index'
import { config } from 'dotenv'

// Load environment variables
config()

console.log('Database URL:', process.env.DATABASE_URL)

async function runMigrations(): Promise<void> {
  try {
    console.log('Starting migrations...')

    // Start a transaction
    await db.tx(async (t) => {
      console.log('Connected to database, creating migrations table...')

      // Create migrations table if it doesn't exist
      await t.none(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Get list of migration files
      const migrationsDir = path.join(process.cwd(), 'migrations')
      console.log('Reading migrations from:', migrationsDir)

      const files = await fs.readdir(migrationsDir)
      const sqlFiles = files.filter((file) => file.endsWith('.sql')).sort()

      console.log('Found migration files:', sqlFiles)

      // Get executed migrations
      const executedMigrations = await t.any(
        'SELECT name FROM migrations ORDER BY id',
      )
      const executedNames = executedMigrations.map((m) => m.name)
      console.log('Already executed migrations:', executedNames)

      // Run pending migrations
      for (const file of sqlFiles) {
        if (!executedNames.includes(file)) {
          console.log(`Running migration: ${file}`)
          const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8')
          await t.none(sql)
          await t.none('INSERT INTO migrations (name) VALUES ($1)', [file])
          console.log(`Completed migration: ${file}`)
        }
      }
    })

    console.log('All migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
}

export { runMigrations }
