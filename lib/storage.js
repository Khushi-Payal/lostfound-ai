import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { connectMongo, isMongoConfigured } from './db';
import { getSeedItems } from './seed';
import User from '../models/User';
import LostItem from '../models/LostItem';
import FoundItem from '../models/FoundItem';
import Notification from '../models/Notification';
import Claim from '../models/Claim';
import ContactMessage from '../models/ContactMessage';
import SavedItem from '../models/SavedItem';

const DEMO_FILE = path.join(process.cwd(), process.env.TRACEIT_DATA_DIR || '.data', 'traceit-demo.json');
let initPromise;
let writeQueue = Promise.resolve();

export const isDemoMode = () => !isMongoConfigured();

function newId() {
  return crypto.randomUUID();
}

function serializable(value) {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === 'object' && typeof value.toHexString === 'function') return value.toHexString();
  if (Array.isArray(value)) return value.map(serializable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, serializable(child)]));
  }
  return value;
}

function plain(doc) {
  if (!doc) return null;
  const raw = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: false }) : doc;
  const out = serializable(raw);
  const id = String(out._id || out.id || '');
  delete out._id;
  delete out.__v;
  return { ...out, id };
}

async function writeState(state) {
  await fs.mkdir(path.dirname(DEMO_FILE), { recursive: true });
  const tmp = `${DEMO_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), 'utf8');
  await fs.rename(tmp, DEMO_FILE);
}

async function initializeDemo() {
  await fs.mkdir(path.dirname(DEMO_FILE), { recursive: true });
  let state;
  try {
    state = JSON.parse(await fs.readFile(DEMO_FILE, 'utf8'));
  } catch {
    state = { users: [], items: [], notifications: [], claims: [], contactMessages: [], savedItems: [] };
  }
  for (const key of ['users', 'items', 'notifications', 'claims', 'contactMessages', 'savedItems']) {
    if (!Array.isArray(state[key])) state[key] = [];
  }

  let demoUser = state.users.find((user) => user.email === 'demo@traceit.in');
  if (!demoUser) {
    demoUser = {
      id: 'demo-user', name: 'Aarav Mehta', email: 'demo@traceit.in', phone: '+91 98765 43210',
      passwordHash: await bcrypt.hash('Demo123!', 10), state: 'Delhi', city: 'New Delhi', role: 'user',
      notificationPreferences: { matches: true, claims: true, updates: true }, createdAt: new Date().toISOString(),
    };
    state.users.push(demoUser);
  }
  let adminUser = state.users.find((user) => user.email === 'admin@traceit.in');
  if (!adminUser) {
    adminUser = {
      id: 'demo-admin', name: 'TraceIt Admin', email: 'admin@traceit.in', phone: '',
      passwordHash: await bcrypt.hash('Admin123!', 10), state: 'Delhi', city: 'New Delhi', role: 'admin',
      notificationPreferences: { matches: true, claims: true, updates: true }, createdAt: new Date().toISOString(),
    };
    state.users.push(adminUser);
  }
  if (state.items.length === 0) state.items = getSeedItems(demoUser.id);
  if (state.notifications.length === 0) {
    state.notifications.push({
      id: 'sample-notification-welcome', userId: demoUser.id, type: 'system',
      title: 'Welcome to TraceIt',
      message: 'Your demo account is ready. Explore sample records and see matching suggestions in action.',
      itemId: '', readAt: null, createdAt: new Date().toISOString(),
    });
  }
  if (state.savedItems.length === 0) {
    state.savedItems.push({ id: 'sample-saved-iphone', userId: demoUser.id, itemId: 'sample-found-iphone-delhi', createdAt: new Date().toISOString() });
  }
  await writeState(state);
  return state;
}

async function readDemoState() {
  if (!initPromise) initPromise = initializeDemo().catch((error) => { initPromise = null; throw error; });
  await initPromise;
  try {
    return JSON.parse(await fs.readFile(DEMO_FILE, 'utf8'));
  } catch {
    initPromise = initializeDemo();
    return initPromise;
  }
}

async function mutateDemoState(mutator) {
  const task = writeQueue.then(async () => {
    const state = await readDemoState();
    const result = await mutator(state);
    await writeState(state);
    return result;
  });
  writeQueue = task.catch(() => {});
  return task;
}

const modelFor = {
  users: User,
  notifications: Notification,
  claims: Claim,
  contactMessages: ContactMessage,
  savedItems: SavedItem,
};

async function mongoReady() {
  await connectMongo();
}

export async function listRecords(collection) {
  if (!isMongoConfigured()) {
    const state = await readDemoState();
    return (state[collection] || []).map((record) => structuredClone(record));
  }
  await mongoReady();
  if (collection === 'items') {
    const [lost, found] = await Promise.all([
      LostItem.find({}).sort({ createdAt: -1 }).lean(),
      FoundItem.find({}).sort({ createdAt: -1 }).lean(),
    ]);
    return [...lost.map(plain), ...found.map(plain)].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  const Model = modelFor[collection];
  if (!Model) throw new Error(`Unknown data collection: ${collection}`);
  const records = await Model.find({}).sort({ createdAt: -1 }).lean();
  return records.map(plain);
}

export async function findRecord(collection, id) {
  if (!id) return null;
  if (!isMongoConfigured()) {
    const state = await readDemoState();
    return structuredClone((state[collection] || []).find((record) => String(record.id) === String(id)) || null);
  }
  await mongoReady();
  if (collection === 'items') {
    for (const Model of [LostItem, FoundItem]) {
      try {
        const record = await Model.findById(id).lean();
        if (record) return plain(record);
      } catch (error) {
        if (error.name !== 'CastError') throw error;
      }
    }
    return null;
  }
  const Model = modelFor[collection];
  if (!Model) throw new Error(`Unknown data collection: ${collection}`);
  try {
    return plain(await Model.findById(id).lean());
  } catch (error) {
    if (error.name === 'CastError') return null;
    throw error;
  }
}

export async function findUserByEmail(email, { includeSecrets = false } = {}) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!isMongoConfigured()) {
    const state = await readDemoState();
    return structuredClone(state.users.find((user) => user.email === normalized) || null);
  }
  await mongoReady();
  let query = User.findOne({ email: normalized });
  if (includeSecrets) query = query.select('+passwordHash +resetTokenHash +resetTokenExpires');
  const result = await query.lean();
  return plain(result);
}

function cleanRecord(record) {
  const copy = { ...record };
  delete copy.id;
  delete copy._id;
  delete copy.__v;
  return copy;
}

export async function createRecord(collection, record) {
  if (!isMongoConfigured()) {
    const withId = { id: record.id || newId(), ...record };
    return mutateDemoState((state) => {
      const entries = state[collection] || [];
      if (collection === 'users' && entries.some((user) => user.email === String(record.email || '').toLowerCase())) {
        const duplicate = new Error('An account with this email already exists.');
        duplicate.code = 11000;
        throw duplicate;
      }
      if (collection === 'claims' && entries.some((claim) => String(claim.itemId) === String(record.itemId) && String(claim.claimantId) === String(record.claimantId))) {
        const duplicate = new Error('A claim has already been submitted for this item.');
        duplicate.code = 11000;
        throw duplicate;
      }
      if (collection === 'savedItems' && entries.some((entry) => String(entry.userId) === String(record.userId) && String(entry.itemId) === String(record.itemId))) {
        const duplicate = new Error('This item is already saved.');
        duplicate.code = 11000;
        throw duplicate;
      }
      entries.push(withId);
      state[collection] = entries;
      return structuredClone(withId);
    });
  }
  await mongoReady();
  const data = cleanRecord(record);
  let Model = modelFor[collection];
  if (collection === 'items') Model = data.type === 'found' ? FoundItem : LostItem;
  if (!Model) throw new Error(`Unknown data collection: ${collection}`);
  const doc = await Model.create(data);
  return plain(doc);
}

export async function updateRecord(collection, id, patch) {
  if (!isMongoConfigured()) {
    return mutateDemoState((state) => {
      const record = (state[collection] || []).find((entry) => String(entry.id) === String(id));
      if (!record) return null;
      Object.assign(record, patch, { updatedAt: new Date().toISOString() });
      return structuredClone(record);
    });
  }
  await mongoReady();
  const data = cleanRecord(patch);
  if (collection === 'items') {
    for (const Model of [LostItem, FoundItem]) {
      try {
        const updated = await Model.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
        if (updated) return plain(updated);
      } catch (error) {
        if (error.name !== 'CastError') throw error;
      }
    }
    return null;
  }
  const Model = modelFor[collection];
  if (!Model) throw new Error(`Unknown data collection: ${collection}`);
  try {
    return plain(await Model.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean());
  } catch (error) {
    if (error.name === 'CastError') return null;
    throw error;
  }
}

export async function deleteRecord(collection, id) {
  if (!isMongoConfigured()) {
    return mutateDemoState((state) => {
      const records = state[collection] || [];
      const index = records.findIndex((entry) => String(entry.id) === String(id));
      if (index < 0) return null;
      return structuredClone(records.splice(index, 1)[0]);
    });
  }
  await mongoReady();
  if (collection === 'items') {
    for (const Model of [LostItem, FoundItem]) {
      try {
        const deleted = await Model.findByIdAndDelete(id).lean();
        if (deleted) return plain(deleted);
      } catch (error) {
        if (error.name !== 'CastError') throw error;
      }
    }
    return null;
  }
  const Model = modelFor[collection];
  if (!Model) throw new Error(`Unknown data collection: ${collection}`);
  try {
    return plain(await Model.findByIdAndDelete(id).lean());
  } catch (error) {
    if (error.name === 'CastError') return null;
    throw error;
  }
}

export async function updateUserByEmail(email, patch) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!isMongoConfigured()) {
    return mutateDemoState((state) => {
      const user = state.users.find((entry) => entry.email === normalized);
      if (!user) return null;
      Object.assign(user, patch, { updatedAt: new Date().toISOString() });
      return structuredClone(user);
    });
  }
  await mongoReady();
  const updated = await User.findOneAndUpdate({ email: normalized }, { $set: cleanRecord(patch) }, { new: true, runValidators: true })
    .select('+passwordHash +resetTokenHash +resetTokenExpires').lean();
  return plain(updated);
}

export async function storageHealth() {
  if (!isMongoConfigured()) {
    await readDemoState();
    return { mode: 'demo', ready: true };
  }
  await mongoReady();
  return { mode: 'mongodb', ready: true };
}
