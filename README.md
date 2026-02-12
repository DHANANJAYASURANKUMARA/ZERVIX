# Zervix — Premium Digital Marketplace

The world's first premium digital marketplace for fullstack experts and high-end digital assets, built with **Next.js 15**, **React 19**, **Prisma**, and **Better-SQLite3**.

## Features

- **Midnight Aurora Theme**: Premium glassmorphism UI with "alive" mesh gradients.
- **Freelance Marketplace**: Gig creation, search, filtering, and reviews.
- **Order System**: Full lifecycle management (Active -> Delivered -> Revision -> Complete).
- **Messaging**: Real-time inbox with custom offers.
- **Seller Tools**: Dashboard, earnings tracking, and analytics.
- **Buyer Tools**: Project requests, favorites, and order history.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite (via `better-sqlite3`) + Prisma ORM
- **styling**: CSS Variables + Glassmorphism utilities
- **Auth**: NextAuth.js

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database**:
   ```bash
   npx prisma db push
   node src/lib/seed.js # Optional: Seed with demo data
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## License

MIT
