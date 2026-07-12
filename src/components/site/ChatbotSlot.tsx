/**
 * Floating chatbot mount slot.
 *
 * Phase 1: this is an inert anchor sized & positioned for a future chatbot.
 * Phase 2 (when the chatbot is chosen) will mount the provider's widget into
 * `#chatbot-root` OR replace the body of this component with the widget's
 * React component. Keeping the slot consistent means the layout never shifts
 * when the bot is wired in, and we can later swap providers (WhatsApp,
 * Intercom, custom GPT) without touching pages.
 */
export function ChatbotSlot() {
  return (
    <div
      id="chatbot-root"
      aria-hidden="true"
      className="fixed bottom-4 right-4 z-40 pointer-events-none"
      // pointer-events:none until a real widget mounts and re-enables them
      style={{ width: 0, height: 0 }}
    />
  );
}
