-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- VIN Requests table
CREATE TABLE IF NOT EXISTS vin_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vin_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, completed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_vin_requests_user_id ON vin_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_vin_requests_status ON vin_requests(status);

-- VIN Reports table
CREATE TABLE IF NOT EXISTS vin_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vin_request_id INTEGER NOT NULL,
    report_data TEXT NOT NULL, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vin_request_id) REFERENCES vin_requests(id)
);

CREATE INDEX IF NOT EXISTS idx_vin_reports_request_id ON vin_reports(vin_request_id);
