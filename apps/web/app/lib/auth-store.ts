import 'server-only';

import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import Database from 'better-sqlite3';

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = 'fivemyb_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const globalForAuth = globalThis as typeof globalThis & {
  authDatabase?: Database.Database;
};

function getDatabase() {
  let database = globalForAuth.authDatabase;
  if (!database) {
    const databasePath =
      process.env.FIVEMYB_AUTH_DB_PATH ||
      path.join(process.cwd(), '.data', 'auth.sqlite');
    mkdirSync(path.dirname(databasePath), { recursive: true });

    database = new Database(databasePath);
    database.pragma('journal_mode = WAL');
    globalForAuth.authDatabase = database;
  }

  database.pragma('foreign_keys = ON');
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      username TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);
    CREATE TABLE IF NOT EXISTS discord_oauth_states (
      state_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
  `);
  const userColumns = database
    .prepare('PRAGMA table_info(users)')
    .all() as Array<{ name: string }>;
  if (!userColumns.some((column) => column.name === 'discord_id')) {
    database.exec('ALTER TABLE users ADD COLUMN discord_id TEXT');
  }
  if (!userColumns.some((column) => column.name === 'discord_username')) {
    database.exec('ALTER TABLE users ADD COLUMN discord_username TEXT');
  }
  database.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_discord_id_unique
      ON users(discord_id) WHERE discord_id IS NOT NULL;
  `);
  return database;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateRegistration(input: {
  username: string;
  email: string;
  password: string;
}) {
  if (!/^[\p{L}\p{N}_-]{3,32}$/u.test(input.username)) {
    return 'Kullanıcı adı 3-32 karakter olmalı; harf, rakam, _ veya - içerebilir.';
  }
  if (
    input.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)
  ) {
    return 'Geçerli bir e-posta adresi girin.';
  }
  if (input.password.length < 10 || input.password.length > 128) {
    return 'Parola 10-128 karakter arasında olmalı.';
  }
  return null;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, saltHex, keyHex] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, 'hex');
  const actual = (await scrypt(
    password,
    Buffer.from(saltHex, 'hex'),
    expected.length,
  )) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
}) {
  const passwordHash = await hashPassword(input.password);
  const id = randomBytes(16).toString('hex');
  try {
    getDatabase()
      .prepare(
        'INSERT INTO users (id, email, username, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
      )
      .run(id, normalizeEmail(input.email), input.username.trim(), passwordHash, new Date().toISOString());
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('UNIQUE constraint failed: users.email')
    ) {
      throw new Error('Bu e-posta adresiyle zaten bir hesap var.');
    }
    if (
      error instanceof Error &&
      error.message.includes('UNIQUE constraint failed: users.username')
    ) {
      throw new Error('Bu kullanıcı adı zaten alınmış.');
    }
    throw error;
  }
  return id;
}

export async function authenticateUser(email: string, password: string) {
  const user = getDatabase()
    .prepare('SELECT id, password_hash FROM users WHERE email = ?')
    .get(normalizeEmail(email)) as
    | { id: string; password_hash: string }
    | undefined;
  if (!user || !(await verifyPassword(password, user.password_hash))) return null;
  return user.id;
}

export function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const database = getDatabase();
  database.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
  database
    .prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .run(hashToken(token), userId, expiresAt);
  return { token, maxAge: SESSION_TTL_SECONDS };
}

export function getSessionUser(token: string | undefined) {
  if (!token) return null;
  return (
    getDatabase()
      .prepare(
        `SELECT users.id, users.username, users.email
         FROM sessions JOIN users ON users.id = sessions.user_id
         WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
      )
      .get(hashToken(token), Date.now()) as
      | { id: string; username: string; email: string }
      | undefined
  ) ?? null;
}

export type SiteRole = 'owner' | 'admin' | 'manager' | 'moderator' | 'support';

const siteRoleNames: Record<SiteRole, string> = {
  owner: 'Kurucu',
  admin: 'Yönetici',
  manager: 'Yönetim ekibi',
  moderator: 'Moderatör',
  support: 'Destek ekibi',
};

export function getSiteRole(email: string): { key: SiteRole; name: string } | null {
  const entries = process.env.FIVEMYB_STAFF_ROLES?.split(',') ?? [];
  for (const entry of entries) {
    const [configuredEmail, configuredRole] = entry.trim().split(':');
    const role = configuredRole?.toLowerCase() as SiteRole | undefined;
    if (
      configuredEmail?.toLowerCase() === normalizeEmail(email) &&
      role &&
      Object.hasOwn(siteRoleNames, role)
    ) {
      return { key: role, name: siteRoleNames[role] };
    }
  }
  return null;
}

export function getDiscordOAuthConfig() {
  const clientId = process.env.FIVEMYB_DISCORD_CLIENT_ID;
  const clientSecret = process.env.FIVEMYB_DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.FIVEMYB_DISCORD_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
}

export function saveDiscordOAuthState(userId: string, state: string) {
  const database = getDatabase();
  const now = Date.now();
  database.prepare('DELETE FROM discord_oauth_states WHERE expires_at <= ?').run(now);
  database
    .prepare(
      'INSERT INTO discord_oauth_states (state_hash, user_id, expires_at) VALUES (?, ?, ?)',
    )
    .run(hashToken(state), userId, now + 10 * 60 * 1000);
}

export function consumeDiscordOAuthState(userId: string, state: string) {
  const result = getDatabase()
    .prepare(
      'DELETE FROM discord_oauth_states WHERE state_hash = ? AND user_id = ? AND expires_at > ?',
    )
    .run(hashToken(state), userId, Date.now());
  return result.changes === 1;
}

export function getDiscordAccount(userId: string) {
  return (
    getDatabase()
      .prepare('SELECT discord_id, discord_username FROM users WHERE id = ?')
      .get(userId) as
      | { discord_id: string | null; discord_username: string | null }
      | undefined
  ) ?? null;
}

export function linkDiscordAccount(
  userId: string,
  discordId: string,
  discordUsername: string,
) {
  if (!/^\d{17,20}$/.test(discordId) || !discordUsername || discordUsername.length > 100) {
    throw new Error('INVALID_DISCORD_PROFILE');
  }

  const database = getDatabase();
  const alreadyLinked = database
    .prepare('SELECT id FROM users WHERE discord_id = ? AND id != ?')
    .get(discordId, userId);
  if (alreadyLinked) throw new Error('DISCORD_ACCOUNT_ALREADY_LINKED');

  try {
    database
      .prepare(
        'UPDATE users SET discord_id = ?, discord_username = ? WHERE id = ?',
      )
      .run(discordId, discordUsername, userId);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('UNIQUE constraint failed: users.discord_id')
    ) {
      throw new Error('DISCORD_ACCOUNT_ALREADY_LINKED');
    }
    throw error;
  }
}

export function unlinkDiscordAccount(userId: string) {
  getDatabase()
    .prepare('UPDATE users SET discord_id = NULL, discord_username = NULL WHERE id = ?')
    .run(userId);
}

export function deleteSession(token: string | undefined) {
  if (token) {
    getDatabase()
      .prepare('DELETE FROM sessions WHERE token_hash = ?')
      .run(hashToken(token));
  }
}

export const sessionCookieName = SESSION_COOKIE;
export const discordOAuthStateCookieName = 'fivemyb_discord_oauth_state';
