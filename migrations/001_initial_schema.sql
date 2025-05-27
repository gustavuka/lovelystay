-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    github_username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    location VARCHAR(255),
    public_repos INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create repositories table
CREATE TABLE IF NOT EXISTS repositories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Create programming languages table
CREATE TABLE IF NOT EXISTS programming_languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create repository_languages junction table
CREATE TABLE IF NOT EXISTS repository_languages (
    repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
    language_id INTEGER REFERENCES programming_languages(id) ON DELETE CASCADE,
    bytes INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (repository_id, language_id)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ 
BEGIN 
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repositories_updated_at BEFORE
UPDATE ON repositories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
