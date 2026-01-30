-- Script to DELETE ALL DATA from the database
-- Use this to clean up the environment before running tests or checking fresh data.

-- Truncate all tables with CASCADE to handle foreign key references automatically
TRUNCATE TABLE 
    public.employee_profiles, 
    public.family_members, 
    public.performance_reviews,
    public.employee_bank_accounts, 
    public.employee_passports, 
    public.labor_contracts 
CASCADE;

SELECT 'Đã xóa sạch toàn bộ dữ liệu!' AS message;

SELECT COUNT(*) AS profiles FROM employee_profiles;
SELECT COUNT(*) AS families FROM family_members;
SELECT COUNT(*) AS reviews FROM performance_reviews;
SELECT COUNT(*) AS banks FROM employee_bank_accounts;
SELECT COUNT(*) AS contracts FROM labor_contracts;
SELECT COUNT(*) AS passports FROM employee_passports;
