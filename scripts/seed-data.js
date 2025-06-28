const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedData() {
  try {
    console.log('Starting to seed data...')

    // Create sample customers
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: '123 Main St, City, State 12345'
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1234567891',
          address: '456 Oak Ave, City, State 12345'
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          phone: '+1234567892',
          address: '789 Pine Rd, City, State 12345'
        }
      })
    ])

    console.log('Created customers:', customers.length)

    // Create sample products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: 'Laptop',
          description: 'High-performance laptop',
          sku: 'LAPTOP-001',
          price: 999.99,
          cost: 700.00,
          stock: 50,
          minStock: 10,
          category: 'Electronics'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Mouse',
          description: 'Wireless mouse',
          sku: 'MOUSE-001',
          price: 29.99,
          cost: 15.00,
          stock: 100,
          minStock: 20,
          category: 'Electronics'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Keyboard',
          description: 'Mechanical keyboard',
          sku: 'KEYBOARD-001',
          price: 89.99,
          cost: 45.00,
          stock: 75,
          minStock: 15,
          category: 'Electronics'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Monitor',
          description: '24-inch LED monitor',
          sku: 'MONITOR-001',
          price: 199.99,
          cost: 120.00,
          stock: 30,
          minStock: 5,
          category: 'Electronics'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Headphones',
          description: 'Noise-cancelling headphones',
          sku: 'HEADPHONES-001',
          price: 149.99,
          cost: 80.00,
          stock: 60,
          minStock: 12,
          category: 'Electronics'
        }
      })
    ])

    console.log('Created products:', products.length)

    console.log('Data seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedData() 