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

# [ADDED FEATURES]
- Company profile management (set and update company name and business details)
- User roles & permissions (Admin and Staff roles)
- User profile management (edit profile, view account status, manage personal details)
- Account security (change password, enable two-factor authentication, manage active sessions)
- Activity log (view recent account activities)
- Notification preferences (email, SMS, and in-app notifications for low stock, new orders, etc.)
- Data management (import/export data, automatic daily backups)
- Integrations UI (Google Analytics, Stripe Payments, Email Service integration points)
- Customizable settings (currency, timezone, language, appearance)
- Session management (view and manage active login sessions)
- Enhanced UI/UX (animated transitions, glassmorphism, gradients, responsive sidebar)
- Recent transactions & top products analytics
- System status indicator (sidebar visual indicator)

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