"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { userApiKeys } from "@/lib/db/schema";
import { createSafeAction } from "@/lib/safe-action";

const saveUserApiKeySchema = z.object({
  geminiApiKey: z.string().min(1, "Gemini API Key is required").trim(),
});

const testUserApiKeySchema = z.object({
  geminiApiKey: z.string().min(1, "Gemini API Key is required").trim(),
});

/**
 * Test user's Gemini API Key (BYOK) without saving
 */
export const testUserApiKey = createSafeAction(
  testUserApiKeySchema,
  async (validatedData) => {
    const { geminiApiKey } = validatedData;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || `HTTP ${response.status}`;
        throw new Error(message);
      }

      return { isValid: true };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`API Key validation failed: ${errMsg}`);
    }
  },
);

/**
 * Save and validate user's Gemini API Key (BYOK)
 */
export const saveUserApiKey = createSafeAction(
  saveUserApiKeySchema,
  async (validatedData, session) => {
    const { geminiApiKey } = validatedData;

    try {
      // Validate the API key by requesting the models list
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || `HTTP ${response.status}`;
        throw new Error(message);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`API Key validation failed: ${errMsg}`);
    }

    const now = new Date().toISOString();

    // Upsert into DB
    await db
      .insert(userApiKeys)
      .values({
        userId: session.user.id,
        geminiApiKey,
        isValid: true,
        lastTestedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userApiKeys.userId,
        set: {
          geminiApiKey,
          isValid: true,
          lastTestedAt: now,
          updatedAt: now,
        },
      });

    return {
      isValid: true,
      lastTestedAt: now,
    };
  },
);

/**
 * Delete custom Gemini API Key
 */
export const deleteUserApiKey = createSafeAction(null, async (_, session) => {
  await db.delete(userApiKeys).where(eq(userApiKeys.userId, session.user.id));

  return { success: true };
});

/**
 * Get secure status of user's Gemini API Key (Never returns raw key string)
 */
export const getUserApiKeyStatus = createSafeAction(
  null,
  async (_, session) => {
    const record = await db.query.userApiKeys.findFirst({
      where: eq(userApiKeys.userId, session.user.id),
    });

    return {
      hasKey: !!record,
      isValid: record?.isValid ?? false,
      lastTestedAt: record?.lastTestedAt ?? null,
    };
  },
);
