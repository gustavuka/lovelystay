export interface User {
  id: number
  github_username: string
  name: string | null
  location: string | null
  created_at: Date
  updated_at: Date
}

export interface ProgrammingLanguage {
  id: number
  name: string
}

export interface UserLanguage {
  user_id: number
  language_id: number
}
