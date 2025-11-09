USE inventory_management;

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
    WHERE users.loc_id = p_u_id;
END$$
DELIMITER ; 
