import { pgTable, serial, text, integer, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  color: varchar('color', { length: 7 }).notNull(),
  targetHours: integer('target_hours').notNull().default(10),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  duration: integer('duration').notNull(), // in seconds
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

// Study Rooms
export const studyRooms = pgTable('study_rooms', {
  id: serial('id').primaryKey(),
  hostId: integer('host_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  inviteCode: varchar('invite_code', { length: 20 }).notNull().unique(),
  timerDuration: integer('timer_duration').notNull().default(1500), // 25 minutes in seconds
  timerStatus: varchar('timer_status', { length: 20 }).notNull().default('waiting'), // waiting|active|paused|completed
  timerStartedAt: timestamp('timer_started_at'),
  timerPausedAt: timestamp('timer_paused_at'),
  timerElapsed: integer('timer_elapsed').notNull().default(0), // accumulated elapsed time in seconds
  maxParticipants: integer('max_participants').notNull().default(10),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
});

// Room Participants
export const roomParticipants = pgTable('room_participants', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull().references(() => studyRooms.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().default('participant'), // host|participant
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  leftAt: timestamp('left_at'),
  totalFocusTime: integer('total_focus_time').notNull().default(0), // in seconds
  completedRounds: integer('completed_rounds').notNull().default(0),
});

// Friendships
export const friendships = pgTable('friendships', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  friendId: integer('friend_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending|accepted|blocked
  createdAt: timestamp('created_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
});

// Room Join Requests
export const roomJoinRequests = pgTable('room_join_requests', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull().references(() => studyRooms.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending|accepted|rejected
  createdAt: timestamp('created_at').defaultNow().notNull(),
  respondedAt: timestamp('responded_at'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type StudyRoom = typeof studyRooms.$inferSelect;
export type NewStudyRoom = typeof studyRooms.$inferInsert;
export type RoomParticipant = typeof roomParticipants.$inferSelect;
export type NewRoomParticipant = typeof roomParticipants.$inferInsert;
export type Friendship = typeof friendships.$inferSelect;
export type NewFriendship = typeof friendships.$inferInsert;
export type RoomJoinRequest = typeof roomJoinRequests.$inferSelect;
export type NewRoomJoinRequest = typeof roomJoinRequests.$inferInsert;
