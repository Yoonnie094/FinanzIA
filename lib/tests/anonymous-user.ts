import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=')
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim()
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log('Attempting anonymous sign in...')
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) {
    console.error('Anonymous sign in error:', error)
    return
  }
  console.log('Anonymous sign in successful!')
  console.log('User ID:', data.user?.id)
  console.log('Session exists:', !!data.session)
}

run()
