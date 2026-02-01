/**
 * RBAC Utility - Dynamic Matrix-Based Permissions
 * Zero hardcoding for permissions (except Super Admin emergency bypass)
 */

export const PERMISSIONS = {
    DASHBOARD: 'dashboard',
    TASKS: 'tasks',
    CALENDAR: 'calendar',
    GRADING: 'grading',
    LEAVES: 'leaves',
    PROFILES: 'profiles',
    ORGANIZATION: 'organization',
    SETTINGS: 'settings'
}

/**
 * Check if a user has access to a specific page based on their dynamic matrix
 */
export const canViewPage = (user, page) => {
    if (!user) return false

    // L1: Super Admin Emergency Bypass
    if (user.role_level === 'SUPER_ADMIN') return true

    // Check fetched matrix from AuthContext
    if (!user.permissions) return false

    const rule = user.permissions.find(p => p.permission_key === page)
    return rule ? rule.can_view : false
}

/**
 * Detailed action-level check with Organizational Scope
 */
export const canPerformAction = (user, action, targetData) => {
    if (!user) return false

    // L1: Super Admin Bypass
    if (user.role_level === 'SUPER_ADMIN') return true

    // 1. Check Matrix for base capability (edit/delete)
    if (!user.permissions) return false
    const rule = user.permissions.find(p => p.permission_key === targetData?.module || 'profiles')

    if (!rule) return false

    if (action === 'edit' && !rule.can_edit) return false
    if (action === 'delete' && !rule.can_delete) return false

    // 2. Check Organizational Scope (Inheritance)
    // Level 2 (Board) can usually see all data if they have view permission
    if (user.role_level === 'BOARD_DIRECTOR') return true

    // Level 3 (Dept Head)
    if (user.role_level === 'DEPT_HEAD') {
        if (!targetData) return false
        return targetData.department === user.dept_scope
    }

    // Level 4 (Team Leader)
    if (user.role_level === 'TEAM_LEADER') {
        if (!targetData) return false
        return targetData.team === user.team_scope
    }

    // Level 5 (Staff) - Self only
    if (user.role_level === 'STAFF') {
        if (!targetData) return false
        return targetData.employee_code === user.employee_code
    }

    return false
}
