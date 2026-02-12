import { NextResponse } from 'next/server';
import getDb, { generateId } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
    try {
        const db = getDb();
        const password = await bcrypt.hash('demo123', 10);

        // Create demo sellers with full profiles
        const sellers = [
            { id: generateId(), name: 'Alex Chen', email: 'alex@zervix.com', bio: 'Senior Fullstack Developer with 8+ years of experience building SaaS platforms, AI integrations, and scalable architectures. Specialized in Next.js, React, and cloud infrastructure.', skills: JSON.stringify(['Next.js', 'React', 'Node.js', 'AI/ML', 'AWS']), languages: JSON.stringify(['English', 'Mandarin']), country: 'United States', level: 'TOP_RATED' },
            { id: generateId(), name: 'Sarah Johnson', email: 'sarah@zervix.com', bio: 'Award-winning brand designer crafting premium visual identities for startups and enterprises. 3D design specialist with a passion for creating immersive brand experiences.', skills: JSON.stringify(['Branding', '3D Design', 'Logo Design', 'UI/UX']), languages: JSON.stringify(['English', 'French']), country: 'United Kingdom', level: 'LEVEL_2' },
            { id: generateId(), name: 'DevFlow Studio', email: 'devflow@zervix.com', bio: 'A team of 5 fullstack developers delivering enterprise-grade e-commerce solutions. We build everything from payment integrations to inventory systems.', skills: JSON.stringify(['E-commerce', 'Shopify', 'React', 'Python', 'PostgreSQL']), languages: JSON.stringify(['English', 'Spanish']), country: 'Canada', level: 'TOP_RATED' },
            { id: generateId(), name: 'NeuralLabs AI', email: 'neural@zervix.com', bio: 'AI research lab turned freelance studio. We fine-tune LLMs, build custom AI pipelines, and create intelligent automation for businesses of all sizes.', skills: JSON.stringify(['GPT', 'LLM Fine-tuning', 'Python', 'TensorFlow', 'Computer Vision']), languages: JSON.stringify(['English', 'German']), country: 'Germany', level: 'LEVEL_2' },
            { id: generateId(), name: 'Visio Media', email: 'visio@zervix.com', bio: 'Cinematic motion graphics and 3D visualization studio. Creating showreels, product renders, and branded video content that captivates audiences.', skills: JSON.stringify(['After Effects', 'Cinema 4D', 'Blender', 'Video Editing']), languages: JSON.stringify(['English', 'Hindi']), country: 'India', level: 'LEVEL_1' },
            { id: generateId(), name: 'CloudMaster', email: 'cloud@zervix.com', bio: 'DevOps engineer and cloud architect with expertise in Kubernetes, CI/CD, and infrastructure automation. Making your deployments bulletproof.', skills: JSON.stringify(['AWS', 'GCP', 'Kubernetes', 'Docker', 'Terraform']), languages: JSON.stringify(['English']), country: 'Australia', level: 'LEVEL_2' },
        ];

        const insertUser = db.prepare(
            'INSERT OR IGNORE INTO users (id, name, email, password, isSeller, role, bio, skills, languages, country, sellerLevel, responseTime, completedOrders) VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        for (const s of sellers) {
            insertUser.run(s.id, s.name, s.email, password, 'SELLER', s.bio, s.skills, s.languages, s.country, s.level, Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 200) + 20);
        }

        // Create demo buyers
        const buyers = [
            { id: generateId(), name: 'Demo Buyer', email: 'buyer@zervix.com' },
            { id: generateId(), name: 'Jane Smith', email: 'jane@zervix.com' },
            { id: generateId(), name: 'Mark Taylor', email: 'mark@zervix.com' },
        ];

        const insertBuyer = db.prepare(
            'INSERT OR IGNORE INTO users (id, name, email, password, isSeller, role, country) VALUES (?, ?, ?, ?, 0, ?, ?)'
        );

        for (const b of buyers) {
            insertBuyer.run(b.id, b.name, b.email, password, 'BUYER', 'United States');
        }

        // Create gigs with full details
        const gigs = [
            { title: 'Bespoke Next.js SaaS Architecture', desc: 'I will architect and develop a premium, production-ready SaaS platform using Next.js 14, Prisma, and modern AI integrations. Includes custom design system, auth flows, and scalable backend.', category: 'Web Development', subcategory: 'Fullstack', tags: ['Next.js', 'SaaS', 'React', 'Prisma', 'AI'], price: 950, location: 'San Francisco, USA', seller: 0, faq: [{ q: 'What tech stack do you use?', a: 'Next.js 14, TypeScript, Prisma, PostgreSQL, and Tailwind CSS.' }, { q: 'Do you offer ongoing support?', a: 'Yes, all Premium tier orders include 30 days of post-delivery support.' }], requirements: ['Project brief or wireframes', 'Brand guidelines (if any)', 'Access to any existing codebase'] },
            { title: 'Premium 3D Brand Identity System', desc: 'Complete brand identity package including 3D logo, style guide, business cards, and social media kit with iridescent effects. Stand out from the crowd with a truly unique visual identity.', category: 'Graphic Design', subcategory: 'Branding', tags: ['Branding', '3D Logo', 'Identity', 'Style Guide'], price: 1200, location: 'London, UK', seller: 1, faq: [{ q: 'How many logo concepts?', a: 'Basic: 2 concepts, Standard: 4 concepts, Premium: unlimited until you\'re satisfied.' }], requirements: ['Company name and tagline', 'Industry and target audience', 'Color preferences'] },
            { title: 'Fullstack E-commerce Engine', desc: 'Complete e-commerce solution with payment processing (Stripe), inventory management, analytics dashboard, and admin panel. Ready to launch and scale.', category: 'Web Development', subcategory: 'E-commerce', tags: ['E-commerce', 'Stripe', 'React', 'Node.js', 'MongoDB'], price: 1500, location: 'Toronto, Canada', seller: 2, faq: [{ q: 'Which payment gateways?', a: 'Stripe by default. PayPal and Square available as add-ons.' }], requirements: ['Product catalog (or sample data)', 'Business requirements document'] },
            { title: 'AI-Powered Content Platform', desc: 'Custom AI content generation platform with GPT integration, content scheduling, and multi-channel publishing. Automate your content workflow end-to-end.', category: 'AI Services', subcategory: 'AI Development', tags: ['AI', 'GPT', 'Content', 'Automation', 'Python'], price: 2200, location: 'Berlin, Germany', seller: 3, faq: [{ q: 'Which AI models?', a: 'GPT-4, Claude, or open-source models like Llama — your choice.' }], requirements: ['Use case description', 'Sample content for fine-tuning', 'API keys for AI providers'] },
            { title: 'Cinematic Motion Graphics Showreel', desc: 'I will create professional motion graphics package for your brand including intro, outro, lower thirds, transitions, and a complete showreel.', category: 'Video & Animation', subcategory: 'Motion Graphics', tags: ['Motion Graphics', 'After Effects', 'Animation', 'Video'], price: 800, location: 'Mumbai, India', seller: 4, faq: [{ q: 'What format do you deliver?', a: 'MP4, MOV, and After Effects project files.' }], requirements: ['Brand assets (logo, colors)', 'Reference videos or style preferences'] },
            { title: 'Cloud-Native Infrastructure Setup', desc: 'Complete AWS/GCP infrastructure setup with Kubernetes, CI/CD pipelines, monitoring, auto-scaling, and security hardening. Enterprise-grade from day one.', category: 'Programming & Tech', subcategory: 'DevOps', tags: ['AWS', 'Kubernetes', 'DevOps', 'CI/CD', 'Docker'], price: 3000, location: 'Sydney, Australia', seller: 5, faq: [{ q: 'Which cloud providers?', a: 'AWS and GCP. Azure available on request.' }], requirements: ['Current infrastructure details', 'Traffic/load expectations', 'Compliance requirements'] },
            { title: 'Mobile App UI/UX Design', desc: 'Premium mobile app design with interactive prototypes in Figma, micro-animations, design tokens, and developer-ready handoff files. iOS and Android.', category: 'Graphic Design', subcategory: 'App Design', tags: ['UI/UX', 'Mobile', 'Figma', 'iOS', 'Android'], price: 1800, location: 'Tokyo, Japan', seller: 1, faq: [{ q: 'Which design tool?', a: 'Figma for design and prototyping. Can also deliver Sketch files.' }], requirements: ['App concept or wireframes', 'Target platform (iOS/Android/Both)', 'Feature list'] },
            { title: 'Custom GPT Fine-Tuning Service', desc: 'Fine-tune GPT models on your proprietary data for domain-specific AI assistants, chatbots, and content generators. Includes evaluation and deployment.', category: 'AI Services', subcategory: 'Machine Learning', tags: ['GPT', 'Fine-tuning', 'LLM', 'NLP', 'ChatBot'], price: 2500, location: 'San Francisco, USA', seller: 3, faq: [{ q: 'How much data do I need?', a: 'Minimum 100 examples for basic fine-tuning. 1000+ recommended for best results.' }], requirements: ['Training data in JSON/CSV format', 'Use case description', 'Desired output format'] },
            { title: 'Professional 3D Product Renders', desc: 'Photorealistic 3D product renders for e-commerce, marketing campaigns, and social media. Includes 360° turntable animations and lifestyle scenes.', category: 'Video & Animation', subcategory: '3D Rendering', tags: ['3D Render', 'Product Visualization', 'Blender', 'Cinema 4D'], price: 650, location: 'Amsterdam, Netherlands', seller: 4, faq: [{ q: 'What file formats?', a: 'PNG, JPEG, TIFF for stills. MP4 for animations. 3D source files available in Premium tier.' }], requirements: ['Product photos or CAD files', 'Desired angles and backgrounds', 'Brand color palette'] },
            { title: 'SEO-Optimized Blog Content Writing', desc: 'I will write engaging, SEO-optimized blog posts and articles for your website. Includes keyword research, meta descriptions, and internal linking strategy.', category: 'Writing & Translation', subcategory: 'Content Writing', tags: ['SEO', 'Blog', 'Content Writing', 'Copywriting'], price: 150, location: 'London, UK', seller: 1, faq: [{ q: 'How long are the articles?', a: 'Basic: 800 words, Standard: 1500 words, Premium: 3000+ words.' }], requirements: ['Topic or keyword list', 'Target audience', 'Brand voice guidelines'] },
            { title: 'Social Media Marketing Strategy', desc: 'Comprehensive social media strategy with content calendar, ad campaign setup, audience targeting, and performance analytics across Instagram, TikTok, and LinkedIn.', category: 'Digital Marketing', subcategory: 'Social Media', tags: ['Social Media', 'Marketing', 'Instagram', 'TikTok', 'Ads'], price: 500, location: 'New York, USA', seller: 2, faq: [{ q: 'Which platforms?', a: 'Instagram, TikTok, LinkedIn, Twitter/X, and Facebook.' }], requirements: ['Current social media accounts', 'Business goals', 'Target demographics'] },
            { title: 'Professional Voice Over for Videos', desc: 'Studio-quality voice over recording for commercials, explainer videos, podcasts, and audiobooks. Multiple languages available with fast turnaround.', category: 'Music & Audio', subcategory: 'Voice Over', tags: ['Voice Over', 'Audio', 'Narration', 'Commercial'], price: 200, location: 'Los Angeles, USA', seller: 4, faq: [{ q: 'What languages?', a: 'English, Hindi, Spanish, and French.' }], requirements: ['Script or text to record', 'Reference audio for tone/style', 'Desired format (MP3, WAV)'] },
        ];

        const insertGig = db.prepare(
            'INSERT INTO gigs (id, title, description, category, subcategory, tags, price, location, faq, requirements, sellerId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        const insertTier = db.prepare(
            'INSERT INTO gig_tiers (id, name, title, description, price, delivery, revisions, features, gigId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        const insertReview = db.prepare(
            'INSERT INTO reviews (id, rating, communicationRating, serviceRating, recommendRating, comment, userId, gigId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        const reviewComments = [
            'Absolutely outstanding work! Exceeded all expectations. Will definitely be ordering again.',
            'Very professional and responsive. Delivered ahead of schedule with exceptional quality.',
            'Top-notch quality and great communication throughout the project. Highly recommended!',
            'Incredible attention to detail. The final product was even better than I imagined.',
            'Fast delivery, great communication, and the result speaks for itself. 5 stars!',
        ];

        const gigIds: string[] = [];

        for (const gig of gigs) {
            const gigId = generateId();
            gigIds.push(gigId);
            insertGig.run(gigId, gig.title, gig.desc, gig.category, gig.subcategory, JSON.stringify(gig.tags), gig.price, gig.location, JSON.stringify(gig.faq), JSON.stringify(gig.requirements), sellers[gig.seller].id);

            // Add 3 tiers per gig
            insertTier.run(generateId(), 'Basic', `${gig.category} Starter`, 'Essential package with core deliverables.', gig.price, 5, 1, JSON.stringify(['Core Deliverable', 'Source Files', '1 Revision']), gigId);
            insertTier.run(generateId(), 'Standard', `${gig.category} Pro`, 'Enhanced package with premium features.', Math.round(gig.price * 1.8), 10, 3, JSON.stringify(['Everything in Basic', 'Premium Features', '3 Revisions', 'Documentation', 'Priority Support']), gigId);
            insertTier.run(generateId(), 'Premium', `${gig.category} Enterprise`, 'Complete enterprise-grade solution.', Math.round(gig.price * 3.2), 21, -1, JSON.stringify(['Everything in Standard', 'Unlimited Revisions', 'Deployment/Launch', '30-Day Support', 'Source Code Ownership']), gigId);

            // Add reviews
            const numReviews = Math.floor(Math.random() * 4) + 2;
            for (let i = 0; i < numReviews; i++) {
                const rating = Math.random() > 0.2 ? 5 : 4;
                const buyerIdx = Math.floor(Math.random() * buyers.length);
                insertReview.run(generateId(), rating, rating, rating, rating, reviewComments[Math.floor(Math.random() * reviewComments.length)], buyers[buyerIdx].id, gigId);
            }
        }

        // Create some demo orders
        const insertOrder = db.prepare(
            'INSERT INTO orders (id, status, total, tierName, buyerId, sellerId, gigId, deliveryDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        insertOrder.run(generateId(), 'COMPLETED', 950, 'Basic', buyers[0].id, sellers[0].id, gigIds[0], '2026-02-20');
        insertOrder.run(generateId(), 'ACTIVE', 2160, 'Standard', buyers[0].id, sellers[1].id, gigIds[1], '2026-02-25');
        insertOrder.run(generateId(), 'PENDING', 1500, 'Basic', buyers[1].id, sellers[2].id, gigIds[2], '2026-03-01');

        // Create demo conversations
        const convId = generateId();
        db.prepare('INSERT INTO conversations (id, user1Id, user2Id, lastMessage, lastMessageAt) VALUES (?, ?, ?, ?, datetime("now"))').run(convId, buyers[0].id, sellers[0].id, 'Thanks! Looking forward to working on this.');

        const insertMsg = db.prepare('INSERT INTO messages (id, conversationId, senderId, content, isRead) VALUES (?, ?, ?, ?, ?)');
        insertMsg.run(generateId(), convId, buyers[0].id, 'Hi Alex! I\'m interested in your Next.js SaaS Architecture service. Can you handle a multi-tenant setup?', 1);
        insertMsg.run(generateId(), convId, sellers[0].id, 'Absolutely! Multi-tenant architecture is one of my specialties. I\'d recommend the Standard or Premium tier for that level of complexity.', 1);
        insertMsg.run(generateId(), convId, buyers[0].id, 'Great, I\'ll go with the Standard tier. What do you need from me to get started?', 1);
        insertMsg.run(generateId(), convId, sellers[0].id, 'Thanks! Looking forward to working on this.', 0);

        // Create notifications
        const insertNotif = db.prepare('INSERT INTO notifications (id, userId, type, title, message, link) VALUES (?, ?, ?, ?, ?, ?)');
        insertNotif.run(generateId(), buyers[0].id, 'ORDER', 'Order Placed', 'Your order for "Bespoke Next.js SaaS Architecture" has been placed.', '/orders');
        insertNotif.run(generateId(), buyers[0].id, 'MESSAGE', 'New Message', 'Alex Chen sent you a message.', '/messages');
        insertNotif.run(generateId(), sellers[0].id, 'ORDER', 'New Order', 'You received a new order for "Bespoke Next.js SaaS Architecture"!', '/orders');

        // Create a buyer request
        db.prepare('INSERT INTO buyer_requests (id, title, description, category, budget, deliveryDays, buyerId) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
            generateId(), 'Need a Custom CRM Dashboard', 'Looking for an experienced developer to build a custom CRM dashboard with analytics, contact management, and email integration. Must be built with React/Next.js.', 'Web Development', 3000, 14, buyers[1].id
        );

        return NextResponse.json({
            message: 'Database seeded successfully!',
            data: { sellers: sellers.length, buyers: buyers.length, gigs: gigs.length, orders: 3, conversations: 1, notifications: 3 }
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
