import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  date,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const sideEnum = pgEnum("side", ["buyer", "seller", "buyer_seller"]);
export const lostStageEnum = pgEnum("lost_stage", ["loi", "under_contract"]);

export const advisors = pgTable("advisors", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealName: text("deal_name").notNull(),
  advisorId: uuid("advisor_id")
    .references(() => advisors.id)
    .notNull(),
  clientOrProperty: text("client_or_property"),
  side: sideEnum("side").notNull(),
  loiDate: date("loi_date"),
  loiExpectedCommission: numeric("loi_expected_commission", {
    precision: 12,
    scale: 2,
  }),
  underContractDate: date("under_contract_date"),
  hopperGainAmount: numeric("hopper_gain_amount", { precision: 12, scale: 2 }),
  expectedCloseDate: date("expected_close_date"),
  closedDate: date("closed_date"),
  closedCommission: numeric("closed_commission", { precision: 12, scale: 2 }),
  lostDate: date("lost_date"),
  lostStage: lostStageEnum("lost_stage"),
  lostAmount: numeric("lost_amount", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const advisorRelations = relations(advisors, ({ many }) => ({
  deals: many(deals),
}));

export const dealRelations = relations(deals, ({ one }) => ({
  advisor: one(advisors, {
    fields: [deals.advisorId],
    references: [advisors.id],
  }),
}));

export type Advisor = typeof advisors.$inferSelect;
export type NewAdvisor = typeof advisors.$inferInsert;
export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
