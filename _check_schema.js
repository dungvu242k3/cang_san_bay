const { createClient } = require('@supabase/supabase-js')
const s = createClient('https://lfwwqkehjapbtlmhhouy.supabase.co', 'sb_publishable_ilFNcDqsH6SG-SGs2QoVuQ_pG6LLfmS')

async function main() {
    const { data, error } = await s.from('documents').select('*').limit(1)
    if (error) { console.log('ERROR:', error.message); process.exit(1) }
    if (data && data.length > 0) {
        console.log('COLUMNS:', Object.keys(data[0]).join(', '))
        console.log('SAMPLE:', JSON.stringify(data[0], null, 2))
    } else {
        console.log('Table exists but is empty. Checking columns via empty row...')
        // Try inserting and rolling back to see columns
        const { data: d2, error: e2 } = await s.from('documents').select('*').limit(0)
        console.log('Query result:', d2)
    }
    process.exit(0)
}
main()
