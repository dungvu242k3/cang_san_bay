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
    SETTINGS: 'settings',
    LIBRARY: 'library'
}

/**
 * Infer Role Level from Job Position string
 * Matches logic in AuthContext to ensure consistency across the app
 */
export const inferRoleFromPosition = (position) => {
    if (!position) return 'STAFF'

    const pos = position.toLowerCase().trim()

    // Super Admin / Director
    if (pos.includes('giám đốc') || pos.includes('tổng giám đốc')) return 'BOARD_DIRECTOR' // Or BOARD_DIRECTOR based on specific rules

    // Board Director (Specific titles if needed, otherwise handled above or via DB)
    // Assuming 'Phó giám đốc' is also Board Level or high level
    if (pos.includes('phó giám đốc')) return 'BOARD_DIRECTOR'

    // Dept Head
    if (pos.includes('trưởng phòng') || pos.includes('phó trưởng phòng') || pos.includes('phó phòng') ||
        pos.includes('quyền trưởng phòng') || pos.includes('phụ trách phòng') || pos.includes('giám đốc trung tâm')) {
        return 'DEPT_HEAD'
    }

    // Team Leader
    if (pos.includes('đội trưởng') || pos.includes('tổ trưởng') || pos.includes('chủ đội') || pos.includes('chủ tổ') ||
        pos.includes('đội phó') || pos.includes('tổ phó')) {
        return 'TEAM_LEADER'
    }

    // Default to Staff
    return 'STAFF'
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

/**
 * Role Hierarchy for Grading Permissions
 * Centralized logic to prevent hardcoding at component level
 */
export const ROLE_LEVELS = {
    'SUPER_ADMIN': 100,
    'BOARD_DIRECTOR': 90,
    'DEPT_HEAD': 50,
    'TEAM_LEADER': 30,
    'STAFF': 10
}

/**
 * Check if a user can grade another employee based on STRICT direct-report hierarchy
 * Rule:
 * 1. TEAM_LEADER -> grades STAFF (Same Team)
 * 2. DEPT_HEAD -> grades TEAM_LEADER (Same Dept) - AND ONLY TEAM LEADER (per user request)
 * 3. BOARD_DIRECTOR -> grades DEPT_HEAD
 * 4. SUPER_ADMIN -> grades everyone
 */
export const canGrade = (grader, targetEmployee) => {
    if (!grader || !targetEmployee) return false

    // Admin can grade everyone
    if (grader.role_level === 'SUPER_ADMIN') return true

    const graderRole = grader.role_level
    const targetRole = targetEmployee.role_level || targetEmployee.role // handle different prop names

    // 0. Explicitly block peer grading (Same Rank)
    if (graderRole === targetRole) return false

    // 1. TEAM_LEADER -> STAFF (Same Team)
    if (graderRole === 'TEAM_LEADER') {
        const isStaff = targetRole === 'STAFF';
        // Need to check scope, but handle missing scope gracefully (assume match if scope undefined?) 
        // No, strict safety: must have scope match.
        const sameTeam = grader.team_scope && targetEmployee.team === grader.team_scope;
        return isStaff && sameTeam;
    }

    // 2. DEPT_HEAD -> TEAM_LEADER (Same Dept)
    // "Trưởng phòng chấm điểm cho các đội trưởng" - Strict interpretation
    if (graderRole === 'DEPT_HEAD') {
        const isTL = targetRole === 'TEAM_LEADER';
        const sameDept = grader.dept_scope && targetEmployee.department === grader.dept_scope;
        return isTL && sameDept;
    }

    // 3. BOARD_DIRECTOR -> DEPT_HEAD
    // "Giám đốc sẽ chấm điểm cho các trưởng phòng"
    if (graderRole === 'BOARD_DIRECTOR') {
        return targetRole === 'DEPT_HEAD';
    }

    return false
}
