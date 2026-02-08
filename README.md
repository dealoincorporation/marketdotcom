# 🛒 Marketdotcom - Smart Shopping, Better Living

![Marketdotcom Logo](public/mrktdotcom-logo.png)

A modern, full-featured e-commerce marketplace built with Next.js, featuring advanced admin capabilities, secure payments, and an exceptional user experience.

## ✨ Features

### 🛍️ **Customer Features**
- **Browse Marketplace**: Explore products by category with advanced filtering
- **Smart Cart**: Persistent cart with real-time updates
- **Secure Checkout**: Multi-step checkout with Paystack integration
- **Order Tracking**: Real-time order status updates
- **User Authentication**: Secure login/registration with email verification
- **Wallet System**: Earn points, convert to cash, and manage balance
- **Responsive Design**: Perfect experience on all devices

### 👨‍💼 **Admin Features**
- **Product Management**: Add, edit, delete, and manage products
- **Category Management**: Organize products with custom categories
- **Order Management**: View, update, and track all orders
- **Stock Control**: Monitor and update product inventory
- **CSV Import/Export**: Bulk product management
- **Analytics Dashboard**: Revenue, orders, and product statistics
- **User Management**: Admin role assignment and user oversight

### 🎨 **Design & UX**
- **Space Grotesk Typography**: Ultra-sleek, modern font
- **Glassmorphism**: Beautiful frosted glass effects
- **Smooth Animations**: Framer Motion powered interactions
- **Dark/Light Mode Ready**: Extensible theming system
- **Accessible**: WCAG compliant components

## 🚀 Tech Stack

### **Frontend**
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form management
- **Zustand** - State management

### **Backend & Database**
- **Prisma** - ORM for MongoDB
- **MongoDB** - NoSQL database
- **NextAuth.js** - Authentication
- **bcryptjs** - Password hashing
- **UUID** - Unique identifiers

### **Payments & Email**
- **Paystack** - Payment processing
- **Resend** - Email service
- **Nodemailer** - Fallback email
- **EJS** - Email templates

### **Development Tools**
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** (Local or Atlas)
- **npm** or **yarn** package manager

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd marketdotcom
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup

Create `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="mongodb://localhost:27017/marketdotcom"
# For MongoDB Atlas: DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/marketdotcom"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_your_resend_api_key"

# Email (Gmail fallback)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"

# Paystack
PAYSTACK_PUBLIC_KEY="pk_test_your_paystack_public_key"
PAYSTACK_SECRET_KEY="sk_test_your_paystack_secret_key"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Seed the database
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

### **Core Models**
- **User**: Authentication, wallet, referrals
- **Product**: Items for sale with variations
- **Category**: Product organization
- **Order**: Customer purchases
- **CartItem**: Shopping cart items

### **Key Relationships**
- User ↔ Orders (one-to-many)
- Product ↔ Variations (one-to-many)
- Product ↔ Categories (many-to-one)
- Order ↔ OrderItems (one-to-many)

## 🔐 Authentication

### **User Roles**
- **CUSTOMER**: Regular shoppers
- **ADMIN**: Full platform access

### **Admin Setup**
```bash
# Make a user admin
node make-admin.js

# List all users
node list-users.js
```

## 🛒 API Endpoints

### **Products**
- `GET /api/products` - List products with filtering
- `GET /api/products/[id]` - Get product details
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/[id]` - Update product (Admin)
- `DELETE /api/products/[id]` - Delete product (Admin)

### **Orders**
- `GET /api/orders` - List orders (Admin)
- `POST /api/orders/create` - Create order
- `PUT /api/orders/[id]` - Update order status

### **Categories**
- `GET /api/categories` - List categories

### **Wallet**
- `GET /api/wallet` - Get wallet info
- `POST /api/wallet/fund` - Add funds

### **Auth**
- `POST /api/auth/[...nextauth]` - NextAuth routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset

## 🎨 Customization

### **Pre-seeded Categories**
The app comes with 12 pre-seeded categories:
- 🍎 Fruits
- 🥕 Vegetables
- 🌾 Grains & Cereals
- 🥩 Proteins
- 🥛 Dairy
- 🥤 Beverages
- 🍿 Snacks
- 🌿 Spices & Seasonings
- 🍞 Bakery
- 🧊 Frozen Foods
- 🥫 Canned Goods
- 🌱 Organic Products

### **Branding**
- Logo: `public/mrktdotcom-logo.png`
- Colors: Orange (#f97316) and complementary palette
- Typography: Space Grotesk for ultra-modern feel

## 📱 Usage

### **For Customers**
1. **Browse**: Explore products by category
2. **Cart**: Add items, adjust quantities
3. **Checkout**: Secure payment with Paystack
4. **Track**: Monitor order status
5. **Wallet**: Earn points, convert to cash

### **For Admins**
1. **Dashboard**: Overview of sales and products
2. **Products**: Add/edit/delete products
3. **Orders**: Manage order fulfillment
4. **Analytics**: Revenue and performance metrics
5. **Bulk Operations**: CSV import/export

## 🧪 Testing

### **Demo Credentials**
```
Email: demo@marketdotcom.com
Password: demo123
```

### **Test Scripts**
```bash
# Test database connection
node test-mongodb-connection.js

# Test email system
node test-email-system.js

# Verify environment setup
node verify-setup.js
```

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm install -g vercel
vercel --prod
```

### **Environment Variables for Production**
Ensure all environment variables are set in your hosting platform:
- Database URL (MongoDB Atlas recommended)
- NextAuth secrets
- Email service keys
- Payment provider keys

### **Build Commands**
```bash
npm run build    # Build for production
npm run start    # Start production server
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** changes: `git commit -am 'Add your feature'`
4. **Push** to branch: `git push origin feature/your-feature`
5. **Submit** a Pull Request

### **Code Style**
- TypeScript strict mode enabled
- ESLint configuration
- Prettier for formatting
- Conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Issues**
- Create an issue on GitHub
- Include error logs and steps to reproduce

### **Documentation**
- API endpoints documented above
- Component props typed with TypeScript
- Inline code comments for complex logic

---

## 🎉 Acknowledgments

Built with ❤️ using cutting-edge web technologies. Special thanks to:
- **Next.js** team for the amazing framework
- **Vercel** for hosting and deployment
- **Prisma** for database tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for components

---

**Marketdotcom** - Connecting farmers, markets, and homes with affordable, quality food—one smart shop at a time! 🌾🏠🛒
