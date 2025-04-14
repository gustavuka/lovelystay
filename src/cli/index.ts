import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { fetchUserData } from './commands/fetch-users'
import { listUserData } from './commands/list-users'
import { closeConnection } from '../database'

export async function main(): Promise<void> {
  const argv = await yargs(hideBin(process.argv))
    .command('fetch <username>', 'Fetch a GitHub user', (yargs) => {
      return yargs.positional('username', {
        describe: 'GitHub username to fetch',
        type: 'string',
      })
    })
    .command('list-users', 'List stored users', (yargs) => {
      return yargs
        .option('location', {
          alias: 'l',
          type: 'string',
          description: 'Filter users by location',
        })
        .option('language', {
          alias: 'lang',
          type: 'string',
          description: 'Filter users by programming language',
        })
    })
    .demandCommand(1, 'You need to specify a command')
    .strict()
    .fail((msg, err, yargs) => {
      if (err) throw err
      console.error('Error:', msg)
      console.error('\nAvailable commands:')
      console.error(yargs.help())
      return
    })
    .help().argv

  try {
    if (argv._[0] === 'fetch' && typeof argv.username === 'string') {
      await fetchUserData(argv.username)
    } else if (argv._[0] === 'list-users') {
      await listUserData(
        argv.location as string | undefined,
        argv.language as string | undefined,
      )
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
  } finally {
    // Close the database connection
    await closeConnection()
  }
}
