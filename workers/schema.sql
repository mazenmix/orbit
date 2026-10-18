-- Shared Cloudflare D1 schema for encrypted MX Astro sync and Web Push.
CREATE TABLE IF NOT EXISTS mx_sync_v1 (slot TEXT PRIMARY KEY,verifier TEXT NOT NULL,revision INTEGER NOT NULL,payload TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS mx_push_v1 (device_id TEXT PRIMARY KEY,verifier TEXT NOT NULL,subscription TEXT NOT NULL,zone TEXT NOT NULL,moon INTEGER NOT NULL,hourly INTEGER NOT NULL,daily INTEGER NOT NULL,events TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS mx_push_sent_v1 (device_id TEXT NOT NULL,event_id TEXT NOT NULL,delivered_at TEXT NOT NULL,PRIMARY KEY(device_id,event_id));
CREATE INDEX IF NOT EXISTS mx_push_sent_cleanup ON mx_push_sent_v1(delivered_at);
