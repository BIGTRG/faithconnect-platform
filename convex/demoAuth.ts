import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { createAccount, retrieveAccount } from "@convex-dev/auth/server";
import { Scrypt } from "lucia";
import type { DataModel } from "./_generated/dataModel";

const DEMO_EMAIL = "demo@faithconnect.app";
const DEMO_PASSWORD = "FaithConnect2026!";

export const DEMO_USER = {
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
  name: "Demo User",
} as const;

export const DemoCredentials = ConvexCredentials<DataModel>({
  id: "demo",
  crypto: {
    async hashSecret(password: string) {
      return await new Scrypt().hash(password);
    },
    async verifySecret(password: string, hash: string) {
      return await new Scrypt().verify(hash, password);
    },
  },
  authorize: async (params, ctx) => {
    const email = params.email as string;
    const password = params.password as string;

    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      throw new Error("Invalid demo credentials");
    }

    // Try to sign in first
    try {
      const result = await retrieveAccount(ctx, {
        provider: "demo",
        account: { id: email, secret: password },
      });
      return { userId: result.user._id };
    } catch {
      // Account doesn't exist yet, create it
    }

    const { user } = await createAccount(ctx, {
      provider: "demo",
      account: { id: email, secret: password },
      profile: {
        email,
        name: "Demo User",
        emailVerificationTime: Date.now(),
      },
      shouldLinkViaEmail: false,
    });

    return { userId: user._id };
  },
});
