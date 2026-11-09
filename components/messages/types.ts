import type { usePlatform } from "@/providers/platform-provider";

type Platform = ReturnType<typeof usePlatform>;
export type Conversation = Platform["conversations"][number];
export type ActiveConversation = NonNullable<Platform["activeConversation"]>;
export type ChatMessage = ActiveConversation["messages"][number];
