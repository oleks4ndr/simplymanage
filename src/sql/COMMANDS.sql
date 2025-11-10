-- SQL Commands for the App

-- Create tables
CREATE TABLE users (
    u_id INT,
    u_fname VARCHAR(20),
    u_lname VARCHAR(20),
    u_email VARCHAR(20),
    u_role VARCHAR(12),
    u_password VARCHAR(255),
    u_active BOOLEAN,
    PRIMARY KEY (u_id)
);

CREATE TABLE categories (
    cat_id INT,
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
    it_id INT,
    it_name VARCHAR(20),
    it_sku VARCHAR(20),
    it_description TEXT,
    it_max_time_out INT,
    it_active BOOL,
    it_renewable BOOLEAN,
    cat_id INT,
    PRIMARY KEY (it_id),
    FOREIGN KEY (cat_id) REFERENCES categories(cat_id)
);

CREATE TABLE locations (
    loc_id INT,
    loc_name VARCHAR(20),
    loc_address VARCHAR(40),
    PRIMARY KEY (loc_id )
);

CREATE TABLE assets (
    a_id INT,
    a_status VARCHAR(20),
    a_condition VARCHAR(20),
    loc_id INT,
    it_id INT,
    PRIMARY KEY (a_id),
    FOREIGN KEY (loc_id) REFERENCES locations(loc_id),
    FOREIGN KEY (it_id) REFERENCES items(it_id)
);

CREATE TABLE loans (
    l_id INT,
    u_id INT,
    l_status VARCHAR(20),
    l_checked_out_at TIMESTAMP,
    l_due_at TIMESTAMP,
    l_checked_in_at TIMESTAMP,
    l_notes TEXT DEFAULT NULL,  -- set something default as Null
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

-- Retrieve data (ALEKS AND RYAN)
    -- retrieve user data (for session)
SELECT 
    u_id,
    u_fname,
    u_lname,
    u_email,
    u_role,
    u_active
FROM users
WHERE u_email = ?
  AND u_password = ?    -- hash comparison
  AND u_active = 1;

    -- retrieve categories and their names to build category tree UI
SELECT
    cat_id,
    cat_name,
    cat_parent_id
FROM categories
ORDER BY cat_parent_id, cat_name;

    -- retrieve items for each category (specifying the category)
SELECT
    it_id,
    it_name,
    it_sku,
    it_description,
    it_max_time_out,
    it_active,
    it_renewable,
    cat_id
FROM items
WHERE cat_id = ?
ORDER BY it_name;

    -- retrieve assets per item (only for staff/admin functionality)
SELECT
    a.a_id,
    a.a_status,
    a.a_condition,
    a.loc_id,
    l.loc_name,
    l.loc_address,
    a.it_id
FROM assets a
JOIN locations l ON a.loc_id = l.loc_id
WHERE a.it_id = ?
ORDER BY a.a_status, a.a_id;

    -- retrieve locations for items
SELECT 
    i.it_id,
    i.it_name,
    a.a_id        AS asset_id,
    l.loc_id,
    l.loc_name,
    l.loc_address
FROM items AS i
JOIN assets AS a      ON i.it_id = a.it_id
JOIN locations AS l   ON a.loc_id = l.loc_id
ORDER BY i.it_name, a.a_id;

    -- retrieve all loans
SELECT
    l.l_id,
    u.u_fname,
    u.u_lname,
    u.u_role,
    l.l_status,
    l.l_checked_out_at,
    l.l_due_at,
    l.l_checked_in_at,
    l.l_notes
FROM loans AS l
JOIN users AS u ON l.u_id = u.u_id
ORDER BY l.l_checked_out_at DESC;

    -- retrieve specific loan info(by user name)
SELECT
    l.l_id,
    u.u_fname,
    u.u_lname,
    l.l_status,
    l.l_checked_out_at,
    l.l_due_at,
    l.l_checked_in_at,
    i.it_name,
    a.a_id
FROM loans AS l
JOIN users AS u        ON l.u_id = u.u_id
JOIN loan_details AS ld ON l.l_id = ld.l_id
JOIN assets AS a       ON ld.a_id = a.a_id
JOIN items AS i        ON a.it_id = i.it_id
WHERE u.u_fname = 'Aisha' AND u.u_lname = 'Khan'; -- name can be replaced to match anyone who took a loan


-- Adding data commands:
    -- add user to users table (sign up) 
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
    -- add items to items
INSERT INTO items (it_id, it_name, it_sku, it_description, it_max_time_out, it_active, it_renewable, cat_id) VALUES
(1,  'Canon EOS R6',            'CAM-R6-001', 'Full-frame mirrorless camera',                 72, 1, 1, 1),
(2,  'Sony A7 III',             'CAM-A7-002', 'Full-frame mirrorless camera',                 72, 1, 1, 1),
(3,  'Nikon Z6 II',             'CAM-Z6-003', 'Full-frame mirrorless camera',                 72, 1, 1, 1),
(4,  '24-70mm f/2.8 Lens',      'LEN-2470-01','Versatile standard zoom lens',                 48, 1, 1, 2),
(5,  '50mm f/1.8 Lens',         'LEN-50-002', 'Prime lens for portraits',                     48, 1, 1, 2),
(6,  'Manfrotto Tripod',        'TRI-MAN-01', 'Sturdy aluminum tripod',                       48, 1, 1, 3),
(7,  'RØDE VideoMic Pro+',      'MIC-RVP-01', 'On-camera shotgun microphone',                 48, 1, 1, 5),
(8,  'Zoom H6 Recorder',        'AUD-H6-001', 'Portable audio recorder (4 XLR)',              48, 1, 1, 4),
(9,  'Aputure LED Light',       'LGT-APT-01', 'Bi-color LED panel light',                     48, 1, 1, 6),
(10, 'NP-F970 Battery',         'BAT-NPF-01', 'High-capacity battery pack',                   24, 1, 1, 7),
(11, 'HDMI 2.1 Cable 3m',       'CBL-HDMI-3', 'High-speed HDMI cable 3 meters',               24, 1, 1, 8),
(12, 'DJI Mini 3 Pro',          'DRN-MIN3-1', 'Lightweight drone with 4K video',              24, 1, 0, 9);
    -- add categories to categories and children
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

INSERT INTO categories_children (cat_id, cat_child_id) VALUES
(1, 2),   -- Cameras -> Lenses
(1, 3),   -- Cameras -> Tripods
(4, 5),   -- Audio -> Microphones
(6, 7);   -- Lighting -> Batteries
    -- add assets 
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
    -- add loans
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

    -- add location to item
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

-- Updating data commands (JIAQI)

    -- update user info like name...
DELIMITER //

CREATE PROCEDURE sp_update_user_info(
    IN p_u_id INT,
    IN p_fname VARCHAR(20),
    IN p_lname VARCHAR(20),
    IN p_email VARCHAR(20),
    IN p_role  VARCHAR(12),
    IN p_active BOOLEAN
)
BEGIN
    UPDATE users
    SET u_fname = p_fname,
        u_lname = p_lname,
        u_email = p_email,
        u_role  = p_role,
        u_active = p_active
    WHERE u_id = p_u_id;
END//

DELIMITER ;

    -- move item to category
DELIMITER //

CREATE PROCEDURE sp_move_item_to_category(
    IN p_it_id INT,
    IN p_new_cat_id INT
)
BEGIN
    UPDATE items
       SET cat_id = p_new_cat_id
     WHERE it_id  = p_it_id;
END//

DELIMITER ;


DELIMITER //

CREATE PROCEDURE sp_set_category_parent(
    IN p_cat_id INT,
    IN p_new_parent_id INT 
)
BEGIN
    UPDATE categories
       SET cat_parent_id = p_new_parent_id
     WHERE cat_id = p_cat_id;
END//

DELIMITER ;


DELIMITER //

DROP PROCEDURE IF EXISTS sp_loan_updates//
CREATE PROCEDURE sp_loan_updates(
    IN p_l_id INT
)
BEGIN
    START TRANSACTION;
    UPDATE loans
       SET l_status = 'open'
     WHERE l_id = p_l_id;

    COMMIT;
END//

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_checkout_updates(
    IN p_l_id INT,  
    IN p_a_id INT    
)
BEGIN
    START TRANSACTION;
    UPDATE assets
       SET a_status = 'checked_out'
     WHERE a_id = p_a_id;
    UPDATE loans
       SET l_status = 'open'
     WHERE l_id = p_l_id;
    COMMIT;
END//

DELIMITER ;

-- Deleting data commands (ZIQI)

-- deleting loan details according to l_id and a_id(their PK)
DELIMITER $$
CREATE OR REPLACE PROCEDURE delete_loan_details(in p_l_id INT, in p_a_id INT)
BEGIN 
    DELETE FROM loan_details
    WHERE loan_details.l_id = p_l_id AND loan_details.a_id = p_a_id;
END$$
DELIMITER ; 



-- deleting loans according to l_id (their PK)
DELIMITER $$
CREATE OR REPLACE PROCEDURE delete_loans(in p_l_id INT)
BEGIN 
    DELETE FROM loans
    WHERE loans.l_id = p_l_id;
END$$
DELIMITER ; 


-- deleting assets according to a_id (their PK)
DELIMITER $$
CREATE OR REPLACE PROCEDURE delete_asset(in p_a_id INT)
BEGIN 
    DELETE FROM assets
    WHERE assets.a_id = p_a_id;
END$$
DELIMITER ; 


-- deleting item according to it_id (their PK)
DELIMITER $$
CREATE OR REPLACE PROCEDURE delete_item(in p_it_id INT)
BEGIN 
    DELETE FROM items
    WHERE items.it_id = p_it_id;
END$$
DELIMITER ; 

-- delete the categories, this procedure will delete a category and raise its children to this level
DELIMITER $$
CREATE OR REPLACE PROCEDURE delete_category_relink(IN p_cat_id INT)
BEGIN
    DECLARE parent_id INT;

    -- get parent of current node
    SELECT cat_parent_id INTO parent_id FROM categories WHERE cat_id = p_cat_id;

    -- if this node has children, reassign their parent
    UPDATE categories
    SET cat_parent_id = parent_id
    WHERE cat_parent_id = p_cat_id;

    -- update categories_children table accordingly
    -- 1) find children
    UPDATE categories_children
    SET cat_id = parent_id
    WHERE cat_id = p_cat_id;

    -- 2) remove any self-reference entry to avoid cycles
    DELETE FROM categories_children WHERE cat_child_id = p_cat_id;

    -- finally delete the node itself
    DELETE FROM categories WHERE cat_id = p_cat_id;
END$$
DELIMITER ;


-- deleting location according to loc_id (their PK)
DELIMITER $$
CREATE OR REPLACE PROCEDURE delete_location(in p_loc_id INT)
BEGIN 
    DELETE FROM locations
    WHERE locations.loc_id = p_loc_id;
END$$
DELIMITER ; 


-- deleting user according to loc_id (their PK)
DELIMITER $$
CREATE OR REPLACE PROCEDURE delete_user(in p_u_id INT)
BEGIN 
    DELETE FROM users
    WHERE users.u_id = p_u_id;
END$$
DELIMITER ; 

-- ADVANCED FUNCTIONS (ONE EACH)
    -- audit history of who added items or categories (TRIGGER) (ALEKS)
    -- audit history of who modified items (TRIGGER) (GARY)
    -- CHECK constraint for unique email per user (JIAQI)
    -- audit history of user role changing (TRIGGER) (RYAN)

-- Check Constraint (Jiaqi):
ALTER TABLE users
  ADD CONSTRAINT uq_users_email UNIQUE (u_email);
