// schemas/conversation.schema.ts
import { z } from "zod";

export const createConversationSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

// yeh line schema se automatically type bana degi
export type CreateConversationInput = z.infer<typeof createConversationSchema>;