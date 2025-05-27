# GitHub User Data Fetcher

A CLI tool to fetch and store GitHub user data, including their repositories and programming languages.

## Features

- Fetch GitHub user data including:
  - Basic user information
  - Public repositories
  - Programming languages used
- Store user data in a PostgreSQL database
- List stored users with optional filters by location and programming language

## Prerequisites

- Node.js (v20 or higher)
- PostgreSQL database
- GitHub Personal Access Token (for API access)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/github-user-fetcher.git
cd github-user-fetcher
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
GITHUB_TOKEN=your_github_token
```

4. Initialize the database:

The project is setup with docker. You can run the postgres db using docker compose.

```bash
docker compose up db
```

If you would like to run the database locally please update the .env accordingly.

### Database Migrations

Apply the migrations to the db:

```bash
npm run migrate
```

## Usage

### Development Mode

For development, you can run the application directly with TypeScript:

```bash
# Fetch a user
npm run dev -- fetch <username>

# List all users
npm run dev -- list-users

# List users by location
npm run dev -- list-users --location "New York"

# List users by programming language
npm run dev -- list-users --language "JavaScript"
```

### Production Mode

For production use, first build the project:

```bash
npm run build
```

```bash
# Fetch a user
npm start -- fetch <username>

# List all users
npm start -- list-users

# List users by location
npm start -- list-users --location "New York"

# List users by programming language
npm start -- list-users --language "JavaScript"
```

### Global Installation (Optional)

You can install the CLI globally on your machine to use it from any directory:

```bash
# Install globally
npm install -g .

# Now you can use the 'ghelper' command from anywhere
ghelper fetch <username>
ghelper list-users
ghelper list-users --location "New York"
ghelper list-users --language "JavaScript"
```

## Development

### Running Tests

```bash
npm test
```

## Project Structure

```
src/
├── cli/              # CLI interface and commands
├── database/         # Database models and queries
├── github/           # GitHub API integration
└── __tests__/       # Test files
```
