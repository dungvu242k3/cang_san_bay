
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lfwwqkehjapbtlmhhouy.supabase.co'
const supabaseAnonKey = 'sb_publishable_ilFNcDqsH6SG-SGs2QoVuQ_pG6LLfmS'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkColumns() {
    console.log("Checking family_members columns...")

    // Try to select with different FK names
    const candidates = ['employee_code', 'employee_id', 'staff_code', 'ma_nhan_vien', 'user_id', 'profile_id']

    for (const col of candidates) {
        const { error } = await supabase.from('family_members').select(col).limit(1)
        if (!error) {
            console.log(`Column '${col}' EXISTS!`)
        } else {
            // console.log(`Column '${col}' Error: ${error.message}`)
        }
    }
}

checkColumns()
