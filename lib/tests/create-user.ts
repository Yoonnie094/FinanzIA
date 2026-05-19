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
  const email = `test_user_${Date.now()}@test.com`
  const password = 'Password123!'
  console.log(`Attempting to sign up user: ${email}`)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: 'Juan',
        last_name: 'Pérez',
        phones: ['+56912345678'],
      }
    }
  })

  if (error) {
    console.error('Sign up error:', error)
    return
  }

  console.log('Sign up successful!')
  console.log('User ID:', data.user?.id)
  console.log('Session exists:', !!data.session)
  if (data.session) {
    console.log('Session Access Token:', data.session.access_token)
  }
}

run()
