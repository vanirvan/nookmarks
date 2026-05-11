import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { accounts, sessions, users, verifications } from "@/lib/db/schema";

const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!secret) {
  throw new Error("Secret is not defined");
}

if (!baseURL) {
  throw new Error("Base URL is not defined");
}

if (!githubClientId || !githubClientSecret) {
  throw new Error("GitHub credentials are not defined");
}

if (!googleClientId || !googleClientSecret) {
  throw new Error("Google credentials are not defined");
}

export const auth = betterAuth({
  secret,
  baseURL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    },
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins: [
    // make sure this is the last plugin in the array
    nextCookies(),
  ],
});
