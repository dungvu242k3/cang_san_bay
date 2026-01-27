
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lfwwqkehjapbtlmhhouy.supabase.co'
const supabaseAnonKey = 'sb_publishable_ilFNcDqsH6SG-SGs2QoVuQ_pG6LLfmS'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkFamilyTable() {
    console.log("Checking family_members table...")
    const { data, error } = await supabase.from('family_members').select('*').limit(1)

    if (error) {
        console.error("Error fetching family_members:", error.message)
        return
    }

    if (data && data.length > 0) {
        console.log("Table exists. Columns:", Object.keys(data[0]).join(', '))
        console.log("Sample row:", data[0])
    } else {
        console.log("Table exists but is empty. Cannot determine columns from data.")
        // Try to insert a dummy to see error/structure if needed, or just assume.
        // But better to check if maybe there's another table?
    }
}

checkFamilyTable()
