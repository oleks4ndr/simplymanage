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


-- Add data (DONE)
    -- add user to users table (sign up) ***
    -- add items to items
    -- add categories to categories 
    -- add assets 
    -- add loans
    -- add location to item


-- Update data (JIAQI)
    -- update user info like name...
    -- update item data (description, name)
    -- update loans (l_checked_in_at) :: checking them in

-- Delete data (GARY)
    -- deleting category
    -- deleting items
    -- deleting specific assets
    -- deleting users
    -- deleting loans (discarding them)

-- ADVANCED FUNCTIONS (ONE EACH)
    -- audit history of who added items or categories (TRIGGER) (ALEKS)
    -- audit history of who modified items (TRIGGER) (GARY)
    -- CHECK constraint for unique email per user (JIAQI)
    -- audit history of user role changing (TRIGGER) (RYAN)
