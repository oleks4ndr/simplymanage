/* USERS (12) */
INSERT INTO users (u_id, u_fname, u_lname, u_email, u_role, u_active) VALUES
(1, 'Aisha',   'Khan',     'aisha.khan@uni.edu',     'student', 1),
(2, 'Ben',     'Lopez',    'ben.lopez@uni.edu',      'student', 1),
(3, 'Chloe',   'Ng',       'chloe.ng@uni.edu',       'student', 1),
(4, 'Diego',   'Rossi',    'diego.rossi@uni.edu',    'student', 1),
(5, 'Evan',    'Patel',    'evan.patel@uni.edu',     'student', 1),
(6, 'Fatima',  'Hassan',   'fatima.h@uni.edu',       'faculty', 1),
(7, 'Grace',   'Lee',      'grace.lee@uni.edu',      'faculty', 1),
(8, 'Hiro',    'Tanaka',   'hiro.t@uni.edu',         'staff',   1),
(9, 'Imani',   'Brooks',   'imani.b@uni.edu',        'staff',   1),
(10,'Jonas',   'Meyer',    'jonas.m@uni.edu',        'admin',   1),
(11,'Keira',   'Smith',    'keira.s@uni.edu',        'student', 0),
(12,'Leo',     'Martinez', 'leo.m@uni.edu',          'student', 1);

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

/* CATEGORY CHILDREN (each child appears once due to PK on cat_child_id) */
INSERT INTO categories_children (cat_id, cat_child_id) VALUES
(1, 2),   -- Cameras -> Lenses
(1, 3),   -- Cameras -> Tripods
(4, 5),   -- Audio -> Microphones
(6, 7);   -- Lighting -> Batteries

/* ITEMS (12) */
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

/* ASSETS (30) — physical copies of items */
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
-- l_status examples: 'open', 'closed', 'overdue'
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

/* LOAN DETAILS — which assets are in each loan */
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

/* ===========================
   QUICK VERIFICATION QUERIES
   (use for screenshots)
   =========================== */
-- Example: show row counts for each table
-- SELECT COUNT(*) AS users_count        FROM users;
-- SELECT COUNT(*) AS categories_count   FROM categories;
-- SELECT COUNT(*) AS cat_children_count FROM categories_children;
-- SELECT COUNT(*) AS items_count        FROM items;
-- SELECT COUNT(*) AS locations_count    FROM locations;
-- SELECT COUNT(*) AS assets_count       FROM assets;
-- SELECT COUNT(*) AS loans_count        FROM loans;
-- SELECT COUNT(*) AS loan_details_count FROM loan_details;

-- Example: simple JOIN to show “practical” data view (loan -> user -> assets -> items)
-- SELECT l.l_id, l.l_status, u.u_fname, u.u_lname, a.a_id, i.it_name
-- FROM loans l
-- JOIN users u ON u.u_id = l.u_id
-- JOIN loan_details ld ON ld.l_id = l.l_id
-- JOIN assets a ON a.a_id = ld.a_id
-- JOIN items i ON i.it_id = a.it_id
-- ORDER BY l.l_id, a.a_id;
