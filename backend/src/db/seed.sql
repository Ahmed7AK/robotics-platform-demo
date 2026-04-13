-- Insert Demo Admin
INSERT INTO users (username, password_hash, display_name, rank, role) 
VALUES ('admin', '$2a$10$tZ2.Qv22iS2Lp3lJ6GZ1G.k/f6yEwQp7g7d03.jP9Z3oYw3mC1WjC', 'Admin User', 'S', 'admin') ON CONFLICT DO NOTHING;

-- Insert Students
INSERT INTO users (username, password_hash, display_name, rank, role) VALUES 
('ahmed', '$2a$10$tZ2.Qv22iS2Lp3lJ6GZ1G.k/f6yEwQp7g7d03.jP9Z3oYw3mC1WjC', 'Ahmed', 'A', 'student'),
('sarah', '$2a$10$tZ2.Qv22iS2Lp3lJ6GZ1G.k/f6yEwQp7g7d03.jP9Z3oYw3mC1WjC', 'Sarah J.', 'C', 'student'),
('omar', '$2a$10$tZ2.Qv22iS2Lp3lJ6GZ1G.k/f6yEwQp7g7d03.jP9Z3oYw3mC1WjC', 'Omar Farooq', 'D', 'student'),
('fatima', '$2a$10$tZ2.Qv22iS2Lp3lJ6GZ1G.k/f6yEwQp7g7d03.jP9Z3oYw3mC1WjC', 'Fatima A.', 'B', 'student')
ON CONFLICT DO NOTHING;

-- Insert Projects
INSERT INTO projects (title, description, rank_required, status) VALUES 
('Libft', 'Your first library in C', 'D', 'available'),
('get_next_line', 'Reading a line from a fd', 'D', 'available'),
('ft_printf', 'Because putnbr and putstr arent enough', 'D', 'available'),
('minitalk', 'Small data exchange program using UNIX signals', 'C', 'available'),
('so_long', 'Small 2D game using minilibx', 'C', 'available'),
('push_swap', 'Sorting data on a stack with specific instructions', 'B', 'locked'),
('minishell', 'As beautiful as a shell', 'A', 'locked'),
('cub3D', 'My first RayCaster with miniLibX', 'A', 'locked'),
('webserv', 'This is when you finally understand HTTP', 'S', 'locked');

-- Insert Equipment
INSERT INTO equipment (name, description, quantity_total, quantity_available, requires_admin_approval) VALUES 
('Arduino Uno R3', 'Standard microcontroller board for basic projects', 15, 12, false),
('Raspberry Pi 4 Model B', '4GB RAM mini computer', 10, 8, true),
('Soldering Iron Kit', 'Pinecil soldering iron with tips', 5, 5, true),
('Multimeter', 'Digital precision multimeter', 8, 8, false),
('Logic Analyzer', 'Saleae 8-channel logic analyzer', 3, 3, true);

-- Insert Achievements
INSERT INTO achievements (name, description, icon) VALUES 
('First Blood', 'Completed first project', 'star'),
('Hardware Hacker', 'Approved for advanced equipment', 'cpu'),
('Peer Reviewer', 'Completed 5 evaluations', 'check-circle'),
('Bug Squasher', 'Fixed a critical issue in teams', 'bug');

-- Insert an Event
INSERT INTO events (title, description, event_date, created_by) 
VALUES ('Welcome Piscine', 'Introduction to the robotics track', NOW() + INTERVAL '7 days', 1);
