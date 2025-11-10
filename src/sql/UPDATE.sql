USE inventory_management;
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
    SET u_fname = p_fname,
        u_lname = p_lname,
        u_email = p_email,
        u_role  = p_role,
        u_password = p_password,
        u_active = p_active
    WHERE u_id = p_u_id;
END//

DELIMITER ;

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

CREATE PROCEDURE sp_update_asset(
    IN p_a_id INT,
    IN p_new_status VARCHAR(20),     
    IN p_new_condition VARCHAR(20),  
    IN p_new_loc_id INT              
)
BEGIN
    UPDATE assets
       SET a_status    = p_new_status,
           a_condition = p_new_condition,
           loc_id      = p_new_loc_id
     WHERE a_id        = p_a_id;
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

SHOW PROCEDURE STATUS WHERE Db = DATABASE();
