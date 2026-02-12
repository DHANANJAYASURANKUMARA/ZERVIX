# Zervix — Premium Digital Marketplace

The world's first premium digital marketplace for fullstack experts and high-end digital assets, built with **Next.js 15**, **React 19**, **Prisma**, and **PostgreSQL**.

## Features

- **Midnight Aurora Theme**: Premium glassmorphism UI with "alive" mesh gradients.
- **Freelance Marketplace**: Gig creation, search, filtering, and reviews.
- **Order System**: Full lifecycle management (Active -> Delivered -> Revision -> Complete).
- **Messaging**: Real-time inbox with custom offers.
- **Seller Tools**: Dashboard, earnings tracking, and analytics.
- **Buyer Tools**: Project requests, favorites, and order history.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Prisma ORM)
- **Styling**: Vanilla CSS + Advanced Glassmorphism
- **Auth**: NextAuth.js

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Database Setup**:
   Create a `.env` file with your `DATABASE_URL` (PostgreSQL) and run:
   ```bash
   npx prisma db push
   ```

3. **Demo Data**:
   Populate your database with sample data by calling the seed API:
   - Method: `POST`
   - URL: `/api/seed`

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Deployment

This project is optimized for **Vercel**. Connect your GitHub repository to Vercel and ensure the following environment variables are set:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `NEXTAUTH_SECRET`: A secure key for authentication.
- `NEXTAUTH_URL`: Your production URL.

## License

MIT
