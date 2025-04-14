import { db } from '../../database'
import { Table } from 'console-table-printer'

export const listUserData = async (location?: string, language?: string) => {
  try {
    const params: string[] = []
    if (location) params.push(`%${location}%`)
    if (language) params.push(`%${language}%`)

    const users = await db.any(
      `SELECT DISTINCT u.*
       FROM users u
       ${
         language
           ? 'JOIN repositories r ON r.user_id = u.id ' +
             'JOIN repository_languages rl ON rl.repository_id = r.id ' +
             'JOIN programming_languages pl ON pl.id = rl.language_id ' +
             'WHERE LOWER(pl.name) LIKE LOWER($' +
             params.length +
             ')'
           : ''
       }
       ${location ? `${language ? 'AND' : 'WHERE'} LOWER(u.location) LIKE LOWER($1)` : ''}
       ORDER BY u.github_username`,
      params,
    )

    if (users.length === 0) {
      console.log('No users found in the database.')
      return
    }

    const table = new Table({
      columns: [
        { name: 'username', title: 'Username' },
        { name: 'name', title: 'Name' },
        { name: 'location', title: 'Location' },
        { name: 'repos', title: 'Repos' },
      ],
    })

    for (const user of users) {
      table.addRow({
        username: user.github_username,
        name: user.name || 'N/A',
        location: user.location || 'N/A',
        repos: user.public_repos,
      })
    }

    console.log('\nUsers in database:')
    table.printTable()
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
  }
}
