/**
 * Script tạo tài khoản Admin trong Supabase Auth
 * Chạy: node scripts/create_admin_account.js
 * 
 * Lưu ý: Cần có SUPABASE_SERVICE_ROLE_KEY trong .env
 * Lấy key này từ Supabase Dashboard > Settings > API > service_role key
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Thiếu biến môi trường:')
    console.error('   - VITE_SUPABASE_URL')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY (hoặc VITE_SUPABASE_ANON_KEY)')
    process.exit(1)
}

// Sử dụng service role key để có quyền admin
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createAdminAccount() {
    try {
        console.log('🔐 Đang tạo tài khoản Admin...')
        
        const email = 'ADMIN@cangsanbay.local'
        const password = '123456'
        
        // Kiểm tra xem tài khoản đã tồn tại chưa
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === email)
        
        if (existingUser) {
            console.log('⚠️  Tài khoản Admin đã tồn tại!')
            console.log(`   Email: ${email}`)
            console.log(`   User ID: ${existingUser.id}`)
            
            // Reset password về mặc định
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                existingUser.id,
                { password: password }
            )
            
            if (updateError) {
                console.error('❌ Lỗi reset mật khẩu:', updateError.message)
                return
            }
            
            console.log('✅ Đã reset mật khẩu về mặc định (123456)')
            return
        }
        
        // Tạo tài khoản mới
        const { data, error } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                employee_code: 'ADMIN',
                first_name: 'Hệ Thống',
                last_name: 'Quản trị'
            }
        })
        
        if (error) {
            console.error('❌ Lỗi tạo tài khoản:', error.message)
            return
        }
        
        console.log('✅ Đã tạo tài khoản Admin thành công!')
        console.log('')
        console.log('📋 Thông tin đăng nhập:')
        console.log('   Mã nhân viên: ADMIN')
        console.log('   Email: ADMIN@cangsanbay.local')
        console.log('   Mật khẩu: 123456')
        console.log('   User ID:', data.user.id)
        console.log('')
        console.log('⚠️  Lưu ý: Nên đổi mật khẩu sau lần đăng nhập đầu tiên!')
        
    } catch (err) {
        console.error('❌ Lỗi:', err.message)
    }
}

createAdminAccount()
