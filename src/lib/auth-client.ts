import { createAuthClient } from "better-auth/react";

const userRoleFields = {
  id: "user-role-fields",
  $InferServerPlugin: {
    schema: {
      user: {
        fields: {
          role: {
            type: "string",
            required: false,
            input: true,
          },
        },
      },
    },
  },
} as const;

export const authClient = createAuthClient({
  /** The base URL of the server (optional when the client runs on the same domain). */
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [userRoleFields],
});

export const { signIn, signUp, useSession } = authClient;
