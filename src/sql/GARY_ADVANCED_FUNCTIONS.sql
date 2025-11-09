-- the following are a draft of vital procedures which are going to be used in our DB system
USE inventory_management;
-- a trigger to produce the audit history of modification on items
-- be aware that our log is recorded as json objects
-- some SQL whose edition is too low is not able to use it!
CREATE TABLE item_modification_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    it_id INT,
    action_type ENUM('INSERT', 'UPDATE', 'DELETE'),
    old_info JSON,
    new_info JSON,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (it_id) REFERENCES items(it_id)
);

DELIMITER @@
CREATE OR REPLACE TRIGGER audit_item_insert
AFTER INSERT ON items
FOR EACH ROW
BEGIN
    INSERT INTO item_modification_history (it_id, action_type, new_row)
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
DELIMITER ;


DELIMITER @@
CREATE OR REPLACE TRIGGER audit_item_update
AFTER UPDATE ON items
FOR EACH ROW
BEGIN
    INSERT INTO item_modification_history (it_id, action_type, old_row, new_row)
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
DELIMITER ;

DELIMITER @@
CREATE OR REPLACE TRIGGER audit_item_delete
AFTER DELETE ON items
FOR EACH ROW
BEGIN
    INSERT INTO item_modification_history (it_id, action_type, old_row)
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