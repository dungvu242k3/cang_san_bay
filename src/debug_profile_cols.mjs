
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lfwwqkehjapbtlmhhouy.supabase.co'
const supabaseAnonKey = 'sb_publishable_ilFNcDqsH6SG-SGs2QoVuQ_pG6LLfmS'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkProfileColumns() {
    console.log("Checking employee_profiles columns...")
    const { data, error } = await supabase.from('employee_profiles').select('*').limit(1)

    if (error) {
        console.error("Error fetching employee_profiles:", error.message)
        return
    }

    if (data && data.length > 0) {
        console.log("Keys found:", Object.keys(data[0]).join(', '))
        // Filter for likely candidates
        const likely = Object.keys(data[0]).filter(k =>
            k.includes('date') || k.includes('ngay') ||
            k.includes('party') || k.includes('dang') ||
            k.includes('union') || k.includes('doan') ||
            k.includes('chuc_vu') || k.includes('position')
        )
        console.log("Likely relevant keys:", likely.join(', '))
    } else {
        console.log("Table exists but is empty.")
    }
}

checkProfileColumns()
