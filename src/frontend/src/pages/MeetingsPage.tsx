import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { AppBadge } from "../components/AppBadge";
import { AppInput } from "../components/AppInput";
import { Modal } from "../components/AppModal";
import { AppSelect } from "../components/AppSelect";
import { EmptyState } from "../components/EmptyState";
import { Layout } from "../components/Layout";
import { PageLoader } from "../components/LoadingSpinner";
import {
  useChapters,
  useCreateMeeting,
  useMeetings,
} from "../hooks/useBackend";
import type { ChapterId, Meeting } from "../types";

// ── Seed meetings shown when backend returns empty ───────────────────────────
const SEED_MEETINGS: Meeting[] = [
  {
    id: "m1",
    title: "Downtown Weekly Networking",
    chapterId: "downtown",
    date: Date.now() + 2 * 86400000,
    location: "Grand Ballroom, Marriott Hotel",
    description: "Weekly business networking and referral exchange session.",
    status: "upcoming",
  },
  {
    id: "m2",
    title: "Tech Hub Monthly Mixer",
    chapterId: "techhub",
    date: Date.now() + 5 * 86400000,
    location: "Innovation Lab, Tech Tower Floor 12",
    description: "Monthly deep-dive into tech-sector referrals and growth.",
    status: "upcoming",
  },
  {
    id: "m3",
    title: "Westside Power Lunch",
    chapterId: "westside",
    date: Date.now() - 3 * 86400000,
    location: "The Bistro, Westside Mall",
    description: "Lunch meeting focused on retail and hospitality referrals.",
    status: "completed",
  },
  {
    id: "m4",
    title: "Innovation Park Roundtable",
    chapterId: "innovation-park",
    date: Date.now() - 7 * 86400000,
    location: "Spark Hub Conference Room B",
    description: "Startup-focused referral and collaboration session.",
    status: "completed",
  },
  {
    id: "m5",
    title: "Business Bay Executive Breakfast",
    chapterId: "business-bay",
    date: Date.now() + 10 * 86400000,
    location: "The Skyline Restaurant, Bay Tower",
    description: "Exclusive breakfast for senior business leaders.",
    status: "upcoming",
  },
];

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ts));
}

function formatTime(ts: number) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

// ── Meeting Card ─────────────────────────────────────────────────────────────
function MeetingCard({
  meeting,
  chapterName,
  index,
  onClick,
}: {
  meeting: Meeting;
  chapterName: string;
  index: number;
  onClick: () => void;
}) {
  const statusVariantMap: Record<
    Meeting["status"],
    "default" | "success" | "destructive"
  > = {
    upcoming: "default",
    completed: "success",
    cancelled: "destructive",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left bg-card border border-border rounded-xl p-5",
        "hover:border-primary/40 hover:shadow-md transition-smooth group cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      )}
      data-ocid={`meetings.item.${index}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-display font-semibold text-foreground text-sm group-hover:text-primary transition-smooth truncate flex-1 min-w-0">
          {meeting.title}
        </h3>
        <AppBadge variant={statusVariantMap[meeting.status]}>
          {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
        </AppBadge>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="w-3.5 h-3.5 text-primary/70 shrink-0" />
          <span className="truncate">{chapterName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 text-primary/70 shrink-0" />
          <span>{formatDate(meeting.date)}</span>
          <Clock className="w-3.5 h-3.5 text-primary/70 shrink-0 ml-1" />
          <span>{formatTime(meeting.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-accent/80 shrink-0" />
          <span className="truncate">{meeting.location}</span>
        </div>
        {meeting.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 pt-0.5">
            {meeting.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-border flex items-center gap-1.5 text-xs font-medium text-primary">
        <Users className="w-3.5 h-3.5" />
        <span>
          {meeting.status === "upcoming"
            ? "Mark attendance →"
            : "View attendance →"}
        </span>
      </div>
    </button>
  );
}

// ── Add Meeting Modal ─────────────────────────────────────────────────────────
interface AddMeetingForm {
  title: string;
  chapterId: string;
  date: string;
  location: string;
  description: string;
}

const EMPTY_FORM: AddMeetingForm = {
  title: "",
  chapterId: "",
  date: "",
  location: "",
  description: "",
};

function AddMeetingModal({
  open,
  onClose,
  chapterOptions,
}: {
  open: boolean;
  onClose: () => void;
  chapterOptions: { value: string; label: string }[];
}) {
  const [form, setForm] = useState<AddMeetingForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<AddMeetingForm>>({});
  const createMeeting = useCreateMeeting();

  function validate(): Partial<AddMeetingForm> {
    const e: Partial<AddMeetingForm> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.chapterId) e.chapterId = "Chapter is required";
    if (!form.date) e.date = "Date & time is required";
    if (!form.location.trim()) e.location = "Location is required";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    await createMeeting.mutateAsync({
      title: form.title.trim(),
      chapterId: form.chapterId as ChapterId,
      date: new Date(form.date).getTime(),
      location: form.location.trim(),
      description: form.description.trim(),
      status: "upcoming",
    });
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Schedule a Meeting"
      description="Fields marked * are required."
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-smooth"
            data-ocid="meetings.add_modal.cancel_button"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-meeting-form"
            disabled={createMeeting.isPending}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-smooth"
            data-ocid="meetings.add_modal.submit_button"
          >
            {createMeeting.isPending ? "Scheduling…" : "Schedule Meeting"}
          </button>
        </>
      }
    >
      <form
        id="add-meeting-form"
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        <AppInput
          label="Meeting Title *"
          placeholder="e.g. Downtown Weekly Networking"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          onBlur={() => {
            if (!form.title.trim())
              setErrors((prev) => ({ ...prev, title: "Title is required" }));
            else setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          error={errors.title}
          data-ocid="meetings.add_modal.title_input"
        />
        <AppSelect
          label="Chapter *"
          options={chapterOptions}
          placeholder="Select a chapter"
          value={form.chapterId}
          onChange={(e) =>
            setForm((f) => ({ ...f, chapterId: e.target.value }))
          }
          error={errors.chapterId}
          data-ocid="meetings.add_modal.chapter_select"
        />
        <AppInput
          label="Date & Time *"
          type="datetime-local"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          error={errors.date}
          data-ocid="meetings.add_modal.date_input"
        />
        <AppInput
          label="Location *"
          placeholder="e.g. Grand Ballroom, Marriott Hotel"
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          error={errors.location}
          data-ocid="meetings.add_modal.location_input"
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="meeting-description"
            className="text-sm font-medium text-foreground"
          >
            Description
          </label>
          <textarea
            id="meeting-description"
            rows={3}
            placeholder="Brief agenda or meeting goals…"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-smooth resize-none"
            data-ocid="meetings.add_modal.description_textarea"
          />
        </div>
      </form>
    </Modal>
  );
}

// ── MeetingsPage ─────────────────────────────────────────────────────────────
export default function MeetingsPage() {
  const navigate = useNavigate();
  const [chapterFilter, setChapterFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);

  const { data: chapters = [], isLoading: chaptersLoading } = useChapters();
  const { data: rawMeetings = [], isLoading: meetingsLoading } = useMeetings(
    chapterFilter !== "all" ? (chapterFilter as ChapterId) : undefined,
  );

  const isLoading = chaptersLoading || meetingsLoading;
  const meetings = rawMeetings.length > 0 ? rawMeetings : SEED_MEETINGS;

  const displayMeetings =
    chapterFilter === "all"
      ? meetings
      : meetings.filter((m) => m.chapterId === chapterFilter);

  const chapterMap = Object.fromEntries(chapters.map((c) => [c.id, c.name]));
  const filterOptions = [
    { value: "all", label: "All Chapters" },
    ...chapters.map((c) => ({ value: c.id, label: c.name })),
  ];
  const chapterOptions = chapters.map((c) => ({ value: c.id, label: c.name }));

  const upcomingCount = displayMeetings.filter(
    (m) => m.status === "upcoming",
  ).length;
  const completedCount = displayMeetings.filter(
    (m) => m.status === "completed",
  ).length;

  function handleMeetingClick(meetingId: string) {
    sessionStorage.setItem("selectedMeetingId", meetingId);
    navigate({ to: "/attendance" });
  }

  return (
    <Layout
      title="Meetings"
      actions={
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
          data-ocid="meetings.add_button"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Meeting</span>
        </button>
      }
    >
      <div className="space-y-6" data-ocid="meetings.page">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">Total</p>
            <p className="font-display font-bold text-2xl text-foreground">
              {displayMeetings.length}
            </p>
            <p className="text-xs text-muted-foreground">meetings</p>
          </div>
          <div className="bg-card border border-border rounded-xl px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">Upcoming</p>
            <p className="font-display font-bold text-2xl text-primary">
              {upcomingCount}
            </p>
            <p className="text-xs text-muted-foreground">scheduled</p>
          </div>
          <div className="bg-card border border-border rounded-xl px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">Completed</p>
            <p className="font-display font-bold text-2xl text-accent-foreground">
              {completedCount}
            </p>
            <p className="text-xs text-muted-foreground">held</p>
          </div>
        </div>

        {/* Chapter filter tabs */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1"
          data-ocid="meetings.chapter_filter"
        >
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setChapterFilter(opt.value)}
              className={cn(
                "shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border transition-smooth",
                chapterFilter === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
              )}
              data-ocid={`meetings.filter.${opt.value}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Meeting grid */}
        {isLoading ? (
          <PageLoader />
        ) : displayMeetings.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-7 h-7 text-muted-foreground" />}
            title="No meetings found"
            description="Schedule the first meeting for this chapter to get started."
            action={
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
                data-ocid="meetings.empty_state"
              >
                <Plus className="w-4 h-4" />
                Schedule Meeting
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayMeetings.map((meeting, i) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                chapterName={chapterMap[meeting.chapterId] ?? meeting.chapterId}
                index={i + 1}
                onClick={() => handleMeetingClick(meeting.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AddMeetingModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        chapterOptions={chapterOptions}
      />
    </Layout>
  );
}
