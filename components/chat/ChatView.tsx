"use client";

import { useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import { chatApi } from "@/lib/api-client";
import { supabase } from "@/lib/supabase";
import { timeAgo } from "@/lib/utils";

export default function ChatView({
  user,
  initialListing,
}: {
  user?: any;
  initialListing?: any;
}) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const currentConversation = useMemo(
    () => conversations.find((c) => c.id === activeId),
    [conversations, activeId]
  );

  const otherParticipant = useMemo(() => {
    if (!currentConversation?.participants) return null;
    return currentConversation.participants.find((p: any) => p.user.id !== user?.id)?.user;
  }, [currentConversation, user?.id]);

  const loadConversations = async () => {
    try {
      const data: any = await chatApi.getConversations();
      setConversations(data.conversations || []);
      setActiveId((prev) => prev || data.conversations?.[0]?.id || null);
    } catch (error: any) {
      toast.error(error.message || "Could not load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const loadMessages = async () => {
      const data: any = await chatApi.getMessages(activeId);
      setMessages(data.messages || []);
    };
    loadMessages().catch(() => setMessages([]));
  }, [activeId]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`qsh-messages-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const message = payload.new as any;
          if (message.receiverId === user.id || message.senderId === user.id) {
            if (message.conversationId === activeId) {
              setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
            }
            loadConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, activeId]);

  const sendMessage = async () => {
    if (!msg.trim()) return;

    const receiverId = initialListing?.sellerId || otherParticipant?.id;
    if (!receiverId) {
      toast.error("Select a conversation first");
      return;
    }
    if (receiverId === user?.id) {
      toast.error("You cannot message yourself");
      return;
    }

    const content = msg.trim();
    setMsg("");
    try {
      const data: any = await chatApi.sendMessage({
        receiverId,
        content,
        conversationId: activeId || undefined,
        listingId: initialListing?.id,
      });
      if (!activeId) setActiveId(data.conversationId);
      setMessages((prev) => (prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]));
      await loadConversations();
    } catch (error: any) {
      setMsg(content);
      toast.error(error.message || "Message failed");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] bg-white rounded-3xl border border-gray-200 overflow-hidden h-[calc(100vh-160px)] md:h-[calc(100vh-140px)]">
      <div className="border-r border-gray-200 overflow-y-auto hidden md:block">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-display font-bold text-lg">Messages</h3>
        </div>
        {loading ? (
          <div className="p-5 text-sm text-gray-500">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="p-5 text-sm text-gray-500">No conversations yet.</div>
        ) : (
          conversations.map((c) => {
            const other = c.participants?.find((p: any) => p.user.id !== user?.id)?.user;
            const last = c.messages?.[0];
            return (
              <div
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`flex gap-3 px-5 py-3.5 cursor-pointer transition-colors border-b border-gray-100 ${
                  activeId === c.id ? "bg-brand-blue-bg" : "hover:bg-gray-50"
                }`}
              >
                <div className="w-11 h-11 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-base shrink-0">
                  {(other?.name || "U")[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold truncate">{other?.name || "User"}</h4>
                    {c.unreadCount > 0 && <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5">{c.unreadCount}</span>}
                  </div>
                  <p className="text-[13px] text-gray-500 truncate">{last?.content || c.listing?.title || "New conversation"}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
            {(otherParticipant?.name || initialListing?.seller || "S")[0]}
          </div>
          <div>
            <h4 className="font-semibold text-sm">{otherParticipant?.name || initialListing?.seller || "Start a conversation"}</h4>
            <p className="text-xs text-gray-500">Re: {currentConversation?.listing?.title || initialListing?.title || "Marketplace chat"}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="text-sm text-gray-500 text-center mt-10">Send the first message.</div>
          ) : (
            messages.map((m) => {
              const own = m.senderId === user?.id;
              return (
                <div key={m.id} className={own ? "ml-auto" : ""}>
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      own
                        ? "bg-brand-blue text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                    <div className="text-[11px] mt-1 opacity-60">{m.createdAt ? timeAgo(m.createdAt) : "now"}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex gap-2.5">
          <input
            placeholder="Type a message..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full text-sm outline-none focus:border-brand-blue"
          />
          <button
            onClick={sendMessage}
            className="w-11 h-11 bg-brand-blue rounded-full flex items-center justify-center text-white transition-colors hover:bg-brand-blue-dark"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
