import { useState, useRef, useEffect } from "react";

const BACKEND_URL = "http://localhost:5000";

const MODERATION_SYSTEM = `You are a content moderation AI. Analyze the user message and respond ONLY with a JSON object in this exact format (no markdown, no extra text):
{"safe": true, "score": 0.0, "reason": "brief reason", "category": "safe"}

Rules:
- safe: false if message contains hate speech, violence, harassment, adult content, or spam
- score: 0.0 (completely safe) to 1.0 (extremely harmful)
- category: one of "safe", "hate", "violence", "adult", "spam", "misinformation", "other"
- If safe is false, score must be above 0.5`;

const CHAT_SYSTEM = `You are Nexus, a helpful and thoughtful AI assistant on a moderated platform. Be genuinely helpful, concise, and friendly.`;

async function callClaude(system, userText, maxTokens = 300) {
  console.log(`📤 Calling API: ${BACKEND_URL}/api/messages`);
  console.log("   Payload:", {
    system: system.substring(0, 50) + "...",
    userText,
    maxTokens,
  });

  try {
    const res = await fetch(`${BACKEND_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system,
        messages: [{ role: "user", content: userText }],
        max_tokens: maxTokens,
      }),
    });

    console.log(`📥 Response status: ${res.status}`);

    if (!res.ok) {
      const error = await res.json();
      console.error("❌ API Error:", error);
      throw new Error(
        `API error ${res.status}: ${error.error || res.statusText}`,
      );
    }

    const data = await res.json();
    console.log(
      "✅ Response data:",
      data.content?.[0]?.text?.substring(0, 100) + "...",
    );
    return data.content?.map((b) => b.text || "").join("") || "";
  } catch (error) {
    console.error("❌ Fetch error:", error);
    throw error;
  }
}

async function moderateText(text) {
  try {
    const raw = await callClaude(MODERATION_SYSTEM, text, 150);
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return {
      safe: true,
      score: 0,
      reason: "moderation unavailable",
      category: "safe",
    };
  }
}

async function chatWithHistory(history) {
  console.log(`📤 Calling chat API with ${history.length} messages in history`);

  try {
    const res = await fetch(`${BACKEND_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: CHAT_SYSTEM,
        messages: history,
        max_tokens: 1000,
      }),
    });

    console.log(`📥 Chat response status: ${res.status}`);

    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    console.log("✅ Chat response received");
    return data.content?.map((b) => b.text || "").join("") || "";
  } catch (error) {
    console.error("❌ Chat API error:", error);
    throw error;
  }
}

function ModBadge({ result }) {
  if (!result) return null;
  if (result.checking)
    return <span style={styles.badge.checking}>● Checking…</span>;
  if (!result.safe && result.score > 0.8)
    return (
      <span style={styles.badge.block}>✗ Blocked · {result.category}</span>
    );
  if (!result.safe)
    return <span style={styles.badge.warn}>⚠ Flagged · {result.category}</span>;
  return <span style={styles.badge.safe}>✓ Cleared</span>;
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  const isBlocked =
    msg.modResult && !msg.modResult.safe && msg.modResult.score > 0.8;

  return (
    <div
      style={{
        ...styles.msgRow,
        flexDirection: isUser ? "row-reverse" : "row",
      }}
    >
      <div
        style={{
          ...styles.avatar,
          background: isUser
            ? "linear-gradient(135deg,#ff6a8a,#ff8a65)"
            : "linear-gradient(135deg,#7c6aff,#a78bfa)",
        }}
      >
        {isUser ? "You" : "AI"}
      </div>
      <div
        style={{
          ...styles.bubble,
          ...(isBlocked ? styles.bubbleBlocked : {}),
          ...(msg.modResult && !msg.modResult.safe && msg.modResult.score <= 0.8
            ? styles.bubbleWarn
            : {}),
        }}
      >
        {msg.modResult && (
          <div style={{ marginBottom: 6 }}>
            <ModBadge result={msg.modResult} />
          </div>
        )}
        {isBlocked ? (
          <span
            style={{
              color: "#ff4d6a",
              fontStyle: "italic",
              fontSize: "0.82rem",
            }}
          >
            ⛔ Blocked: <em>{msg.modResult.reason}</em>. Please rephrase and try
            again.
          </span>
        ) : (
          <span style={{ fontSize: "0.82rem", lineHeight: 1.6 }}>
            {msg.content}
          </span>
        )}
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div style={{ ...styles.msgRow }}>
      <div
        style={{
          ...styles.avatar,
          background: "linear-gradient(135deg,#7c6aff,#a78bfa)",
        }}
      >
        AI
      </div>
      <div style={styles.bubble}>
        <div style={styles.thinking}>
          {[0, 0.2, 0.4].map((delay, i) => (
            <span
              key={i}
              style={{ ...styles.dot, animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LogEntry({ entry }) {
  const color = entry.safe
    ? "#3ddc84"
    : entry.score > 0.8
      ? "#ff4d6a"
      : "#ffb347";
  const label = entry.safe
    ? "✓ Safe"
    : entry.score > 0.8
      ? "✗ Blocked"
      : "⚠ Flagged";
  return (
    <div style={styles.logEntry}>
      <div style={{ color: "#6b6b80", fontSize: "0.65rem", marginBottom: 3 }}>
        {entry.time}
      </div>
      <div style={{ color, fontSize: "0.72rem", marginBottom: 3 }}>
        {label} · {entry.category}
      </div>
      <div
        style={{
          color: "#6b6b80",
          fontSize: "0.68rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {entry.text.slice(0, 44)}
        {entry.text.length > 44 ? "…" : ""}
      </div>
      <div style={styles.scoreBar}>
        <div
          style={{
            ...styles.scoreFill,
            width: `${entry.score * 100}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [log, setLog] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, safe: 0, blocked: 0 });
  const [history, setHistory] = useState([]);

  // Moderation rules state
  const [rules, setRules] = useState({
    hateSpeech: true,
    violence: true,
    adult: true,
    misinformation: true,
    personalInfo: false,
  });

  // Sensitivity thresholds state
  const [thresholds, setThresholds] = useState({
    toxicity: 0.7,
    profanity: 0.5,
    spam: 0.6,
  });

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);

    const userMsg = {
      role: "user",
      content: text,
      modResult: { checking: true },
    };
    setMessages((prev) => [...prev, userMsg]);

    const modResult = await moderateText(text);

    setMessages((prev) =>
      prev.map((m, i) => (i === prev.length - 1 ? { ...m, modResult } : m)),
    );

    const newLog = {
      text,
      safe: modResult.safe,
      score: modResult.score,
      category: modResult.category,
      time: new Date().toLocaleTimeString(),
    };
    setLog((prev) => [newLog, ...prev]);
    setStats((prev) => ({
      total: prev.total + 1,
      safe: prev.safe + (modResult.safe ? 1 : 0),
      blocked:
        prev.blocked + (!modResult.safe && modResult.score > 0.8 ? 1 : 0),
    }));

    if (!modResult.safe && modResult.score > 0.8) {
      setLoading(false);
      return;
    }

    const newHistory = [...history, { role: "user", content: text }];
    setHistory(newHistory);

    try {
      const reply = await chatWithHistory(newHistory);
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
      setMessages((prev) => [...prev, { role: "ai", content: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "⚠ Error: " + e.message },
      ]);
    }
    setLoading(false);
  }

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,300&display=swap');
        body { margin:0; background:#0c0c0f; }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#2a2a38; border-radius:4px; }
        textarea { font-family:'DM Mono',monospace; resize:none; }
        @keyframes bounce {
          0%,80%,100% { transform:translateY(0); opacity:0.4; }
          40% { transform:translateY(-6px); opacity:1; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .dot-anim { animation: bounce 1.2s infinite; }
        .msg-anim { animation: fadeUp 0.3s ease; }
        input[type=range] { accent-color:#7c6aff; cursor:pointer; width:100%; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <span style={styles.logo}>Nexus</span>
        <div style={styles.pill}>
          <div style={styles.dot} />
          Moderation Active
        </div>
      </div>

      <div style={styles.layout}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div>
            <div style={styles.sectionLabel}>Moderation Rules</div>
            {[
              ["Block Hate Speech", "hateSpeech"],
              ["Block Violence", "violence"],
              ["Block Adult Content", "adult"],
              ["Flag Misinformation", "misinformation"],
              ["Block Personal Info", "personalInfo"],
            ].map(([label, key]) => (
              <div key={key} style={styles.ruleRow}>
                <span style={{ fontSize: "0.72rem" }}>{label}</span>
                <div
                  onClick={() =>
                    setRules((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  style={{
                    ...styles.toggle,
                    background: rules[key] ? "#7c6aff" : "#2a2a38",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      ...styles.toggleKnob,
                      transform: rules[key]
                        ? "translateX(14px)"
                        : "translateX(0)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={styles.sectionLabel}>Sensitivity</div>
            {[
              ["Toxicity", "toxicity"],
              ["Profanity", "profanity"],
              ["Spam", "spam"],
            ].map(([label, key]) => (
              <div key={key} style={styles.threshRow}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.72rem",
                    color: "#6b6b80",
                    marginBottom: 5,
                  }}
                >
                  <span>{label}</span>
                  <span style={{ color: "#7c6aff" }}>{thresholds[key]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={thresholds[key]}
                  onChange={(e) =>
                    setThresholds((prev) => ({
                      ...prev,
                      [key]: parseFloat(e.target.value),
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <div>
            <div style={styles.sectionLabel}>Model</div>
            <div style={styles.modelCard}>
              <div
                style={{
                  color: "#e8e8f0",
                  marginBottom: 2,
                  fontSize: "0.72rem",
                }}
              >
                claude-sonnet-4-20250514
              </div>
              <div style={{ fontSize: "0.68rem" }}>Moderation: Built-in</div>
            </div>
          </div>
        </aside>

        {/* Chat */}
        <main style={styles.chatMain}>
          <div style={styles.messagesArea}>
            {messages.length === 0 && (
              <div style={styles.welcome}>
                <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🛡️</div>
                <div
                  style={{
                    fontFamily: "'Fraunces',serif",
                    fontSize: "1.4rem",
                    fontWeight: 300,
                    color: "#e8e8f0",
                    marginBottom: 6,
                  }}
                >
                  Moderated AI Chat
                </div>
                <div
                  style={{
                    color: "#6b6b80",
                    fontSize: "0.82rem",
                    lineHeight: 1.6,
                  }}
                >
                  Every message is screened before reaching Claude.
                  <br />
                  Harmful content is blocked automatically.
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className="msg-anim">
                <Message msg={msg} />
              </div>
            ))}
            {loading && <Thinking />}
            <div ref={bottomRef} />
          </div>

          <div style={styles.inputArea}>
            <div style={styles.inputRow}>
              <div style={styles.inputWrap}>
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Type a message…"
                  style={styles.textarea}
                />
              </div>
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                style={{
                  ...styles.sendBtn,
                  opacity: loading || !input.trim() ? 0.3 : 1,
                }}
              >
                ↑
              </button>
            </div>
          </div>
        </main>

        {/* Log panel */}
        <aside style={styles.logPanel}>
          <div style={styles.statsRow}>
            {[
              ["Total", stats.total, "#7c6aff"],
              ["Safe", stats.safe, "#3ddc84"],
              ["Blocked", stats.blocked, "#ff4d6a"],
            ].map(([lbl, val, color]) => (
              <div key={lbl} style={styles.statCard}>
                <div
                  style={{
                    fontFamily: "'Fraunces',serif",
                    fontSize: "1.4rem",
                    fontWeight: 600,
                    color,
                    lineHeight: 1,
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontSize: "0.6rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#6b6b80",
                    marginTop: 3,
                  }}
                >
                  {lbl}
                </div>
              </div>
            ))}
          </div>
          <div style={styles.sectionLabel}>Moderation Log</div>
          {log.length === 0 ? (
            <div
              style={{
                color: "#6b6b80",
                fontSize: "0.75rem",
                textAlign: "center",
                padding: "20px 0",
                fontStyle: "italic",
              }}
            >
              No messages yet
            </div>
          ) : (
            log.map((e, i) => <LogEntry key={i} entry={e} />)
          )}
        </aside>
      </div>
    </div>
  );
}

const styles = {
  root: {
    background: "#0c0c0f",
    color: "#e8e8f0",
    fontFamily: "'DM Mono',monospace",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(12,12,15,0.9)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid #2a2a38",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontFamily: "'Fraunces',serif",
    fontSize: "1.5rem",
    fontWeight: 600,
    background: "linear-gradient(135deg,#7c6aff,#ff6a8a)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  pill: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "#1c1c26",
    border: "1px solid #2a2a38",
    borderRadius: 100,
    padding: "5px 12px",
    fontSize: "0.7rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#6b6b80",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#3ddc84",
    boxShadow: "0 0 8px #3ddc84",
    animation: "pulse 2s infinite",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "260px 1fr 240px",
    flex: 1,
    height: "calc(100vh - 57px)",
  },
  sidebar: {
    borderRight: "1px solid #2a2a38",
    padding: "20px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    overflowY: "auto",
  },
  sectionLabel: {
    fontSize: "0.65rem",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#6b6b80",
    marginBottom: 10,
  },
  ruleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 10px",
    borderRadius: 8,
    background: "#13131a",
    border: "1px solid #2a2a38",
    marginBottom: 6,
  },
  toggle: {
    width: 32,
    height: 18,
    borderRadius: 100,
    position: "relative",
    transition: "background 0.2s",
    flexShrink: 0,
  },
  toggleKnob: {
    position: "absolute",
    top: 2,
    left: 2,
    width: 14,
    height: 14,
    background: "white",
    borderRadius: "50%",
    transition: "transform 0.2s",
  },
  threshRow: {
    background: "#13131a",
    border: "1px solid #2a2a38",
    borderRadius: 8,
    padding: "8px 10px",
    marginBottom: 6,
  },
  modelCard: {
    background: "#13131a",
    border: "1px solid #2a2a38",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#6b6b80",
    fontSize: "0.72rem",
  },
  chatMain: { display: "flex", flexDirection: "column", overflow: "hidden" },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  welcome: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    textAlign: "center",
    padding: "60px 40px",
  },
  msgRow: { display: "flex", gap: 12, alignItems: "flex-start" },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.65rem",
    fontWeight: 500,
    flexShrink: 0,
    color: "white",
  },
  bubble: {
    maxWidth: 520,
    padding: "12px 16px",
    borderRadius: 14,
    background: "#13131a",
    border: "1px solid #2a2a38",
    lineHeight: 1.6,
  },
  bubbleBlocked: {
    background: "rgba(255,77,106,0.08)",
    border: "1px solid rgba(255,77,106,0.3)",
  },
  bubbleWarn: {
    background: "rgba(255,179,71,0.08)",
    border: "1px solid rgba(255,179,71,0.3)",
  },
  badge: {
    safe: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: "0.65rem",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      padding: "3px 8px",
      borderRadius: 4,
      background: "rgba(61,220,132,0.12)",
      color: "#3ddc84",
    },
    warn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: "0.65rem",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      padding: "3px 8px",
      borderRadius: 4,
      background: "rgba(255,179,71,0.12)",
      color: "#ffb347",
    },
    block: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: "0.65rem",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      padding: "3px 8px",
      borderRadius: 4,
      background: "rgba(255,77,106,0.12)",
      color: "#ff4d6a",
    },
    checking: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: "0.65rem",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      padding: "3px 8px",
      borderRadius: 4,
      background: "rgba(124,106,255,0.12)",
      color: "#7c6aff",
    },
  },
  thinking: { display: "flex", gap: 5, alignItems: "center", padding: "4px 0" },
  dot: { width: 6, height: 6, background: "#6b6b80", borderRadius: "50%" },
  inputArea: {
    borderTop: "1px solid #2a2a38",
    padding: "16px 24px",
    background: "rgba(12,12,15,0.9)",
    backdropFilter: "blur(10px)",
  },
  inputRow: { display: "flex", gap: 10, alignItems: "flex-end" },
  inputWrap: {
    flex: 1,
    background: "#13131a",
    border: "1px solid #2a2a38",
    borderRadius: 12,
    padding: "12px 16px",
  },
  textarea: {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "0.82rem",
    color: "#e8e8f0",
    lineHeight: 1.5,
    maxHeight: 120,
    overflow: "auto",
  },
  sendBtn: {
    width: 44,
    height: 44,
    background: "linear-gradient(135deg,#7c6aff,#a78bfa)",
    border: "none",
    borderRadius: 10,
    color: "white",
    cursor: "pointer",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.2s",
    flexShrink: 0,
  },
  logPanel: {
    borderLeft: "1px solid #2a2a38",
    padding: "20px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 6,
    marginBottom: 6,
  },
  statCard: {
    background: "#13131a",
    border: "1px solid #2a2a38",
    borderRadius: 8,
    padding: 10,
    textAlign: "center",
  },
  logEntry: {
    background: "#13131a",
    border: "1px solid #2a2a38",
    borderRadius: 8,
    padding: "10px 12px",
    animation: "fadeUp 0.3s ease",
  },
  scoreBar: {
    height: 3,
    background: "#2a2a38",
    borderRadius: 2,
    marginTop: 6,
    overflow: "hidden",
  },
  scoreFill: { height: "100%", borderRadius: 2, transition: "width 0.5s ease" },
};
