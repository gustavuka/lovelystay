#!/usr/bin/env node

import { config } from 'dotenv'
import { main } from './cli'

// Load environment variables
config()

// Start the application
main().catch((error) => {
  console.error('Error:', error instanceof Error ? error.message : error)
})
