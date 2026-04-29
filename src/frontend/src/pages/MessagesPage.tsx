import { format } from "date-fns";
import { Eye, MessageSquare, Send, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppBadge } from "../components/AppBadge";
import { AppInput } from "../components/AppInput";
import { Modal } from "../components/AppModal";
import { AppSelect } from "../components/AppSelect";
import { EmptyState } from "../components/EmptyState";
import { Layout } from "../components/Layout";
import { PageLoader } from "../components/LoadingSpinner";
import { useChapters, useMessages, useSendMessage } from "../hooks/useBackend";
import type { ChapterId, Message } from "../types";

// ── Compose Form ─────────────────────────────────────────────────────────────

interface ComposeFormState {
  subject: string;
  chapterId: ChapterId | "all";
  body: string;
}

const INITIAL_FORM: ComposeFormState = {
  subject: "",
  chapterId: "all",
  body: "",
};

function ComposeSection({
  chapters,
  onSent,
}: {
  chapters: { id: ChapterId; name: string }[];
  onSent: () => void;
}) {
  const [form, setForm] = useState<ComposeFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<ComposeFormState>>({});
  const [showPreview, setShowPreview] = useState(false);
  const sendMessage = useSendMessage();

  const chapterOptions = [
    { value: "all", label: "All Members (200)" },
    ...chapters.map((c) => ({ value: c.id, label: c.name })),
  ];

  const recipientLabel =
    form.chapterId === "all"
      ? "All Members"
      : (chapters.find((c) => c.id === form.chapterId)?.name ?? "Unknown");

  const estimatedCount = form.chapterId === "all" ? 200 : 40;

  function validate(): boolean {
    const errs: Partial<ComposeFormState> = {};
    if (!form.subject.trim()) errs.subject = "Subject is required";
    if (!form.body.trim()) errs.body = "Message body is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSend() {
    if (!validate()) return;
    try {
      await sendMessage.mutateAsync({
        senderId: "admin",
        chapterId: form.chapterId,
        subject: form.subject.trim(),
        body: form.body.trim(),
      });
      toast.success("Message sent!", {
        description: `Delivered to ${recipientLabel} (${estimatedCount} members)`,
      });
      setForm(INITIAL_FORM);
      setErrors({});
      setShowPreview(false);
      onSent();
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  }

  return (
    <section
      className="bg-card border border-border rounded-xl p-6 space-y-5"
      data-ocid="messages.compose_panel"
    >
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Send className="w-4 h-4 text-primary" />
        </div>
        <h2 className="font-display font-semibold text-foreground">
          Compose Message
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput
          label="Subject"
          placeholder="e.g. Monthly Chapter Meeting — May 2026"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          error={errors.subject}
          data-ocid="messages.subject_input"
        />
        <AppSelect
          label="Recipients"
          options={chapterOptions}
          value={form.chapterId}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              chapterId: e.target.value as ChapterId | "all",
            }))
          }
          data-ocid="messages.chapter_select"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="message-body"
          className="text-sm font-medium text-foreground"
        >
          Message Body
        </label>
        <textarea
          id="message-body"
          rows={6}
          placeholder="Write your announcement, reminder, or update here…"
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-200 resize-y min-h-[120px]"
          data-ocid="messages.body_textarea"
        />
        {errors.body && (
          <p
            className="text-xs text-destructive"
            data-ocid="messages.body_field_error"
          >
            {errors.body}
          </p>
        )}
      </div>

      {/* Preview */}
      {form.subject || form.body ? (
        <div className="border border-border rounded-lg bg-muted/30 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            data-ocid="messages.preview_toggle"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" />
              {showPreview ? "Hide preview" : "Show preview"}
            </span>
            <span className="text-xs text-muted-foreground">
              To: {recipientLabel} · {estimatedCount} recipients
            </span>
          </button>
          {showPreview && (
            <div
              className="px-4 pb-4 border-t border-border"
              data-ocid="messages.preview_section"
            >
              <p className="text-xs text-muted-foreground mt-3 mb-1 uppercase tracking-wide font-medium">
                Subject
              </p>
              <p className="text-sm font-medium text-foreground mb-3">
                {form.subject || (
                  <span className="italic text-muted-foreground">
                    No subject
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">
                Body
              </p>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {form.body || (
                  <span className="italic text-muted-foreground">
                    No content
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      ) : null}

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Sending to{" "}
          <span className="font-semibold text-foreground">
            {recipientLabel}
          </span>{" "}
          — {estimatedCount} members
        </p>
        <button
          type="button"
          onClick={handleSend}
          disabled={sendMessage.isPending}
          className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          data-ocid="messages.send_button"
        >
          <Send className="w-3.5 h-3.5" />
          {sendMessage.isPending ? "Sending…" : "Send Message"}
        </button>
      </div>
    </section>
  );
}

// ── Message Row ───────────────────────────────────────────────────────────────

function chapterLabel(
  chapterId: ChapterId | "all",
  chapters: { id: ChapterId; name: string }[],
): string {
  if (chapterId === "all") return "All Members";
  return chapters.find((c) => c.id === chapterId)?.name ?? chapterId;
}

// ── Message Detail Modal ──────────────────────────────────────────────────────

function MessageDetailModal({
  message,
  chapters,
  onClose,
}: {
  message: Message | null;
  chapters: { id: ChapterId; name: string }[];
  onClose: () => void;
}) {
  if (!message) return null;
  return (
    <Modal open={!!message} onClose={onClose} title={message.subject} size="lg">
      <div className="space-y-4" data-ocid="messages.detail_dialog">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Sent to</p>
            <p className="text-sm font-medium text-foreground">
              {chapterLabel(message.chapterId, chapters)}
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Recipients</p>
            <p className="text-sm font-medium text-foreground">
              {message.recipientCount} members
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 col-span-2">
            <p className="text-xs text-muted-foreground mb-0.5">Date sent</p>
            <p className="text-sm font-medium text-foreground">
              {format(
                new Date(message.sentAt),
                "EEEE, d MMMM yyyy 'at' h:mm a",
              )}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
            Message
          </p>
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed border border-border">
            {message.body}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── History Table ─────────────────────────────────────────────────────────────

function HistoryTable({
  messages,
  chapters,
  onSelect,
}: {
  messages: Message[];
  chapters: { id: ChapterId; name: string }[];
  onSelect: (m: Message) => void;
}) {
  if (messages.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="w-7 h-7 text-muted-foreground" />}
        title="No messages sent yet"
        description="Use the compose area above to send your first announcement to members."
      />
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-xl border border-border"
      data-ocid="messages.history_table"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Date
            </th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Subject
            </th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Recipients
            </th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Chapter
            </th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Preview
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {messages.map((msg, i) => (
            <tr
              key={msg.id}
              className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors duration-150 cursor-pointer"
              onClick={() => onSelect(msg)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && onSelect(msg)
              }
              tabIndex={0}
              aria-label={`View message: ${msg.subject}`}
              data-ocid={`messages.history_table.item.${i + 1}`}
            >
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {format(new Date(msg.sentAt), "d MMM yyyy")}
              </td>
              <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">
                {msg.subject}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                <AppBadge variant="primary">{msg.recipientCount}</AppBadge>
              </td>
              <td className="px-4 py-3">
                <AppBadge
                  variant={msg.chapterId === "all" ? "accent" : "default"}
                >
                  {chapterLabel(msg.chapterId, chapters)}
                </AppBadge>
              </td>
              <td className="px-4 py-3 text-muted-foreground max-w-[260px] truncate">
                {msg.body}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(msg);
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-200"
                  aria-label="View message"
                  data-ocid={`messages.view_button.${i + 1}`}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { data: messages, isLoading: messagesLoading } = useMessages();
  const { data: chapters = [], isLoading: chaptersLoading } = useChapters();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const isLoading = messagesLoading || chaptersLoading;
  const sortedMessages = [...(messages ?? [])].sort(
    (a, b) => b.sentAt - a.sentAt,
  );

  return (
    <Layout title="Messages">
      <div className="space-y-6" data-ocid="messages.page">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">
              Broadcast Messages
            </h1>
            <p className="text-sm text-muted-foreground">
              Send announcements and updates to chapters or all 200 members
            </p>
          </div>
        </div>

        {/* Compose */}
        <ComposeSection
          chapters={chapters}
          onSent={() => setRefreshKey((k) => k + 1)}
        />

        {/* History */}
        <section data-ocid="messages.history_section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground">
              Sent Messages
            </h2>
            {sortedMessages.length > 0 && (
              <AppBadge variant="muted">{sortedMessages.length} total</AppBadge>
            )}
          </div>

          {isLoading ? (
            <PageLoader />
          ) : (
            <HistoryTable
              key={refreshKey}
              messages={sortedMessages}
              chapters={chapters}
              onSelect={setSelectedMessage}
            />
          )}
        </section>
      </div>

      {/* Detail modal */}
      <MessageDetailModal
        message={selectedMessage}
        chapters={chapters}
        onClose={() => setSelectedMessage(null)}
      />
    </Layout>
  );
}
