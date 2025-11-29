USE simplymanage;

-- creating tables
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


-- Creating a Contact_Ticket table to allow users to submit support requests
-- it will have: ticket_id(PK), user_id (FK), user_email () subject(optional), messaged(text), status (open, resolved), 
--               created_at (timestamp)

CREATE TABLE contact_tickets (
    ticket_id INT AUTO_INCREMENT, -- this makes ticket_id the primary key, and grows automatically
    user_id INT NULL,
    c_fname VARCHAR(50),
    c_lname VARCHAR(50),
    c_email VARCHAR(100) NOT NULL, -- even if they are not logged in, we can reach them via their email
    subject VARCHAR(160) DEFAULT NULL,
    message TEXT NOT NULL,
    status ENUM('open','resolved') NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ticket_id),
    FOREIGN KEY (user_id) REFERENCES users(u_id),

    -- If a user is deleted, we set user_id to NULL to keep the ticket for records
    CONSTRAINT fk_contact_user
        FOREIGN KEY (user_id)
        REFERENCES users(u_id)
        ON DELETE SET NULL
);

