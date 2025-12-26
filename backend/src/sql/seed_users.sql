USE laptopcu;

-- Admin user with bcrypt hashed password (admin123)
-- Hash: $2a$12$8qJ5K6L7mN8oP9qR2sT3uew5vX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP
INSERT IGNORE INTO users (email, ten, mat_khau, vai_tro, dien_thoai, dia_chi) 
VALUES ('admin@gmail.com', 'Admin', '$2a$12$8qJ5K6L7mN8oP9qR2sT3uew5vX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP', 'admin', '0363547545', 'Admin Address');