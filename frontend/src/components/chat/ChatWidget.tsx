import { useEffect, useState } from "react";
import ChatPanel from "./ChatPanel";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-40 bottom-5 right-4 md:right-6 rounded-full p-4 shadow-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:shadow-xl active:scale-95 transition"
        aria-label="Mở chat hỗ trợ"
        title="Chat hỗ trợ"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v9H7l-3 3V5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {open && (
        <div className="fixed z-40 bottom-20 right-4 md:right-6">
          <div className="hidden md:block">
            <ChatPanel onClose={() => setOpen(false)} />
          </div>
          <div className="block md:hidden">
            <ChatPanel onClose={() => setOpen(false)} fullscreen />
          </div>
        </div>
      )}
    </>
  );
}
