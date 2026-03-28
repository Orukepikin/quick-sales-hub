"use client";

import { useState } from "react";
import { Send } from "lucide-react";

const MOCK_CHATS = [
  { name: "TechZone_NG", listing: "iPhone 15 Pro Max", lastMsg: "Can we do ₦800k?", time: "10:35 AM" },
  { name: "GadgetPlug", listing: "MacBook Pro M3", lastMsg: "Is it still available?", time: "Yesterday" },
  { name: "AutoDeals", listing: "Toyota Camry 2019", lastMsg: "Can I see it tomorrow?", time: "Mon" },
];

const INITIAL_MESSAGES = [
  { id: 1, from: "BuyerJohn", to: "TechZone_NG", text: "Is this still available?", time: "10:30 AM" },
  { id: 2, from: "TechZone_NG", to: "BuyerJohn", text: "Yes it is! Are you in Lagos?", time: "10:32 AM" },
  { id: 3, from: "BuyerJohn", to: "TechZone_NG", text: "Yes, Lekki. Can we do ₦800k?", time: "10:35 AM" },
];

export default function ChatView() {
  const [activeChat, setActiveChat] = useState(0);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  const sendMessage = () => {
    if (!msg.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        from: "You",
        to: MOCK_CHATS[activeChat].name,
        text: msg,
        time: "Now",
      },
    ]);
    setMsg("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] bg-white rounded-3xl border border-gray-200 overflow-hidden h-[calc(100vh-160px)] md:h-[calc(100vh-140px)]">
      {/* Sidebar */}
      <div className="border-r border-gray-200 overflow-y-auto hidden md:block">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-display font-bold text-lg">Messages</h3>
        </div>
        {MOCK_CHATS.map((c, i) => (
          <div
            key={i}
            onClick={() => setActiveChat(i)}
            className={`flex gap-3 px-5 py-3.5 cursor-pointer transition-colors border-b border-gray-100 ${
              activeChat === i ? "bg-brand-blue-bg" : "hover:bg-gray-50"
            }`}
          >
            <div className="w-11 h-11 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-base shrink-0">
              {c.name[0]}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold">{c.name}</h4>
              <p className="text-[13px] text-gray-500 truncate">{c.lastMsg}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex flex-col">
        {/* Chat header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
            {MOCK_CHATS[activeChat].name[0]}
          </div>
          <div>
            <h4 className="font-semibold text-sm">{MOCK_CHATS[activeChat].name}</h4>
            <p className="text-xs text-gray-500">Re: {MOCK_CHATS[activeChat].listing}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          {messages
            .filter(
              (m) =>
                m.from === MOCK_CHATS[activeChat].name ||
                m.to === MOCK_CHATS[activeChat].name
            )
            .map((m) => (
              <div key={m.id}>
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.from === "You" || m.from === "BuyerJohn"
                      ? "bg-brand-blue text-white self-end ml-auto rounded-br-sm"
                      : "bg-gray-100 text-gray-800 self-start rounded-bl-sm"
                  }`}
                >
                  {m.text}
                  <div className="text-[11px] mt-1 opacity-60">{m.time}</div>
                </div>
              </div>
            ))}
        </div>

        {/* Input */}
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
