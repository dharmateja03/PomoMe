import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, integer, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// Schema definitions (must match main app)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const studyRooms = pgTable('study_rooms', {
  id: serial('id').primaryKey(),
  hostId: integer('host_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  inviteCode: varchar('invite_code', { length: 20 }).notNull().unique(),
  timerDuration: integer('timer_duration').notNull().default(1500),
  timerStatus: varchar('timer_status', { length: 20 }).notNull().default('waiting'),
  timerStartedAt: timestamp('timer_started_at'),
  timerPausedAt: timestamp('timer_paused_at'),
  timerElapsed: integer('timer_elapsed').notNull().default(0),
  maxParticipants: integer('max_participants').notNull().default(10),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
});

export const roomParticipants = pgTable('room_participants', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull().references(() => studyRooms.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().default('participant'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  leftAt: timestamp('left_at'),
  totalFocusTime: integer('total_focus_time').notNull().default(0),
  completedRounds: integer('completed_rounds').notNull().default(0),
});

export type User = typeof users.$inferSelect;
export type StudyRoom = typeof studyRooms.$inferSelect;
export type RoomParticipant = typeof roomParticipants.$inferSelect;
