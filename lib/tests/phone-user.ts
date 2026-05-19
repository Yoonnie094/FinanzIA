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
  console.log('Attempting phone sign up...')
  const { data, error } = await supabase.auth.signUp({
    phone: '+56999999999',
    password: 'Password123!',
  })
  if (error) {
    console.error('Phone sign up error:', error)
    return
  }
  console.log('Phone sign up successful!')
  console.log('User ID:', data.user?.id)
  console.log('Session exists:', !!data.session)
}

run()
