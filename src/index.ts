#!/usr/bin/env node

import { config } from 'dotenv'
config()

import { main } from './cli'

main().catch((error) => {
  console.error('Error:', error instanceof Error ? error.message : error)
})
