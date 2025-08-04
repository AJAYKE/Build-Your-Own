import { css } from "@emotion/react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

const windowStyle = css`
  display: flex;
  flex-direction: column;
  height: 70vh;
`;

const messagesStyle = css`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
`;

const bubbleStyle = (isUser: boolean) => css`
  display: inline-block;
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 16px;
  background-color: ${isUser ? "#DCF8C6" : "#ECECEC"};
  align-self: ${isUser ? "flex-end" : "flex-start"};
  max-width: 80%;
  word-break: break-word;
`;

const inputContainer = css`
  display: flex;
  gap: 8px;
`;

const inputStyle = css`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
`;

const buttonStyle = css`
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const sendQuestion = async () => {
    if (!input.trim()) return;
    const question = input;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");

    try {
      const postRes = await axios.post("http://localhost:8743/query", {
        question,
        session_id: sessionId,
      });
      console.log("API Response:", postRes.data);

      const responseData =
        typeof postRes.data === "string"
          ? JSON.parse(postRes.data)
          : postRes.data;
      const { session_id: newSession, chat_id: newChat } = responseData;

      if (!newChat) {
        console.error("chat_id is missing in the response");
        return;
      }

      setSessionId(newSession);

      eventSourceRef.current?.close();

      const streamUrl = `http://localhost:8743/query/stream?chat_id=${newChat}`;
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      let fullAnswer = "";
      setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

      es.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.token) {
            fullAnswer += payload.token;
            setMessages((prev) => {
              const updated = [...prev];
              const idx = updated.findIndex(
                (m) => m.role === "assistant" && m.text === ""
              );
              if (idx >= 0) {
                updated[idx].text = fullAnswer;
              } else {
                updated.push({ role: "assistant", text: fullAnswer });
              }
              return updated;
            });
          }
        } catch (err) {
          console.error("Failed to parse SSE data", err);
        }
      };

      es.onerror = () => {
        es.close();
      };
    } catch (error) {
      console.error("Error in sendQuestion:", error);
    }
  };

  return (
    <div css={windowStyle}>
      <div css={messagesStyle}>
        {messages.map((m, i) => (
          <div key={i} css={bubbleStyle(m.role === "user")}>
            {m.text}
          </div>
        ))}
      </div>

      <div css={inputContainer}>
        <input
          css={inputStyle}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
          placeholder="Ask anything..."
        />
        <button css={buttonStyle} onClick={sendQuestion}>
          Send
        </button>
      </div>
    </div>
  );
}
