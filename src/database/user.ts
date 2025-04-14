import { IDatabase, ITask } from 'pg-promise'
import type { GitHubUser } from '../github/api'

type DatabaseOrTask = IDatabase<{}, any> | ITask<{}>

export const createUser = async (db: DatabaseOrTask, user: GitHubUser) => {
  return db.one(
    `INSERT INTO users (github_username, name, location, public_repos)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [user.login, user.name, user.location, user.public_repos],
  )
}

export const updateUser = async (db: DatabaseOrTask, user: GitHubUser) => {
  return db.one(
    `UPDATE users 
     SET name = $2, location = $3, public_repos = $4
     WHERE github_username = $1
     RETURNING id`,
    [user.login, user.name, user.location, user.public_repos],
  )
}

export const getUserByUsername = async (
  db: DatabaseOrTask,
  username: string,
) => {
  return db.oneOrNone(`SELECT * FROM users WHERE github_username = $1`, [
    username,
  ])
}
