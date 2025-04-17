import { IDatabase, ITask } from 'pg-promise'
import type { RepositoryWithLanguages } from '../github/api'
import { getOrCreateLanguage, createRepositoryLanguage } from './language'

type DatabaseOrTask = IDatabase<{}, any> | ITask<{}>

interface RepositoryInsertResult {
  id: number
}

export const createOrUpdateRepository = async (
  db: DatabaseOrTask,
  userId: number,
  repo: RepositoryWithLanguages,
): Promise<RepositoryInsertResult> => {
  return db.tx(async (t) => {
    const existingRepo = await t.oneOrNone(
      `SELECT id FROM repositories WHERE user_id = $1 AND name = $2`,
      [userId, repo.name],
    )

    let repositoryId: number

    if (existingRepo) {
      repositoryId = existingRepo.id
    } else {
      const result = await t.one(
        `INSERT INTO repositories (user_id, name)
         VALUES ($1, $2)
         RETURNING id`,
        [userId, repo.name],
      )
      repositoryId = result.id
    }

    for (const [languageName, bytes] of Object.entries(repo.languages)) {
      const language = await getOrCreateLanguage(t, languageName)
      await createRepositoryLanguage(t, repositoryId, language.id, bytes)
    }

    return { id: repositoryId }
  })
}
