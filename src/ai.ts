import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

export const openai = new OpenAI()

export const localai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'http://localhost:11434/v1/',
})
