
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lfwwqkehjapbtlmhhouy.supabase.co'
const supabaseAnonKey = 'sb_publishable_ilFNcDqsH6SG-SGs2QoVuQ_pG6LLfmS'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function probe() {
    const tables = ['family_members', 'party_members', 'party_records', 'union_members', 'trade_union', 'job_history', 'working_process', 'employee_party_info']

    console.log("Probing tables...")
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1)
        if (error) {
            console.log(`Table '${table}' -> Error: ${error.message} (Code: ${error.code})`)
        } else {
            console.log(`Table '${table}' -> Exists! Rows: ${data.length}`)
            if (data.length > 0) {
                console.log(`keys: ${Object.keys(data[0]).join(', ')}`)
            }
        }
    }
}

probe()
