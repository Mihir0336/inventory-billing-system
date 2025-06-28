-- Create database tables
-- This script will be automatically executed by Prisma

-- Users table for authentication
CREATE TABLE IF NOT EXISTS `User` (
    id VARCHAR(191) PRIMARY KEY,
    name VARCHAR(191),
    email VARCHAR(191) UNIQUE NOT NULL,
    password VARCHAR(191),
    emailVerified DATETIME(3),
    image VARCHAR(191),
    role ENUM('ADMIN', 'STAFF') NOT NULL DEFAULT 'STAFF',
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL
);

-- Products table for inventory management
CREATE TABLE IF NOT EXISTS `Product` (
    id VARCHAR(191) PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    description VARCHAR(191),
    sku VARCHAR(191) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    minStock INT NOT NULL DEFAULT 10,
    category VARCHAR(191) NOT NULL,
    image VARCHAR(191),
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL
);

-- Customers table
CREATE TABLE IF NOT EXISTS `Customer` (
    id VARCHAR(191) PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    email VARCHAR(191),
    phone VARCHAR(191),
    address VARCHAR(191),
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL
);

-- Bills table for invoicing
CREATE TABLE IF NOT EXISTS `Bill` (
    id VARCHAR(191) PRIMARY KEY,
    billNumber VARCHAR(191) UNIQUE NOT NULL,
    customerId VARCHAR(191),
    userId VARCHAR(191) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL,
    FOREIGN KEY (customerId) REFERENCES `Customer`(id),
    FOREIGN KEY (userId) REFERENCES `User`(id)
);

-- Bill items table
CREATE TABLE IF NOT EXISTS `BillItem` (
    id VARCHAR(191) PRIMARY KEY,
    billId VARCHAR(191) NOT NULL,
    productId VARCHAR(191) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (billId) REFERENCES `Bill`(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES `Product`(id)
);

-- Insert sample data
INSERT INTO `Product` (id, name, description, sku, price, cost, stock, minStock, category, createdAt, updatedAt) VALUES
('prod1', 'Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 'ELE-WH001', 99.99, 60.00, 50, 10, 'Electronics', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('prod2', 'Gaming Mouse', 'Ergonomic gaming mouse with RGB lighting', 'ELE-GM002', 49.99, 25.00, 75, 15, 'Electronics', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('prod3', 'Coffee Mug', 'Ceramic coffee mug with company logo', 'HOM-CM003', 12.99, 5.00, 100, 20, 'Home & Garden', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('prod4', 'Bluetooth Speaker', 'Portable bluetooth speaker with bass boost', 'ELE-BS004', 79.99, 45.00, 30, 10, 'Electronics', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('prod5', 'Notebook Set', 'Set of 3 premium notebooks', 'BOO-NS005', 24.99, 12.00, 80, 25, 'Books', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));

-- Insert sample customers
INSERT INTO `Customer` (id, name, email, phone, address, createdAt, updatedAt) VALUES
('cust1', 'John Smith', 'john.smith@email.com', '+1-555-0123', '123 Main St, City, State 12345', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('cust2', 'Sarah Johnson', 'sarah.j@email.com', '+1-555-0124', '456 Oak Ave, City, State 12346', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('cust3', 'Mike Wilson', 'mike.wilson@email.com', '+1-555-0125', '789 Pine Rd, City, State 12347', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));
