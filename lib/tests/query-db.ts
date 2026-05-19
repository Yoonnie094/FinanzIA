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
  console.log('Querying profiles...')
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .limit(10)

  if (pError) {
    console.error('Error fetching profiles:', pError)
  } else {
    console.log('Profiles in database:', JSON.stringify(profiles, null, 2))
  }

  console.log('Querying businesses...')
  const { data: businesses, error: bError } = await supabase
    .from('businesses')
    .select('*')
    .limit(10)

  if (bError) {
    console.error('Error fetching businesses:', bError)
  } else {
    console.log('Businesses in database:', JSON.stringify(businesses, null, 2))
  }
}

run()
