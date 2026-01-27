import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

function SchemaProbe() {
    const [logs, setLogs] = useState([])

    useEffect(() => {
        const checkTables = async () => {
            const tablesToCheck = ['family_members', 'party_records', 'youth_union', 'trade_union', 'union_members', 'employee_party_info']
            let results = []

            for (const table of tablesToCheck) {
                const { data, error } = await supabase.from(table).select('*').limit(1)
                results.push(`Table: ${table} - ${error ? 'Error: ' + error.message : 'Exists (Rows: ' + (data?.length || 0) + ')'}`)
                if (data && data.length > 0) {
                    results.push(`  Keys: ${Object.keys(data[0]).join(', ')}`)
                }
            }
            setLogs(results)
        }
        checkTables()
    }, [])

    return (
        <div style={{ padding: 20, background: '#eee' }}>
            <h3>Schema Probe</h3>
            <pre>{logs.join('\n')}</pre>
        </div>
    )
}

export default SchemaProbe
