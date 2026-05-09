// ============================================================
// Chatbot Component - Intelligent Education Consultant
// ============================================================

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { sanitizeHtml } from "../lib/sanitize";
import {
  processMessage,
  createInitialContext,
  type BotResponse,
  type ConversationContext,
  type CollegeCard,
  type QuickAction,
} from "../lib/chatbot-engine";

interface Message {
  id: number;
  text: string;
  type: "bot" | "user";
  cards?: CollegeCard[];
  quickActions?: QuickAction[];
}

let messageIdCounter = 0;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<ConversationContext>(createInitialContext);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Show initial greeting on first open
  const [hasGreeted, setHasGreeted] = useState(false);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addMessage = useCallback(
    (text: string, type: "bot" | "user", cards?: CollegeCard[], quickActions?: QuickAction[]) => {
      const id = ++messageIdCounter;
      setMessages((prev) => [...prev, { id, text, type, cards, quickActions }]);
      return id;
    },
    []
  );

  const handleQuickAction = useCallback(
    async (action: QuickAction) => {
      switch (action.action) {
        case "navigate":
          if (action.value) {
            setIsOpen(false);
            if (action.value.startsWith("/#")) {
              const el = document.getElementById(action.value.slice(2));
              el?.scrollIntoView({ behavior: "smooth" });
            } else {
              navigate(action.value);
            }
          }
          break;
        case "call":
          if (action.value) {
            window.location.href = `tel:${action.value}`;
          }
          break;
        case "intent":
        case "recommend":
          if (action.value) {
            // Simulate user sending this intent
            addMessage(action.label, "user");
            setIsTyping(true);
            try {
              const { response, updatedContext } = await processMessage(
                action.value,
                context
              );
              setContext(updatedContext);
              setTimeout(() => {
                setIsTyping(false);
                addMessage(response.text, "bot", response.cards, response.quickActions);
              }, 600);
            } catch {
              setIsTyping(false);
              addMessage(
                "Sorry, something went wrong. Please try again.",
                "bot"
              );
            }
          }
          break;
        case "collect":
          // Handle lead collection
          break;
      }
    },
    [addMessage, context, navigate]
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;

    addMessage(text, "user");
    setInput("");
    setIsTyping(true);

    try {
      const { response, updatedContext } = await processMessage(text, context);
      setContext(updatedContext);
      setTimeout(() => {
        setIsTyping(false);
        addMessage(response.text, "bot", response.cards, response.quickActions);
      }, 800);
    } catch {
      setIsTyping(false);
      addMessage("Sorry, I encountered an error. Please try again.", "bot");
    }
  }, [input, addMessage, context]);

  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    if (!hasGreeted) {
      setHasGreeted(true);
      setIsTyping(true);
      try {
        const { response, updatedContext } = await processMessage("hello", context);
        setContext(updatedContext);
        setTimeout(() => {
          setIsTyping(false);
          addMessage(response.text, "bot", response.cards, response.quickActions);
        }, 600);
      } catch {
        setIsTyping(false);
        addMessage(
          "Hello! I'm MagnmaBot. How can I help you today?",
          "bot"
        );
      }
    }
  }, [hasGreeted, context, addMessage]);

  return (
    <div className="chatbot-widget">
      {/* Chat Bubble */}
      <div
        className={`chat-bubble ${isOpen ? "hidden" : ""}`}
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        aria-label="Open chat"
        onKeyDown={(e) => e.key === "Enter" && handleOpen()}
      >
        <img src="/assets/images/chatbot3.png" alt="MagnmaBot" />
      </div>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? "active" : ""}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-content">
            <img
              src="/assets/images/chatbot3.png"
              alt="MagnmaBot"
              className="chat-header-avatar"
            />
            <div>
              <h3>MagnmaBot</h3>
              <small>{isTyping ? "Typing..." : "Online"}</small>
            </div>
          </div>
          <button
            className="chat-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="chat-body" ref={chatBodyRef}>
          {messages.map((msg) => (
            <div key={msg.id} className="message-group">
              <div className={`message-line ${msg.type}-line`}>
                {msg.type === "bot" && (
                  <img
                    src="/assets/images/chatbot3.png"
                    alt="Bot"
                    className="bot-avatar"
                  />
                )}
                <div
                  className={`chat-message ${msg.type}-message`}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.text) }}
                />
              </div>

              {/* College Cards */}
              {msg.cards && msg.cards.length > 0 && (
                <div className="chat-cards">
                  {msg.cards.map((card) => (
                    <div key={card.id} className="chat-college-card">
                      <img
                        src={card.image}
                        alt={card.name}
                        className="chat-card-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/60x60/0a4d68/FFF?text=College";
                        }}
                      />
                      <div className="chat-card-content">
                        <strong className="chat-card-title">{card.name}</strong>
                        <p className="chat-card-location">📍 {card.location}</p>
                        <p className="chat-card-ranking">🏆 {card.ranking}</p>
                        <p className="chat-card-courses">
                          📚 {card.courses.slice(0, 3).join(", ")}
                        </p>
                        <button
                          className="chat-card-btn"
                          onClick={() => {
                            setIsOpen(false);
                            navigate(`/college/${card.id}`);
                          }}
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              {msg.quickActions && msg.quickActions.length > 0 && (
                <div className="quick-actions">
                  {msg.quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      className="quick-action-btn"
                      onClick={() => handleQuickAction(action)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="message-line bot-line">
              <img
                src="/assets/images/chatbot3.png"
                alt="Bot"
                className="bot-avatar"
              />
              <div className="chat-message bot-message typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <input
            type="text"
            placeholder="Ask about colleges, courses, admissions..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            aria-label="Chat input"
          />
          <button onClick={handleSend} aria-label="Send message">
            <i className="fa fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
