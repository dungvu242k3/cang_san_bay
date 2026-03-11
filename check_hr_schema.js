const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function main() {
    const { data: profiles, error: err1 } = await s.from('employee_profiles').select('*').limit(1)
    if (err1) console.log('ERROR profiles:', err1.message)
    else console.log('employee_profiles COLUMNS:', profiles.length ? Object.keys(profiles[0]).join(', ') : 'Empty table')

    // Also let's check what other tables might exist by guessing
    const guesses = ['departments', 'certificates', 'salaries', 'leaves', 'employee_certificates', 'employee_salaries', 'employee_leaves']
    for (const table of guesses) {
        const { data, error } = await s.from(table).select('*').limit(1)
        if (error) console.log(`Table ${table} error:`, error.message)
        else console.log(`Table ${table} COLUMNS:`, data.length ? Object.keys(data[0]).join(', ') : 'Empty table')
    }

    process.exit(0)
}
main()
