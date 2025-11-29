-- =============================================
-- SIMPLYMANAGE DATABASE - COMPLETE IMPORT FILE
-- =============================================
-- This file sets up the entire database from scratch.
-- Import this directly into your MySQL server to create:
-- 1. Database and all tables
-- 2. Sample data (users, items, categories, etc.)
-- 3. Advanced functions (triggers, procedures, constraints)
-- 4. Security roles and permissions
-- =============================================

-- Create and use the database
CREATE DATABASE IF NOT EXISTS simplymanage;
USE simplymanage;

-- =============================================
-- SECTION 1: CREATE TABLES
-- =============================================

CREATE TABLE users (
    u_id INT AUTO_INCREMENT,
    u_fname VARCHAR(50),
    u_lname VARCHAR(50),
    u_email VARCHAR(100) UNIQUE,
    u_role VARCHAR(12) DEFAULT 'user',
    u_password VARCHAR(255),
    u_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (u_id)
);

CREATE TABLE categories (
    cat_id INT AUTO_INCREMENT,
    cat_name VARCHAR(20),
    cat_parent_id INT NULL,
    PRIMARY KEY (cat_id)
);

CREATE TABLE categories_children (
    cat_id INT,
    cat_child_id INT,
    PRIMARY KEY (cat_child_id),
    FOREIGN KEY (cat_id) REFERENCES categories(cat_id)
);

CREATE TABLE items (
    it_id INT AUTO_INCREMENT,
    it_name VARCHAR(100),
    it_sku VARCHAR(50),
    it_description TEXT,
    it_image_url VARCHAR(500),
    it_max_time_out INT,
    it_active BOOL DEFAULT TRUE,
    it_renewable BOOLEAN DEFAULT FALSE,
    cat_id INT,
    PRIMARY KEY (it_id),
    FOREIGN KEY (cat_id) REFERENCES categories(cat_id)
);

CREATE TABLE locations (
    loc_id INT AUTO_INCREMENT,
    loc_name VARCHAR(20),
    loc_address VARCHAR(40),
    PRIMARY KEY (loc_id)
);

CREATE TABLE assets (
    a_id INT AUTO_INCREMENT,
    a_status VARCHAR(20),
    a_condition VARCHAR(20),
    loc_id INT,
    it_id INT,
    PRIMARY KEY (a_id),
    FOREIGN KEY (loc_id) REFERENCES locations(loc_id),
    FOREIGN KEY (it_id) REFERENCES items(it_id)
);

CREATE TABLE loans (
    l_id INT AUTO_INCREMENT,
    u_id INT,
    l_status VARCHAR(20),
    l_checked_out_at TIMESTAMP,
    l_due_at TIMESTAMP,
    l_checked_in_at TIMESTAMP,
    l_notes TEXT DEFAULT NULL,
    PRIMARY KEY (l_id),
    FOREIGN KEY (u_id) REFERENCES users(u_id)
);

CREATE TABLE loan_details (
    l_id INT,
    a_id INT,
    PRIMARY KEY (l_id,a_id),
    FOREIGN KEY (l_id) REFERENCES loans(l_id),
    FOREIGN KEY (a_id) REFERENCES assets(a_id)
);

CREATE TABLE contact_tickets (
    ticket_id INT AUTO_INCREMENT,
    user_id INT NULL,
    c_fname VARCHAR(50),
    c_lname VARCHAR(50),
    c_email VARCHAR(100) NOT NULL,
    subject VARCHAR(160) DEFAULT NULL,
    message TEXT NOT NULL,
    status ENUM('open','resolved') NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ticket_id),
    FOREIGN KEY (user_id) REFERENCES users(u_id),
    CONSTRAINT fk_contact_user
        FOREIGN KEY (user_id)
        REFERENCES users(u_id)
        ON DELETE SET NULL
);

-- Tables for advanced function audit trails
CREATE TABLE item_additions_history (
    addition_id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('ITEM','CATEGORY') NOT NULL,
    entity_id   INT NOT NULL,
    added_by    INT NOT NULL,
    added_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES users(u_id)
);

CREATE TABLE item_modification_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    it_id INT,
    action_type CHAR(6),
    old_info JSON,
    new_info JSON,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (it_id) REFERENCES items(it_id)
);

CREATE TABLE user_role_audit (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    uid INT NOT NULL,
    old_role VARCHAR(12),
    new_role VARCHAR(12),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(50)
);

-- =============================================
-- SECTION 2: INSERT SAMPLE DATA
-- =============================================

/* USERS (12) */
INSERT INTO users (u_id, u_fname, u_lname, u_email, u_role, u_password, u_active) VALUES
(1, 'Aisha',   'Khan',     'aisha.khan@uni.edu',     'user',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
(2, 'Ben',     'Lopez',    'ben.lopez@uni.edu',      'user',  '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 1),
(3, 'Chloe',   'Ng',       'chloe.ng@uni.edu',       'user',  '$2y$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 1),
(4, 'Diego',   'Rossi',    'diego.rossi@uni.edu',    'user',  '$2y$10$YKEbAjM7VZhVjKL3Nh2oOe8jGWBTnHh0jJ0wZvKqN5Fj8WZhJ7K8m', 1),
(5, 'Evan',    'Patel',    'evan.patel@uni.edu',     'user',  '$2y$10$N9qo3uLOickgx2ZoFQ1q3.BxY3CGQJ3EKc8Gv2J1GhJ2vY8GzH9Km', 1),
(6, 'Fatima',  'Hassan',   'fatima.h@uni.edu',       'staff', '$2y$10$wGhRjM8KqN5Pj2LmN9oQx.7YZhN8VjKqL2JmG8HjK9LmN5PjQx2Km', 1),
(7, 'Grace',   'Lee',      'grace.lee@uni.edu',      'admin', '$2y$10$zQaDT8hXM4pLmBdwN0xEseda/oKJAQKMKMzUrV8jbs6Epz28BXzBS', 1),
(8, 'Hiro',    'Tanaka',   'hiro.t@uni.edu',         'staff', '$2y$10$eJkL9mN2oP3qR4sT5uV6w.8ZaKbL9MdN2oPe3QfR4gS5hT6iU7jVm', 1),
(9, 'Imani',   'Brooks',   'imani.b@uni.edu',        'staff', '$2y$10$fKlM8nN3pO4qS5tT6vU7x.9ZbLcM8NeO3pQf4RgS5hT6iU8jV9kWm', 1),
(10,'Jonas',   'Meyer',    'jonas.m@uni.edu',        'admin', '$2y$10$gLmN9oO4pP5qT6uU7vV8y.0ZcMdN9OfP4qQg5ShT6iU9jV0kW1lXm', 1),
(11,'Keira',   'Smith',    'keira.s@uni.edu',        'user',  '$2y$10$hMnO0pP5qQ6uU7vV8wW9z.1ZdNeO0pGq5rRh6TiU0kV1lW2mX3nYm', 0),
(12,'Leo',     'Martinez', 'leo.m@uni.edu',          'user',  '$2y$10$iNoP1qQ6rR7vV8wW9xX0a.2ZeOfP1qHr6sSi7TjV1lW2mX3nY4oZm', 1);

/* CATEGORIES (10) */
INSERT INTO categories (cat_id, cat_name, cat_parent_id) VALUES
(1,  'Cameras',        NULL),
(2,  'Lenses',         1),
(3,  'Tripods',        1),
(4,  'Audio',          NULL),
(5,  'Microphones',    4),
(6,  'Lighting',       NULL),
(7,  'Batteries',      6),
(8,  'Cables',         NULL),
(9,  'Drones',         NULL),
(10, 'Accessories',    NULL);

/* CATEGORY CHILDREN */
INSERT INTO categories_children (cat_id, cat_child_id) VALUES
(1, 2),   -- Cameras -> Lenses
(1, 3),   -- Cameras -> Tripods
(4, 5),   -- Audio -> Microphones
(6, 7);   -- Lighting -> Batteries

/* ITEMS (12) */
INSERT INTO items (it_id, it_name, it_sku, it_description, it_image_url, it_max_time_out, it_active, it_renewable, cat_id) VALUES
(1,  'Canon EOS R6',            'CAM-R6-001', 'Full-frame mirrorless camera',                 'http://placehold.co/500', 72, 1, 1, 1),
(2,  'Sony A7 III',             'CAM-A7-002', 'Full-frame mirrorless camera',                 'http://placehold.co/500', 72, 1, 1, 1),
(3,  'Nikon Z6 II',             'CAM-Z6-003', 'Full-frame mirrorless camera',                 'http://placehold.co/500', 72, 1, 1, 1),
(4,  '24-70mm f/2.8 Lens',      'LEN-2470-01','Versatile standard zoom lens',                 'http://placehold.co/500', 48, 1, 1, 2),
(5,  '50mm f/1.8 Lens',         'LEN-50-002', 'Prime lens for portraits',                     'http://placehold.co/500', 48, 1, 1, 2),
(6,  'Manfrotto Tripod',        'TRI-MAN-01', 'Sturdy aluminum tripod',                       'http://placehold.co/500', 48, 1, 1, 3),
(7,  'RØDE VideoMic Pro+',      'MIC-RVP-01', 'On-camera shotgun microphone',                 'http://placehold.co/500', 48, 1, 1, 5),
(8,  'Zoom H6 Recorder',        'AUD-H6-001', 'Portable audio recorder (4 XLR)',              'http://placehold.co/500', 48, 1, 1, 4),
(9,  'Aputure LED Light',       'LGT-APT-01', 'Bi-color LED panel light',                     'http://placehold.co/500', 48, 1, 1, 6),
(10, 'NP-F970 Battery',         'BAT-NPF-01', 'High-capacity battery pack',                   'http://placehold.co/500', 24, 1, 1, 7),
(11, 'HDMI 2.1 Cable 3m',       'CBL-HDMI-3', 'High-speed HDMI cable 3 meters',               'http://placehold.co/500', 24, 1, 1, 8),
(12, 'DJI Mini 3 Pro',          'DRN-MIN3-1', 'Lightweight drone with 4K video',              'http://placehold.co/500', 24, 1, 0, 9);

/* LOCATIONS (10) */
INSERT INTO locations (loc_id, loc_name, loc_address) VALUES
(1,  'Cage Front Desk',  'Building A, Room 101'),
(2,  'Camera Shelf',     'Building A, Room 103'),
(3,  'Audio Cabinet',    'Building A, Room 105'),
(4,  'Lighting Rack',    'Building A, Room 107'),
(5,  'Repair Bench',     'Building A, Room 109'),
(6,  'Charging Station', 'Building A, Room 111'),
(7,  'Studio 1',         'Building B, Room 201'),
(8,  'Studio 2',         'Building B, Room 203'),
(9,  'Drone Locker',     'Building B, Room 205'),
(10, 'Overflow Storage', 'Building C, Room 301');

/* ASSETS (30) */
INSERT INTO assets (a_id, a_status, a_condition, loc_id, it_id) VALUES
(1,  'available', 'good',       2, 1),   -- Canon R6 body #1
(2,  'available', 'good',       2, 1),   -- Canon R6 body #2
(3,  'available', 'good',       2, 2),   -- Sony A7 III #1
(4,  'available', 'good',       2, 3),   -- Nikon Z6 II #1
(5,  'available', 'good',       2, 4),   -- 24-70 lens #1
(6,  'available', 'good',       2, 4),   -- 24-70 lens #2
(7,  'available', 'good',       2, 5),   -- 50mm lens #1
(8,  'available', 'good',       2, 5),   -- 50mm lens #2
(9,  'available', 'good',       1, 6),   -- Tripod #1
(10, 'available', 'good',       1, 6),   -- Tripod #2
(11, 'available', 'good',       3, 7),   -- VideoMic #1
(12, 'available', 'good',       3, 7),   -- VideoMic #2
(13, 'available', 'good',       3, 8),   -- Zoom H6 #1
(14, 'available', 'good',       3, 8),   -- Zoom H6 #2
(15, 'available', 'good',       4, 9),   -- LED Light #1
(16, 'available', 'fair',       4, 9),   -- LED Light #2
(17, 'available', 'good',       6, 10),  -- NP-F Battery #1
(18, 'available', 'good',       6, 10),  -- NP-F Battery #2
(19, 'available', 'good',       6, 10),  -- NP-F Battery #3
(20, 'available', 'good',       6, 10),  -- NP-F Battery #4
(21, 'available', 'good',       1, 11),  -- HDMI Cable #1
(22, 'available', 'good',       1, 11),  -- HDMI Cable #2
(23, 'available', 'good',       9, 12),  -- DJI Mini 3 Pro #1
(24, 'available', 'good',       9, 12),  -- DJI Mini 3 Pro #2
(25, 'available', 'good',       7, 6),   -- Tripod in Studio 1
(26, 'available', 'good',       8, 9),   -- LED in Studio 2
(27, 'available', 'good',       5, 1),   -- R6 at Repair (but good)
(28, 'available', 'good',       10, 4),  -- Lens in Overflow
(29, 'available', 'good',       10, 7),  -- Mic in Overflow
(30, 'available', 'good',       10, 8);  -- Recorder in Overflow

/* LOANS (12) */
INSERT INTO loans (l_id, u_id, l_status, l_checked_out_at, l_due_at, l_checked_in_at, l_notes) VALUES
(1,  1,  'closed',  '2025-10-01 10:00:00', '2025-10-04 10:00:00', '2025-10-03 16:30:00', 'Returned early'),
(2,  2,  'closed',  '2025-10-02 09:15:00', '2025-10-05 09:15:00', '2025-10-05 08:50:00', NULL),
(3,  3,  'open',    '2025-10-05 14:20:00', '2025-10-08 14:20:00', NULL,                    'Senior project'),
(4,  4,  'closed',  '2025-10-06 11:00:00', '2025-10-08 11:00:00', '2025-10-08 10:45:00', 'All good'),
(5,  5,  'overdue', '2025-10-07 13:45:00', '2025-10-09 13:45:00', NULL,                    'Email sent'),
(6,  6,  'closed',  '2025-10-08 09:00:00', '2025-10-10 09:00:00', '2025-10-10 09:05:00', 'Faculty checkout'),
(7,  7,  'open',    '2025-10-10 15:30:00', '2025-10-13 15:30:00', NULL,                    'Guest lecture'),
(8,  8,  'closed',  '2025-10-12 10:10:00', '2025-10-14 10:10:00', '2025-10-14 09:55:00', NULL),
(9,  9,  'closed',  '2025-10-12 16:00:00', '2025-10-13 16:00:00', '2025-10-13 15:50:00', 'Event shoot'),
(10, 10, 'open',    '2025-10-13 12:00:00', '2025-10-16 12:00:00', NULL,                    'Admin training'),
(11, 11, 'closed',  '2025-10-14 14:00:00', '2025-10-16 14:00:00', '2025-10-16 13:30:00', NULL),
(12, 12, 'open',    '2025-10-15 09:30:00', '2025-10-18 09:30:00', NULL,                    'Workshop');

/* LOAN DETAILS */
INSERT INTO loan_details (l_id, a_id) VALUES
-- Loan 1 (Aisha) : camera + lens
(1, 1),   -- R6 #1
(1, 5),   -- 24-70 #1
-- Loan 2 (Ben) : Sony body + 50mm
(2, 3),
(2, 7),
-- Loan 3 (Chloe) : Nikon + mic + recorder
(3, 4),
(3, 11),
(3, 13),
-- Loan 4 (Diego) : Tripod + LED
(4, 9),
(4, 15),
-- Loan 5 (Evan) : Drone (overdue)
(5, 23),
-- Loan 6 (Fatima) : Camera + lens + tripod
(6, 2),
(6, 6),
(6, 10),
-- Loan 7 (Grace) : LED + batteries
(7, 16),
(7, 17),
(7, 18),
-- Loan 8 (Hiro) : Recorder + mic + HDMI cable
(8, 14),
(8, 12),
(8, 21),
-- Loan 9 (Imani) : R6 + 50mm
(9, 27),
(9, 8),
-- Loan 10 (Jonas) : Tripod + HDMI + LED
(10, 25),
(10, 22),
(10, 26),
-- Loan 11 (Keira) : Nikon + 24-70
(11, 4),
(11, 28),
-- Loan 12 (Leo) : Drone + extra battery
(12, 24),
(12, 19);

-- =============================================
-- SECTION 3: ADVANCED FUNCTIONS
-- =============================================

-- 3.1: Audit history of who added items or categories (TRIGGER)
DELIMITER $$

CREATE TRIGGER item_additions_watchdog
AFTER INSERT ON items
FOR EACH ROW
BEGIN
    INSERT INTO item_additions_history (entity_type, entity_id, added_by)
    VALUES ('ITEM', NEW.it_id, @current_user_id);
END$$

CREATE TRIGGER category_additions_watchdog
AFTER INSERT ON categories
FOR EACH ROW
BEGIN
    INSERT INTO item_additions_history (entity_type, entity_id, added_by)
    VALUES ('CATEGORY', NEW.cat_id, @current_user_id);
END$$

DELIMITER ;

-- 3.2: Audit history of who modified items (TRIGGER)
DELIMITER @@

CREATE TRIGGER audit_item_insert
AFTER INSERT ON items
FOR EACH ROW
BEGIN
    INSERT INTO item_modification_history (it_id, action_type, new_info)
    VALUES (
        NEW.it_id,
        'INSERT',
        JSON_OBJECT(
            'it_id', NEW.it_id,
            'it_name', NEW.it_name,
            'it_sku', NEW.it_sku,
            'it_description', NEW.it_description,
            'it_max_time_out', NEW.it_max_time_out,
            'it_active', NEW.it_active,
            'it_renewable', NEW.it_renewable,
            'cat_id', NEW.cat_id
        )
    );
END@@

CREATE TRIGGER audit_item_update
AFTER UPDATE ON items
FOR EACH ROW
BEGIN
    INSERT INTO item_modification_history (it_id, action_type, old_info, new_info)
    VALUES (
        NEW.it_id,
        'UPDATE',
        JSON_OBJECT(
            'it_id', OLD.it_id,
            'it_name', OLD.it_name,
            'it_sku', OLD.it_sku,
            'it_description', OLD.it_description,
            'it_max_time_out', OLD.it_max_time_out,
            'it_active', OLD.it_active,
            'it_renewable', OLD.it_renewable,
            'cat_id', OLD.cat_id
        ),
        JSON_OBJECT(
            'it_id', NEW.it_id,
            'it_name', NEW.it_name,
            'it_sku', NEW.it_sku,
            'it_description', NEW.it_description,
            'it_max_time_out', NEW.it_max_time_out,
            'it_active', NEW.it_active,
            'it_renewable', NEW.it_renewable,
            'cat_id', NEW.cat_id
        )
    );
END@@

CREATE TRIGGER audit_item_delete
AFTER DELETE ON items
FOR EACH ROW
BEGIN
    INSERT INTO item_modification_history (it_id, action_type, old_info)
    VALUES (
        OLD.it_id,
        'DELETE',
        JSON_OBJECT(
            'it_id', OLD.it_id,
            'it_name', OLD.it_name,
            'it_sku', OLD.it_sku,
            'it_description', OLD.it_description,
            'it_max_time_out', OLD.it_max_time_out,
            'it_active', OLD.it_active,
            'it_renewable', OLD.it_renewable,
            'cat_id', OLD.cat_id
        )
    );
END@@

DELIMITER ;

-- 3.3: CHECK constraint for unique email per user
ALTER TABLE users
  ADD CONSTRAINT uq_users_email UNIQUE (u_email);

-- 3.4: Audit history of user role changing (TRIGGER)
DELIMITER $$

CREATE TRIGGER trg_user_role_audit
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.u_role <> NEW.u_role THEN
        INSERT INTO user_role_audit (uid, old_role, new_role, changed_by)
        VALUES (OLD.u_id, OLD.u_role, NEW.u_role, USER());
    END IF;
END$$

DELIMITER ;

-- =============================================
-- SECTION 4: SECURITY CONFIGURATION
-- =============================================

-- 4.1: Clean up existing users (if any)
DROP USER IF EXISTS 'simply_user'@'localhost';
DROP USER IF EXISTS 'simply_staff'@'localhost';
DROP USER IF EXISTS 'simply_admin'@'localhost';

-- 4.2: Create Database Users for each Role
CREATE USER 'simply_user'@'localhost' IDENTIFIED BY 'user_password';
CREATE USER 'simply_staff'@'localhost' IDENTIFIED BY 'staff_password';
CREATE USER 'simply_admin'@'localhost' IDENTIFIED BY 'admin_password';

-- 4.3: ROLE: USER (Default)
-- Grant Read Access to Catalog
GRANT SELECT ON simplymanage.items TO 'simply_user'@'localhost';
GRANT SELECT ON simplymanage.categories TO 'simply_user'@'localhost';
GRANT SELECT ON simplymanage.assets TO 'simply_user'@'localhost';

-- Grant Access to manage their own session/profile
GRANT SELECT, UPDATE ON simplymanage.users TO 'simply_user'@'localhost';

-- Grant Access to Create Loans (Checkout)
GRANT INSERT, SELECT ON simplymanage.loans TO 'simply_user'@'localhost';
GRANT INSERT, SELECT ON simplymanage.loan_details TO 'simply_user'@'localhost';

-- Grant access to contact tickets
GRANT INSERT, SELECT ON simplymanage.contact_tickets TO 'simply_user'@'localhost';

-- 4.4: ROLE: STAFF
-- Grant User Privileges
GRANT SELECT ON simplymanage.items TO 'simply_staff'@'localhost';
GRANT SELECT ON simplymanage.categories TO 'simply_staff'@'localhost';
GRANT SELECT ON simplymanage.assets TO 'simply_staff'@'localhost';
GRANT SELECT, UPDATE ON simplymanage.users TO 'simply_staff'@'localhost';
GRANT INSERT, SELECT ON simplymanage.loans TO 'simply_staff'@'localhost';
GRANT INSERT, SELECT ON simplymanage.loan_details TO 'simply_staff'@'localhost';

-- Grant Staff Specific Privileges
GRANT UPDATE ON simplymanage.loans TO 'simply_staff'@'localhost';
GRANT INSERT, UPDATE ON simplymanage.items TO 'simply_staff'@'localhost';
GRANT INSERT, UPDATE ON simplymanage.assets TO 'simply_staff'@'localhost';
GRANT INSERT, SELECT ON simplymanage.contact_tickets TO 'simply_staff'@'localhost';

-- 4.5: ROLE: ADMIN (Full Access)
GRANT ALL PRIVILEGES ON simplymanage.* TO 'simply_admin'@'localhost';

-- 4.6: Apply changes
FLUSH PRIVILEGES;

-- =============================================
-- DATABASE SETUP COMPLETE
-- =============================================
-- You can now connect to the database using:
-- - Username: simply_user, Password: user_password (for regular users)
-- - Username: simply_staff, Password: staff_password (for staff)
-- - Username: simply_admin, Password: admin_password (for admins)
-- =============================================

