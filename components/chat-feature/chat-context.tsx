"use client";

import { Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import type { MyUIMessage } from "@/app/api/chat/route";

interface ChatContextType {
  chat: Chat<MyUIMessage>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const chat = useMemo(
    () =>
      new Chat<MyUIMessage>({
        transport: new DefaultChatTransport({
          api: "/api/chat",
        }),
      }),
    [],
  );

  return (
    <ChatContext.Provider value={{ chat, isOpen, setIsOpen }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
};
