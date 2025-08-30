import React, { useEffect, useRef, useState } from "react";

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

function normalizeKey(key) {
  if (key === " ") return "Space";
  const specials = new Set([
    "Enter","Backspace","Tab","Shift","Control","Alt","Meta","Escape",
    "ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Delete","Home","End"
  ]);
  if (specials.has(key)) return `[${key}]`;
  return key.length === 1 ? key : `[${key}]`;
}

export default function App() {
  const [enabled, setEnabled] = useState(true);
  const [text, setText] = useState("");
  const [logs, setLogs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ks_logs")) ?? [];
    } catch {
      return [];
    }
  });

  const areaRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("ks_logs", JSON.stringify(logs));
  }, [logs]);

  const handleKeyDown = (e) => {
    if (!enabled) return;
    const entry = {
      key: normalizeKey(e.key),
      ts: Date.now(),
    };
    setLogs((prev) => [...prev, entry]);
  };

  const clearLogs = () => setLogs([]);
  const toggle = () => setEnabled((v) => !v);

  const downloadTxt = () => {
    const lines = logs.map((x) => `${formatTime(x.ts)}\t${x.key}`);
    const file = new Blob([lines.join("\n") + "\n"], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = "keystroke_logs.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadJson = () => {
    const file = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = "keystroke_logs.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copyToClipboard = async () => {
    const lines = logs.map((x) => `${formatTime(x.ts)} ${x.key}`).join("\n");
    try {
      await navigator.clipboard.writeText(lines);
      alert("Copied logs to clipboard.");
    } catch {
      alert("Copy failed.");
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Keystroke Logger Demo (In-App Only)</h1>
        <p className="subtext">
          Type inside the box below. This demo logs only keys pressed <b>inside this page</b>.
        </p>
      </header>

      <div className="controls">
        <button className={`btn ${enabled ? "btn-on" : "btn-off"}`} onClick={toggle}>
          {enabled ? "⏸ Pause Logging" : "▶️ Resume Logging"}
        </button>
        <button className="btn" onClick={clearLogs}>🗑 Clear</button>
        <button className="btn" onClick={downloadTxt}>⬇️ Download .txt</button>
        <button className="btn" onClick={downloadJson}>⬇️ Download .json</button>
        <button className="btn" onClick={copyToClipboard}>📋 Copy</button>
      </div>

      <div className="grid">
        <section className="panel">
          <h2>Type Area</h2>
          <textarea
            ref={areaRef}
            className="area"
            placeholder="Start typing here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={8}
          />
          <p className="hint">
            Tip: try letters, numbers and special keys like Enter, Backspace, Tab.
          </p>
        </section>

        <section className="panel">
          <h2>Logged Keystrokes ({logs.length})</h2>
          <div className="logbox">
            {logs.length === 0 ? (
              <div className="empty">No keystrokes yet.</div>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="logline">
                  <span className="ts">{formatTime(l.ts)}</span>
                  <span className="key">{l.key}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <footer className="footer">
        Please use ethically and only with the user’s knowledge and consent.
      </footer>
    </div>
  );
}
