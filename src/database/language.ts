import { IDatabase, ITask } from 'pg-promise'

type DatabaseOrTask = IDatabase<{}, any> | ITask<{}>

export const getOrCreateLanguage = async (
  db: DatabaseOrTask,
  languageName: string,
) => {
  return db.one(
    `INSERT INTO programming_languages (name)
     VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [languageName],
  )
}

export const createRepositoryLanguage = async (
  db: DatabaseOrTask,
  repositoryId: number,
  languageId: number,
  bytes: number,
) => {
  return db.none(
    `INSERT INTO repository_languages (repository_id, language_id, bytes)
     VALUES ($1, $2, $3)
     ON CONFLICT (repository_id, language_id) DO UPDATE SET bytes = EXCLUDED.bytes`,
    [repositoryId, languageId, bytes],
  )
}

export const deleteRepositoryLanguages = async (
  db: DatabaseOrTask,
  repositoryId: number,
) => {
  return db.none(`DELETE FROM repository_languages WHERE repository_id = $1`, [
    repositoryId,
  ])
}
