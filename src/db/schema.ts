
import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

/** Generated vehicle history reports. */
export const reports = sqliteTable('reports', {
    id: text('id').primaryKey(),
    vin: text('vin').notNull(),
    make: text('make'),
    model: text('model'),
    year: integer('year'),
    data: text('data', { mode: 'json' }).notNull(), // Stores full raw report
    is_unlocked: integer('is_unlocked', { mode: 'boolean' }).default(false),
    order_id: text('order_id'),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

/** Customers / registered users. */
export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name'),
    role: text('role', { enum: ['customer', 'admin'] }).default('customer'),
    stripe_customer_id: text('stripe_customer_id'),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

/** Payment orders (Stripe or PayPal). */
export const orders = sqliteTable('orders', {
    id: text('id').primaryKey(),
    user_id: text('user_id'),
    email: text('email'),
    report_id: text('report_id'),
    plan_id: text('plan_id').notNull(),
    provider: text('provider', { enum: ['stripe', 'paypal'] }).notNull(),
    provider_ref: text('provider_ref'), // session id / capture id
    amount_cents: integer('amount_cents').notNull(),
    currency: text('currency').default('usd'),
    status: text('status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).default('pending'),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

/** Blog posts (keyword-driven content pipeline). */
export const posts = sqliteTable('posts', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description'),
    keyword: text('keyword'), // primary target keyword
    body: text('body').notNull(), // markdown
    cover_image: text('cover_image'),
    author: text('author').default('CarVinLookup Editorial'),
    status: text('status', { enum: ['draft', 'in_review', 'scheduled', 'published'] }).default('draft'),
    // Provenance + editorial gate — we disclose AI assistance and require human review.
    ai_assisted: integer('ai_assisted', { mode: 'boolean' }).default(true),
    reviewed_by: text('reviewed_by'),
    quality_score: real('quality_score'), // 0-100 from quality gate
    scheduled_for: text('scheduled_for'),
    published_at: text('published_at'),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

/** Keyword backlog that feeds the content pipeline. */
export const keywords = sqliteTable('keywords', {
    id: text('id').primaryKey(),
    term: text('term').notNull().unique(),
    intent: text('intent', { enum: ['informational', 'commercial', 'transactional', 'navigational'] }).default('informational'),
    priority: integer('priority').default(0),
    status: text('status', { enum: ['queued', 'drafting', 'done', 'skipped'] }).default('queued'),
    post_id: text('post_id'),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

/** First-party analytics events. */
export const events = sqliteTable('events', {
    id: text('id').primaryKey(),
    name: text('name').notNull(), // pageview, vin_search, checkout_started, purchase
    path: text('path'),
    referrer: text('referrer'),
    country: text('country'),
    meta: text('meta', { mode: 'json' }),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

/** Mutable site settings (pricing overrides, toggles) editable from admin. */
export const settings = sqliteTable('settings', {
    key: text('key').primaryKey(),
    value: text('value', { mode: 'json' }).notNull(),
    updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

/** Visitor support chat sessions — bot-first, with handoff to a human agent. */
export const chatSessions = sqliteTable('chat_sessions', {
    id: text('id').primaryKey(),
    visitor_id: text('visitor_id').notNull(),
    // bot = AI answering, waiting = human requested, live = agent active, closed = done
    status: text('status', { enum: ['bot', 'waiting', 'live', 'closed'] }).default('bot'),
    meta: text('meta', { mode: 'json' }),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    last_message_at: text('last_message_at').default(sql`CURRENT_TIMESTAMP`),
});

/** Individual messages within a chat session. */
export const chatMessages = sqliteTable('chat_messages', {
    id: text('id').primaryKey(),
    session_id: text('session_id').notNull(),
    // user = visitor, assistant = AI bot, agent = human operator, system = notices
    role: text('role', { enum: ['user', 'assistant', 'agent', 'system'] }).notNull(),
    content: text('content').notNull(),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

/** Cheap VIN-decoder results, cached by VIN (TTL enforced in app code). */
export const vinDecodes = sqliteTable('vin_decodes', {
    vin: text('vin').primaryKey(),
    data: text('data', { mode: 'json' }).notNull(),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

/** Per-IP rate-limit counters (anti-scrape for the free preview). */
export const rateLimits = sqliteTable('rate_limits', {
    key: text('key').primaryKey(),
    hits: integer('hits').default(0),
    window_start: text('window_start').default(sql`CURRENT_TIMESTAMP`),
});

/** Contact-form submissions, triaged from the admin inbox. */
export const contactMessages = sqliteTable('contact_messages', {
    id: text('id').primaryKey(),
    name: text('name'),
    email: text('email').notNull(),
    subject: text('subject'),
    message: text('message').notNull(),
    status: text('status', { enum: ['new', 'read', 'replied'] }).default('new'),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
