import { IDatabase, ITask } from 'pg-promise'
import type { RepositoryWithLanguages } from '../github/api'
import {
  getOrCreateLanguage,
  createRepositoryLanguage,
  deleteRepositoryLanguages,
} from './language'

type DatabaseOrTask = IDatabase<{}, any> | ITask<{}>

export const createOrUpdateRepository = async (
  db: DatabaseOrTask,
  userId: number,
  repo: RepositoryWithLanguages,
) => {
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

// export const getRepositoriesByUserId = async (
//   db: DatabaseOrTask,
//   userId: number,
// ) => {
//   return db.any(
//     `SELECT r.*,
//             json_agg(json_build_object(
//               'name', pl.name,
//               'bytes', rl.bytes
//             )) as languages
//      FROM repositories r
//      LEFT JOIN repository_languages rl ON r.id = rl.repository_id
//      LEFT JOIN programming_languages pl ON rl.language_id = pl.id
//      WHERE r.user_id = $1
//      GROUP BY r.id
//      ORDER BY r.name`,
//     [userId],
//   )
// }

// export const deleteRepositoriesByUserId = async (
//   db: DatabaseOrTask,
//   userId: number,
// ) => {
//   return db.none(`DELETE FROM repositories WHERE user_id = $1`, [userId])
// }
