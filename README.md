# Inventory Billing System

A modern, full-stack inventory and billing management system for businesses. Built with Next.js, Prisma, MySQL, and Tailwind CSS.

---

## 🚀 Features
- User authentication (NextAuth.js)
- Product management (CRUD)
- Customer management (CRUD)
- Bill/invoice creation and management
- Real-time analytics dashboard
- Low stock alerts
- Responsive UI (light & dark mode)
- Toast notifications and error handling
- Search, filter, and pagination

---

## 🛠️ Technologies & Languages Used
- **Next.js** (React, TypeScript)
- **Prisma ORM**
- **MySQL** (database)
- **Tailwind CSS** (styling)
- **next-auth** (authentication)
- **Lucide Icons**
- **date-fns** (date utilities)

---

## ⚡ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/inventory-billing-system.git
   cd inventory-billing-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your MySQL database credentials and NextAuth secrets.

4. **Set up the database:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   # (Optional) Seed sample data:
   npm run seed
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
MIT 