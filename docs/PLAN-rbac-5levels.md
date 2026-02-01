# PLAN - Detailed RBAC Hierarchy (5 Levels)

This document provides the technical roadmap for implementing the 5-level RBAC system as requested.

## 1. Hierarchy breakdown from Image

### **Level 1: Super Admin** (Quản trị hệ thống)
- **Role**: Master Administrator.
- **Scope**: All departments, all roles, all data.

### **Level 2: Board of Directors** (Ban giám đốc)
- **Included**: Giám đốc, Phó giám đốc.
- **Scope**: Full visibility across the airport organizational structure.

### **Level 3: Departments** (Phòng ban)
- **Included**: Trưởng phòng, Phó phòng.
- **Specific Entities**: 
    - Văn phòng
    - Phòng Điều hành sân bay
    - Phòng Kỹ thuật hạ tầng
    - Phòng Phục vụ mặt đất
    - Phòng Tài chính - Kế hoạch

### **Level 4: Teams / Squads** (Tổ/Đội CBA)
- **Included**: Trưởng đội, Phó đội.
- **Specific Entities**:
    - Đội Vận hành trang thiết bị mặt đất (CBA)
    - Cán bộ Phòng Kỹ thuật (CBA)
    - Đội Bảo trì hạ tầng (CBA)

### **Level 5: Staff** (Nhân viên)
- **Included**: All other personnel.
- **Scope**: Personal profile data only.

## 2. Technical Implementation

### Database Model
```sql
CREATE TABLE public.user_roles (
    employee_code TEXT PRIMARY KEY REFERENCES employee_profiles(employee_code),
    role_level INTEGER CHECK (role_level BETWEEN 1 AND 5),
    dept_scope TEXT, -- For L3 (e.g. 'Phòng Kỹ thuật hạ tầng')
    team_scope TEXT  -- For L4 (e.g. 'Đội Bảo trì hạ tầng (CBA)')
);
```

### Management UI
- **Location**: Tab "Cài đặt" (Settings).
- **Functionality**: A centralized dashboard to assign/edit employee levels and their specific scopes.

### Access Rules
- **View Policy**: `data.dept = user.dept_scope` OR `data.team = user.team_scope`.
- **Action Policy**: Only L2, L3, L4 can perform 'Grading' (Chấm điểm) for their subordinates.

## 3. Verification Roadmap
- [ ] Assign an employee to L3 of "Phòng Điều hành sân bay".
- [ ] Login/Mock as that employee and ensure they ONLY see "Phòng Điều hành sân bay" profiles.
- [ ] Assign another to L4 of "Đội Bảo trì hạ tầng (CBA)" and verify team-only visibility.
