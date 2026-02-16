"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

const quickQuestions = [
  "Bugun ne yesem?",
  "Yakinimda ne var?",
  "En populer yemekler",
  "Saglikli secenekler",
];

const aiResponses: Record<string, string> = {
  "bugun ne yesem":
    "Bugun icin onerilerim:\n\n1. **Iskender Kebap** - Kebapci Iskender'den (4.8 puan)\n2. **Whopper Menu** - Burger King'den (4.5 puan)\n3. **Margarita Pizza** - Pizza Lazza'dan (4.3 puan)\n\nHava soguk oldugu icin sicak bir corba da guzel gider! Ev Yemekleri Annecim'in mercimek corbasi mukemmel.",
  "yakinimda ne var":
    "Konumunuza yakin restoranlar:\n\n- **Burger King** - 1.2 km (30 dk teslimat)\n- **Donerci Sahin Usta** - 0.8 km (20 dk teslimat)\n- **Balik Ekmek Evi** - 1.5 km (35 dk teslimat)\n\nEn yakin secenekler icin Donerci Sahin Usta'yi onerebilirim!",
  "en populer yemekler":
    "Bu haftanin en cok siparis edilen yemekleri:\n\n1. **Iskender Kebap** - 450+ siparis\n2. **Whopper Menu** - 320+ siparis\n3. **Adana Kebap** - 300+ siparis\n4. **Kusbasili Pide** - 210+ siparis\n5. **Chicken Royale** - 180+ siparis\n\nKebap kategorisi bu hafta da zirvede!",
  "saglikli secenekler":
    "Saglikli yemek onerileri:\n\n- **Izgara Tavuk Salata** - Tavukcu Baba (350 kcal)\n- **Sebzeli Ev Yemegi** - Annecim (280 kcal)\n- **Balik Ekmek** - Balik Ekmek Evi (420 kcal)\n- **Mercimek Corbasi** - Annecim (180 kcal)\n\nDusuk kalorili ve protein agirlikli secenekler!",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase().trim();

  for (const [key, value] of Object.entries(aiResponses)) {
    if (lower.includes(key)) return value;
  }

  if (lower.includes("pizza")) {
    return "Pizza severler icin onerilerim:\n\n- **Pizza Lazza** - Italyan usulu, 4.3 puan\n- Margarita, Sucuklu ve Karisik en cok tercih edilen cesitler\n- Buyuk boy siparislerde ucretsiz icecek kampanyasi var!";
  }
  if (lower.includes("burger") || lower.includes("hamburger")) {
    return "Burger onerileri:\n\n- **Burger King** - Whopper klasik lezzet (4.5 puan)\n- **Big King** - Iki kat et severler icin\n- Menu secenekleriyle daha ekonomik!";
  }
  if (lower.includes("kebap") || lower.includes("kebab")) {
    return "Kebap cesitleri:\n\n- **Kebapci Iskender** - Orijinal Iskender (4.8 puan)\n- **Adana Kebap** - Acili severler icin\n- Porsiyon seceneklerini kontrol etmeyi unutmayin!";
  }
  if (lower.includes("tatli") || lower.includes("dessert")) {
    return "Tatli onerileri:\n\n- Kunefe, Baklava, Sutlac en cok tercih edilenler\n- Yemek sonrasi tatli icin siparisinize ekleyebilirsiniz\n- Tatli kategorisinden 25+ restoran mevcut!";
  }
  if (lower.includes("merhaba") || lower.includes("selam")) {
    return "Merhaba! Ben NeYisek AI asistaniyim. Size yemek onerisi yapabilirim. Ne tur bir yemek ariyorsunuz? Burger, pizza, kebap, ev yemegi... Istediginizi sorun!";
  }

  return "Anladim! Size en iyi yemek onerilerini sunmak icin calisiyorum.\n\nSu konularda yardimci olabilirim:\n- Yemek onerileri\n- Restoran tavsiyeleri\n- Saglikli secenekler\n- Populer yemekler\n\nNe tur bir yemek ariyorsunuz?";
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: "Merhaba! Ben **NeYisek AI** asistaniyim. Size yemek onerisi yapabilirim. Ne yemek istersiniz?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiText = getAIResponse(text);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        text: aiText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow"
          >
            <Sparkles className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-[340px] sm:w-[380px] rounded-2xl border bg-card shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "min(520px, calc(100vh - 120px))" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-primary p-4 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">NeYisek AI</h3>
                <p className="text-[10px] opacity-80">Yemek asistani - Gemini ile</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 ${
                      msg.role === "ai"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "ai" ? (
                      <Bot className="h-3.5 w-3.5" />
                    ) : (
                      <User className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    {msg.text.split("\n").map((line, i) => (
                      <span key={i}>
                        {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                          part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={j}>{part.slice(2, -2)}</strong>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                        {i < msg.text.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 2 && (
              <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="rounded-full border px-3 py-1.5 text-[11px] text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t p-3">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Ne yemek istersiniz?"
                  className="flex-1 rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
                  disabled={isTyping}
                />
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-xl shrink-0"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
