import { useEffect, useMemo, useRef, useState } from "react";
import { chatApi } from "../../utils/api";

type Suggestion = { id: string; name: string; price?: string | number; thumbnailUrl?: string };

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  suggestions?: Suggestion[];
  sources?: string[];
};

export default function ChatPanel({ onClose, fullscreen }: { onClose?: () => void; fullscreen?: boolean }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Xin chào! Mình có thể giúp gì: chính sách đổi trả, cách đặt hàng, sản phẩm bán chạy, hay tư vấn chọn sản phẩm?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await chatApi.ask(msg);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.answer || "Mình đã ghi nhận câu hỏi nhé.",
          suggestions: res.suggestions as Suggestion[] | undefined,
          sources: (res as any).sources,
        },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Xin lỗi, hệ thống bận. Vui lòng thử lại sau." }]);
    } finally {
      setLoading(false);
    }
  };

  const quick = [
    "Chính sách đổi trả",
    "Cách đặt hàng",
    "Sản phẩm bán chạy",
    "Tư vấn chọn sản phẩm tầm 15 triệu",
  ];

  return (
    <div className={`flex flex-col bg-white shadow-xl ${fullscreen ? "fixed inset-0 z-50" : "w-[360px] md:w-[420px] h-[560px] rounded-xl overflow-hidden"}`}>
      {/* Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white px-4 py-3">
        <div className="flex items-center gap-2">
          {fullscreen ? (
            <button onClick={onClose} className="mr-1 rounded-md p-1.5 hover:bg-white/10 transition" aria-label="Đóng">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          ) : null}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v9H7l-3 3V5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div className="font-semibold">Trợ lý SecureShop</div>
        </div>
        <div className="text-xs opacity-90">Hỏi về chính sách, đặt hàng, sản phẩm phù hợp…</div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`${m.role === "user" ? "bg-indigo-600 text-white rounded-l-lg rounded-tr-lg" : "bg-white border rounded-r-lg rounded-tl-lg"} px-3 py-2 max-w-[85%] shadow-sm`}>
              <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>

              {!!m.suggestions?.length && (
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {m.suggestions.map((p) => (
                    <a key={p.id} href={`/products/${p.id}`} className="flex items-center gap-3 p-2 rounded-md border hover:shadow transition bg-white">
                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                        {p.thumbnailUrl ? (
                          <img className="w-full h-full object-cover" src={p.thumbnailUrl} alt={p.name} />
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" className="text-gray-400"><path d="M4 6h16v12H4z" fill="currentColor"/></svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium line-clamp-2">{p.name}</div>
                        {p.price && <div className="text-xs text-emerald-600 font-semibold">{typeof p.price === "number" ? p.price.toLocaleString("vi-VN") + "₫" : p.price}</div>}
                      </div>
                      <svg width="18" height="18" viewBox="0 0 24 24" className="text-gray-400 group-hover:text-gray-600 transition"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </a>
                  ))}
                </div>
              )}

              {!!m.sources?.length && (
                <div className="mt-2">
                  <div className="text-[11px] text-gray-500">Nguồn tham khảo:</div>
                  <ul className="mt-1 space-y-1">
                    {m.sources.map((s, idx) => (<li key={idx} className="text-[11px] text-gray-500">• {s}</li>))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 bg-white border rounded-r-lg rounded-tl-lg shadow-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <span>Đang nhập</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick prompts */}
      <div className="px-3 pt-2 pb-1 bg-gray-50 border-t">
        <div className="flex flex-wrap gap-2">
          {quick.map((q) => (
            <button key={q} onClick={() => send(q)} className="text-xs px-2 py-1 rounded-full border bg-white hover:bg-gray-50 active:scale-95 transition">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSend) send();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!canSend}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-white transition ${canSend ? "bg-indigo-600 hover:bg-indigo-700 active:scale-95" : "bg-gray-300 cursor-not-allowed"}`}
            aria-label="Gửi"
            title="Gửi"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12l14-7-6 7 6 7-14-7z" fill="currentColor"/></svg>
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
}
