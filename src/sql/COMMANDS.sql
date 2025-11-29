-- Non Advanced SQL Commands for the App

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
    -- retrieve categories and their names to build category tree UI
    -- retrieve items for each category (specifying the category)
    -- retrieve assets per item (only for staff/admin functionality)
    -- retrieve locations for items
    -- retrieve all loans
    -- retrieve specific loan info


-- Add data (DONE)
    -- add user to users table (sign up) ***
    -- add items to items
    -- add categories to categories 
    -- add assets 
    -- add loans
    -- add location to item


-- Update data (JIAQI)
    -- update user info like name...
<<<<<<< Updated upstream
    -- update item data (description, name)
    -- update loans (l_checked_in_at) :: checking them in
	-- 
-- Delete data (GARY)
    -- deleting category
    -- deleting items
    -- deleting specific assets
    -- deleting users
    -- deleting loans (discarding them)
=======
DELIMITER //
DROP PROCEDURE IF EXISTS sp_update_user_info //
CREATE PROCEDURE sp_update_user_info(
    IN p_u_id INT,
    IN p_fname VARCHAR(20),
    IN p_lname VARCHAR(20),
    IN p_email VARCHAR(20),
    IN p_role  VARCHAR(12),
    IN p_password VARCHAR(255),
    IN p_active BOOLEAN
)
BEGIN
    UPDATE users
    SET
        u_fname    = COALESCE(p_fname,    u_fname),
        u_lname    = COALESCE(p_lname,    u_lname),
        u_email    = COALESCE(p_email,    u_email),
        u_role     = COALESCE(p_role,     u_role),
        u_password = COALESCE(p_password, u_password),
        u_active   = COALESCE(p_active,   u_active)
    WHERE u_id = p_u_id;
END//
>>>>>>> Stashed changes

-- ADVANCED FUNCTIONS (ONE EACH)
    -- audit history of who added items or categories (TRIGGER) (ALEKS)
    -- audit history of who modified items (TRIGGER) (GARY)
<<<<<<< Updated upstream
=======
CREATE TABLE item_modification_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    it_id INT,
    action_type CHAR(6),
    old_info JSON,
    new_info JSON,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (it_id) REFERENCES items(it_id)
);

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

>>>>>>> Stashed changes
    -- CHECK constraint for unique email per user (JIAQI)
    -- audit history of user role changing (TRIGGER) (RYAN)
    
-- Check Constraint (Jiaqi):
ALTER TABLE users
  ADD CONSTRAINT uq_users_email UNIQUE (u_email);