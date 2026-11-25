
import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

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
    // PBKDF2-HMAC-SHA256 verifier, stored as `salt$hash` (Web Crypto, edge-safe).
    // Null for accounts created without a password (e.g. future OAuth/magic-link).
    password_hash: text('password_hash'),
    email_verified: integer('email_verified', { mode: 'boolean' }).default(false),
    stripe_customer_id: text('stripe_customer_id'),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
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
}, (t) => ({
    emailIdx: index('orders_email_idx').on(t.email),
    userIdx: index('orders_user_id_idx').on(t.user_id),
}));

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

/** Keyword backlog that feeds the content pipeline. `candidate` = discovered by
 *  DataForSEO, awaiting admin review; `queued` = approved, eligible for drafting. */
export const keywords = sqliteTable('keywords', {
    id: text('id').primaryKey(),
    term: text('term').notNull().unique(),
    intent: text('intent', { enum: ['informational', 'commercial', 'transactional', 'navigational'] }).default('informational'),
    priority: integer('priority').default(0), // opportunity score (volume vs difficulty)
    status: text('status', { enum: ['candidate', 'queued', 'drafting', 'done', 'skipped'] }).default('queued'),
    // DataForSEO metrics (null for manually-added terms).
    search_volume: integer('search_volume'),
    difficulty: integer('difficulty'), // 0-100 keyword difficulty
    cpc: real('cpc'),
    source: text('source'), // e.g. 'manual', 'dataforseo:ideas', 'dataforseo:suggestions'
    cluster: text('cluster'), // seed category (brands, checks, how-to, problems)
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

/** VIN lookup activity log — one row per free preview and per paid report, for
 *  the admin activity view. Best-effort write; never blocks the user request. */
export const lookups = sqliteTable('lookups', {
    id: text('id').primaryKey(),
    vin: text('vin').notNull(),
    type: text('type', { enum: ['preview', 'report'] }).notNull(),
    email: text('email'), //        set when the visitor is a signed-in user
    make: text('make'),
    model: text('model'),
    year: integer('year'),
    country: text('country'), //    cf-ipcountry
    ip_hash: text('ip_hash'), //    SHA-256 of IP (never the raw IP)
    records_found: integer('records_found'), // total records surfaced (preview) / data points (report)
    status: text('status', { enum: ['ok', 'cached', 'not_found', 'error'] }).default('ok'),
    test_mode: integer('test_mode', { mode: 'boolean' }).default(false),
    request_id: text('request_id'), // VinCheck X-Request-Id, for support/reconciliation
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
    lookupsVinIdx: index('lookups_vin_idx').on(t.vin),
    lookupsTypeIdx: index('lookups_type_idx').on(t.type),
    lookupsEmailIdx: index('lookups_email_idx').on(t.email),
    lookupsCreatedIdx: index('lookups_created_idx').on(t.created_at),
}));

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
