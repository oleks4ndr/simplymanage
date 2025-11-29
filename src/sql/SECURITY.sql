-- =============================================
-- DATABASE SECURITY CONFIGURATION
-- =============================================
-- This script sets up the database-level security roles and privileges.
-- It uses GRANT and REVOKE to enforce the security model.

-- 1. Clean up existing users (if any)
DROP USER IF EXISTS 'simply_user'@'localhost';
DROP USER IF EXISTS 'simply_staff'@'localhost';
DROP USER IF EXISTS 'simply_admin'@'localhost';

-- 2. Create Database Users for each Role
-- These users represent the "Application Roles" at the database connection level.
CREATE USER 'simply_user'@'localhost' IDENTIFIED BY 'user_password';
CREATE USER 'simply_staff'@'localhost' IDENTIFIED BY 'staff_password';
CREATE USER 'simply_admin'@'localhost' IDENTIFIED BY 'admin_password';

-- =============================================
-- ROLE: USER (Default)
-- Capabilities: 
-- - Browse Catalog (Read Items, Categories, Assets)
-- - Manage Own Profile (Read/Update Users table - restricted ideally, but simplified here)
-- - Checkout (Insert into Loans)
-- =============================================

-- Grant Read Access to Catalog
GRANT SELECT ON simplymanage.items TO 'simply_user'@'localhost';
GRANT SELECT ON simplymanage.categories TO 'simply_user'@'localhost';
GRANT SELECT ON simplymanage.assets TO 'simply_user'@'localhost';

-- Grant Access to manage their own session/profile (needs access to users table)
GRANT SELECT, UPDATE ON simplymanage.users TO 'simply_user'@'localhost';

-- Grant Access to Create Loans (Checkout)
GRANT INSERT, SELECT ON simplymanage.loans TO 'simply_user'@'localhost';
GRANT INSERT, SELECT ON simplymanage.loan_details TO 'simply_user'@'localhost';

-- Note: We do not need to REVOKE privileges that were never granted.
-- The user only has the specific privileges granted above.



-- =============================================
-- ROLE: STAFF
-- Capabilities:
-- - All User capabilities
-- - Approve Loans (Update Loans)
-- - Manage Items (Insert/Update Items, Assets)
-- =============================================

-- Grant User Privileges
GRANT SELECT ON simplymanage.items TO 'simply_staff'@'localhost';
GRANT SELECT ON simplymanage.categories TO 'simply_staff'@'localhost';
GRANT SELECT ON simplymanage.assets TO 'simply_staff'@'localhost';
GRANT SELECT, UPDATE ON simplymanage.users TO 'simply_staff'@'localhost';
GRANT INSERT, SELECT ON simplymanage.loans TO 'simply_staff'@'localhost';
GRANT INSERT, SELECT ON simplymanage.loan_details TO 'simply_staff'@'localhost';

-- Grant Staff Specific Privileges
-- Approve/Reject Loans
GRANT UPDATE ON simplymanage.loans TO 'simply_staff'@'localhost';

-- Manage Items and Assets
GRANT INSERT, UPDATE ON simplymanage.items TO 'simply_staff'@'localhost';
GRANT INSERT, UPDATE ON simplymanage.assets TO 'simply_staff'@'localhost';


-- =============================================
-- ROLE: ADMIN
-- Capabilities:
-- - Full Access to everything
-- - Manage User Roles
-- =============================================

-- Grant All Privileges
GRANT ALL PRIVILEGES ON simplymanage.* TO 'simply_admin'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;
