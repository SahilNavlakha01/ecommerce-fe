# NS Collection - Luxury Jewelry E-Commerce Platform

A modern, production-ready Next.js e-commerce platform for luxury jewelry with advanced features including real-time inventory, bulk product management, and seamless checkout experience.

## 🚀 Features

- **Modern Tech Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **State Management**: Redux Toolkit for efficient state handling
- **Authentication**: Secure customer and admin authentication
- **Product Management**: Advanced filtering, search, and bulk upload capabilities
- **Shopping Experience**: Cart, wishlist, and seamless checkout
- **Admin Dashboard**: Comprehensive product, order, and user management
- **Responsive Design**: Mobile-first approach with beautiful UI
- **Performance Optimized**: Image optimization, code splitting, and lazy loading
- **SEO Ready**: Meta tags, structured data, and sitemap generation

## 📋 Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd JwelleryFronted
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration.

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 📦 Build & Deploy

### Production Build
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── account/           # User account pages
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── products/          # Product pages
│   └── shop/              # Shop/catalog page
├── components/            # Reusable components
│   ├── navbar/           # Navigation components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── redux/                # Redux store and slices
├── Services/             # API service layer
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## 🔧 API Integration

Follow the API integration pattern:

1. **Register route** in `src/Constant/Api.ts`
2. **Create service function** in `src/Services/PostService.jsx` or `GetService.jsx`
3. **Use in components** with proper error handling

Example:
```typescript
import { GetAllProducts } from '@/Services/GetService';

const products = await GetAllProducts();
```

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Theme**: Luxury color palette in `tailwind.config.js`
- **Responsive**: Mobile-first design approach
- **Dark Mode Ready**: Theme configuration available

## 🔐 Environment Variables

See `.env.example` for required environment variables.

## 📱 Key Pages

- **Home** (`/`): Landing page with featured products
- **Shop** (`/shop`): Product catalog with filters
- **Product Detail** (`/products/[id]`): Individual product page
- **Cart** (`/cart`): Shopping cart
- **Checkout** (`/checkout`): Order placement
- **Account** (`/account`): User dashboard
- **Admin** (`/admin`): Admin panel (protected)

## 🧪 Testing

Run type checking before deployment:
```bash
npm run type-check
```

## 🚀 Performance Optimizations

- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Bundle size optimization
- Server-side rendering (SSR) for SEO
- Static generation where applicable

## 📄 License

Private - All rights reserved

## 👥 Support

For support, contact the development team.

---

**Built with ❤️ using Next.js**
