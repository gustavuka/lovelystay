import { fetchUser, fetchUserLanguages } from '../../github/api'
import { createUser, getUserByUsername, updateUser } from '../../database/user'
import { createOrUpdateRepository } from '../../database/repository'
import { db } from '../../database'

export const fetchUserData = async (username: string): Promise<void> => {
  try {
    const [user, repositories] = await Promise.all([
      fetchUser(username),
      fetchUserLanguages(username),
    ])

    await db.tx(async (t) => {
      const existingUser = await getUserByUsername(t, user.login)
      let userId: number

      if (existingUser) {
        const result = await updateUser(t, user)
        userId = result.id
        console.log(`User ${user.login} updated.`)
      } else {
        const result = await createUser(t, user)
        userId = result.id
        console.log(`User ${user.login} saved.`)
      }

      for (const repo of repositories) {
        await createOrUpdateRepository(t, userId, repo)
      }
    })

    const savedUser = await getUserByUsername(db, user.login)
    if (savedUser) {
      console.log('\nUser Information:')
      console.log(`Name: ${savedUser.name || 'Not provided'}`)
      console.log(`Location: ${savedUser.location || 'Not provided'}`)
      console.log(`Public Repositories: ${savedUser.public_repos}`)
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
  }
}
