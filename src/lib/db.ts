import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db');

let db: Database.Database;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      image TEXT,
      isSeller INTEGER DEFAULT 0,
      role TEXT DEFAULT 'BUYER',
      bio TEXT DEFAULT '',
      skills TEXT DEFAULT '[]',
      languages TEXT DEFAULT '[]',
      country TEXT DEFAULT '',
      sellerLevel TEXT DEFAULT 'NEW',
      responseTime INTEGER DEFAULT 0,
      completedOrders INTEGER DEFAULT 0,
      ongoingOrders INTEGER DEFAULT 0,
      memberSince TEXT DEFAULT (datetime('now')),
      lastActive TEXT DEFAULT (datetime('now')),
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );
    `);

  // Migrations for users
  const userColumns = [
    'ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ""',
    'ALTER TABLE users ADD COLUMN skills TEXT DEFAULT "[]"',
    'ALTER TABLE users ADD COLUMN languages TEXT DEFAULT "[]"',
    'ALTER TABLE users ADD COLUMN country TEXT DEFAULT ""',
    'ALTER TABLE users ADD COLUMN sellerLevel TEXT DEFAULT "NEW"',
    'ALTER TABLE users ADD COLUMN responseTime INTEGER DEFAULT 0',
    'ALTER TABLE users ADD COLUMN completedOrders INTEGER DEFAULT 0',
    'ALTER TABLE users ADD COLUMN ongoingOrders INTEGER DEFAULT 0'
  ];
  userColumns.forEach(sql => { try { db.exec(sql); } catch (e) { } });

  db.exec(`
    CREATE TABLE IF NOT EXISTS gigs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      price REAL NOT NULL,
      location TEXT,
      image TEXT,
      gallery TEXT DEFAULT '[]',
      faq TEXT DEFAULT '[]',
      requirements TEXT DEFAULT '[]',
      status TEXT DEFAULT 'ACTIVE',
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      ordersCount INTEGER DEFAULT 0,
      sellerId TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (sellerId) REFERENCES users(id)
    );
    `);

  // Migrations for gigs
  const gigColumns = [
    'ALTER TABLE gigs ADD COLUMN subcategory TEXT DEFAULT ""',
    'ALTER TABLE gigs ADD COLUMN tags TEXT DEFAULT "[]"',
    'ALTER TABLE gigs ADD COLUMN gallery TEXT DEFAULT "[]"',
    'ALTER TABLE gigs ADD COLUMN faq TEXT DEFAULT "[]"',
    'ALTER TABLE gigs ADD COLUMN requirements TEXT DEFAULT "[]"',
    'ALTER TABLE gigs ADD COLUMN status TEXT DEFAULT "ACTIVE"',
    'ALTER TABLE gigs ADD COLUMN impressions INTEGER DEFAULT 0',
    'ALTER TABLE gigs ADD COLUMN clicks INTEGER DEFAULT 0',
    'ALTER TABLE gigs ADD COLUMN ordersCount INTEGER DEFAULT 0'
  ];
  gigColumns.forEach(sql => { try { db.exec(sql); } catch (e) { } });

  db.exec(`
    CREATE TABLE IF NOT EXISTS gig_tiers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT DEFAULT '',
      description TEXT DEFAULT '',
      price REAL NOT NULL,
      delivery INTEGER NOT NULL,
      revisions INTEGER DEFAULT 1,
      features TEXT NOT NULL,
      gigId TEXT NOT NULL,
      FOREIGN KEY (gigId) REFERENCES gigs(id) ON DELETE CASCADE
    );
    `);

  // Migrations for tiers
  const tierColumns = [
    'ALTER TABLE gig_tiers ADD COLUMN title TEXT DEFAULT ""',
    'ALTER TABLE gig_tiers ADD COLUMN description TEXT DEFAULT ""',
    'ALTER TABLE gig_tiers ADD COLUMN revisions INTEGER DEFAULT 1'
  ];
  tierColumns.forEach(sql => { try { db.exec(sql); } catch (e) { } });

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      status TEXT DEFAULT 'PENDING',
      total REAL NOT NULL,
      serviceFee REAL DEFAULT 0,
      tierId TEXT,
      tierName TEXT DEFAULT 'Basic',
      deliveryDate TEXT,
      requirements TEXT DEFAULT '',
      sellerNote TEXT DEFAULT '',
      buyerId TEXT NOT NULL,
      sellerId TEXT NOT NULL DEFAULT '',
      gigId TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      completedAt TEXT,
      FOREIGN KEY (buyerId) REFERENCES users(id),
      FOREIGN KEY (gigId) REFERENCES gigs(id)
    );
    `);

  // Migrations for orders
  const orderColumns = [
    'ALTER TABLE orders ADD COLUMN serviceFee REAL DEFAULT 0',
    'ALTER TABLE orders ADD COLUMN tierId TEXT',
    'ALTER TABLE orders ADD COLUMN tierName TEXT DEFAULT "Basic"',
    'ALTER TABLE orders ADD COLUMN deliveryDate TEXT',
    'ALTER TABLE orders ADD COLUMN requirements TEXT DEFAULT ""',
    'ALTER TABLE orders ADD COLUMN sellerNote TEXT DEFAULT ""',
    'ALTER TABLE orders ADD COLUMN sellerId TEXT NOT NULL DEFAULT ""',
    'ALTER TABLE orders ADD COLUMN completedAt TEXT'
  ];
  orderColumns.forEach(sql => { try { db.exec(sql); } catch (e) { } });

  db.exec(`
    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      message TEXT NOT NULL,
      files TEXT DEFAULT '[]',
      status TEXT DEFAULT 'PENDING',
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (orderId) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS revisions (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      message TEXT NOT NULL,
      buyerId TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (orderId) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      rating INTEGER NOT NULL,
      communicationRating INTEGER DEFAULT 5,
      serviceRating INTEGER DEFAULT 5,
      recommendRating INTEGER DEFAULT 5,
      comment TEXT NOT NULL,
      sellerResponse TEXT DEFAULT '',
      orderId TEXT,
      userId TEXT NOT NULL,
      gigId TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (gigId) REFERENCES gigs(id)
    );
    
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user1Id TEXT NOT NULL,
      user2Id TEXT NOT NULL,
      lastMessage TEXT DEFAULT '',
      lastMessageAt TEXT DEFAULT (datetime('now')),
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user1Id) REFERENCES users(id),
      FOREIGN KEY (user2Id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversationId TEXT NOT NULL,
      senderId TEXT NOT NULL,
      content TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      attachments TEXT DEFAULT '[]',
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (conversationId) REFERENCES conversations(id),
      FOREIGN KEY (senderId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      gigId TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (gigId) REFERENCES gigs(id),
      UNIQUE(userId, gigId)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT DEFAULT '',
      isRead INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS buyer_requests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      budget REAL NOT NULL,
      deliveryDays INTEGER DEFAULT 7,
      attachments TEXT DEFAULT '[]',
      status TEXT DEFAULT 'OPEN',
      buyerId TEXT NOT NULL,
      offersCount INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (buyerId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS custom_offers (
      id TEXT PRIMARY KEY,
      requestId TEXT,
      buyerId TEXT NOT NULL,
      sellerId TEXT NOT NULL,
      gigId TEXT,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      deliveryDays INTEGER NOT NULL,
      revisions INTEGER DEFAULT 1,
      status TEXT DEFAULT 'PENDING',
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (buyerId) REFERENCES users(id),
      FOREIGN KEY (sellerId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      userId TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (orderId) REFERENCES orders(id)
    );
  `);

}

export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function createNotification(userId: string, type: string, title: string, message: string, link: string = '') {
  const db = getDb();
  db.prepare(
    'INSERT INTO notifications (id, userId, type, title, message, link) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(generateId(), userId, type, title, message, link);
}

export default getDb;
