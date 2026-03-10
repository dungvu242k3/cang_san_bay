const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://lfppkkvufcnnbnrmhpvz.supabase.co'
const supabaseAnonKey = 'sb_publishable_HlLR823geE2vJ5xi4AIp0Q__MUlQkd-'

console.log('=== DEBUG LOGIN ===')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debug() {
    // Test 1: Check connection
    console.log('\n--- Test 1: Check employee_profiles table ---')
    const { data: profiles, error: profileError } = await supabase
        .from('employee_profiles')
        .select('employee_code, first_name, last_name, current_position, status, password')
        .limit(5)

    if (profileError) {
        console.error('X Error querying employee_profiles:', profileError.message)
        console.error('   Code:', profileError.code)
        console.error('   Details:', profileError.details)
    } else {
        console.log('OK Found', profiles?.length, 'profiles')
        if (profiles) {
            profiles.forEach(p => {
                const pwd = p.password ? (p.password.substring(0, 10) + '...') : 'NULL'
                console.log('   -', p.employee_code, ':', p.last_name, p.first_name, '| Status:', p.status, '| Pwd:', pwd)
            })
        }
    }

    // Test 2: Check ADMIN
    console.log('\n--- Test 2: Check ADMIN account ---')
    const { data: admin, error: adminError } = await supabase
        .from('employee_profiles')
        .select('employee_code, first_name, last_name, status, password, current_position')
        .eq('employee_code', 'ADMIN')
        .single()

    if (adminError) {
        console.error('X ADMIN not found:', adminError.message, '| Code:', adminError.code)
    } else {
        console.log('OK ADMIN found:')
        console.log('   employee_code:', admin.employee_code)
        console.log('   name:', admin.last_name, admin.first_name)
        console.log('   status:', admin.status)
        console.log('   position:', admin.current_position)
        console.log('   password:', admin.password || 'NULL/EMPTY')
    }

    // Test 3: Check RPC
    console.log('\n--- Test 3: Check verify_user_password RPC ---')
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
        'verify_user_password',
        { p_employee_code: 'ADMIN', p_password: '123456' }
    )

    if (rpcError) {
        console.error('X RPC Error:', rpcError.message)
        console.error('   Code:', rpcError.code)
        console.error('   Hint:', rpcError.hint)
    } else {
        console.log('OK RPC result:', rpcResult)
        if (rpcResult === true) {
            console.log('   Password 123456 is CORRECT for ADMIN')
        } else {
            console.log('   Password 123456 is WRONG for ADMIN')
        }
    }

    // Test 4: Check rbac_matrix
    console.log('\n--- Test 4: Check rbac_matrix table ---')
    const { data: rbac, error: rbacError } = await supabase
        .from('rbac_matrix')
        .select('role_level, page_key')
        .limit(3)

    if (rbacError) {
        console.error('X rbac_matrix error:', rbacError.message)
    } else {
        console.log('OK rbac_matrix has', rbac?.length, 'entries (first 3)')
        rbac?.forEach(r => console.log('   -', r.role_level, ':', r.page_key))
    }

    console.log('\n=== DONE ===')
}

debug().catch(err => console.error('Fatal:', err))
