
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

import { USER_ROLES } from "./user-roles";

const client = new MongoClient(process.env.MONGODB_URL as string);
const db = client.db('frostfit');

export const auth = betterAuth({
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: USER_ROLES.customer,
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  database: mongodbAdapter(db, {
    client,
  }),
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email" && ctx.body) {
        ctx.body.role = ctx.body.role === USER_ROLES.seller ? USER_ROLES.seller : USER_ROLES.customer;
      }

      if (ctx.path === "/update-user" && ctx.body) {
        delete ctx.body.role;
      }
    }),
  },
});