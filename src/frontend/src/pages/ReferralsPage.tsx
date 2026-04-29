import { useActor } from "@caffeineai/core-infrastructure";
import {
  AlertTriangle,
  DollarSign,
  Handshake,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import { AppBadge } from "../components/AppBadge";
import { AppInput } from "../components/AppInput";
import { Modal } from "../components/AppModal";
import { AppSelect } from "../components/AppSelect";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Layout } from "../components/Layout";
import { PageLoader } from "../components/LoadingSpinner";
import { SearchBar } from "../components/SearchBar";
import { StatsCard } from "../components/StatsCard";
import {
  useCreateReferral,
  useMembers,
  useReferrals,
  useUpdateReferralStatus,
} from "../hooks/useBackend";
import type { Member, Referral } from "../types";

// ── Status helpers ────────────────────────────────────────────────────────────

type DisplayStatus = "pending" | "in-progress" | "closed" | "declined";

const STATUS_MAP: Record<Referral["status"], DisplayStatus> = {
  pending: "pending",
  contacted: "in-progress",
  converted: "closed",
  declined: "declined",
};

const BACKEND_STATUS_MAP: Record<DisplayStatus, Referral["status"]> = {
  pending: "pending",
  "in-progress": "contacted",
  closed: "converted",
  declined: "declined",
};

const STATUS_VARIANT = {
  pending: "warning",
  "in-progress": "default",
  closed: "success",
  declined: "destructive",
} as const;

const STATUS_LABEL: Record<DisplayStatus, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  closed: "Closed",
  declined: "Declined",
};

const BUSINESS_CATEGORIES = [
  "Accounting & Finance",
  "Architecture & Design",
  "Consulting",
  "Construction & Real Estate",
  "Digital Marketing",
  "Education & Training",
  "Healthcare",
  "HR & Staffing",
  "Insurance",
  "IT & Software",
  "Legal Services",
  "Logistics & Supply Chain",
  "Manufacturing",
  "Media & Advertising",
  "Retail & E-commerce",
  "Restaurants & Hospitality",
  "Travel & Tourism",
  "Other",
];

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_REFERRALS: Referral[] = [
  {
    id: "r1",
    giverId: "m1",
    receiverId: "m2",
    chapterId: "downtown",
    businessName: "Apex Solutions Ltd",
    contactName: "Rajan Mehta",
    contactEmail: "rajan@apexsolutions.com",
    contactPhone: "+1 555-0201",
    description:
      "Needs enterprise accounting software and monthly bookkeeping.",
    status: "converted",
    value: 12000,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
  {
    id: "r2",
    giverId: "m3",
    receiverId: "m1",
    chapterId: "techhub",
    businessName: "GreenSpace Interiors",
    contactName: "Priya Sharma",
    contactEmail: "priya@greenspace.in",
    contactPhone: "+1 555-0302",
    description: "Interior redesign for new 4,000 sq ft office space.",
    status: "contacted",
    value: 45000,
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    id: "r3",
    giverId: "m2",
    receiverId: "m4",
    chapterId: "westside",
    businessName: "BrightPath Academy",
    contactName: "Marcus Obi",
    contactEmail: "marcus@brightpath.edu",
    contactPhone: "+1 555-0403",
    description: "Corporate training programs for 50-member team.",
    status: "pending",
    createdAt: Date.now() - 7 * 86400000,
    updatedAt: Date.now() - 7 * 86400000,
  },
  {
    id: "r4",
    giverId: "m4",
    receiverId: "m3",
    chapterId: "innovation-park",
    businessName: "Skyline Properties",
    contactName: "Laura Chen",
    contactEmail: "laura@skylineprop.com",
    contactPhone: "+1 555-0504",
    description: "Commercial lease management and legal review.",
    status: "declined",
    createdAt: Date.now() - 45 * 86400000,
    updatedAt: Date.now() - 40 * 86400000,
  },
  {
    id: "r5",
    giverId: "m1",
    receiverId: "m3",
    chapterId: "business-bay",
    businessName: "NovaTech Systems",
    contactName: "Ahmed Al-Farsi",
    contactEmail: "ahmed@novatech.io",
    contactPhone: "+1 555-0605",
    description: "Cloud infrastructure migration and DevOps consulting.",
    status: "contacted",
    value: 28000,
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
  },
];

const SEED_MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Anjali Kapoor",
    businessName: "Kapoor Accounting",
    industry: "Accounting & Finance",
    email: "anjali@kapooracc.com",
    phone: "+1 555-0100",
    chapterId: "downtown",
    joinedAt: Date.now() - 180 * 86400000,
    status: "active",
    badges: ["active-giver"],
  },
  {
    id: "m2",
    name: "Derek Walsh",
    businessName: "Walsh Design Studio",
    industry: "Architecture & Design",
    email: "derek@walshdesign.com",
    phone: "+1 555-0101",
    chapterId: "techhub",
    joinedAt: Date.now() - 240 * 86400000,
    status: "active",
    badges: ["top-performer"],
  },
  {
    id: "m3",
    name: "Nadia Petrov",
    businessName: "Petrov Legal Group",
    industry: "Legal Services",
    email: "nadia@petrovlegal.com",
    phone: "+1 555-0102",
    chapterId: "westside",
    joinedAt: Date.now() - 120 * 86400000,
    status: "active",
    badges: ["connector"],
  },
  {
    id: "m4",
    name: "Samuel Osei",
    businessName: "Osei Marketing",
    industry: "Digital Marketing",
    email: "samuel@oseimarketing.com",
    phone: "+1 555-0103",
    chapterId: "innovation-park",
    joinedAt: Date.now() - 90 * 86400000,
    status: "active",
    badges: ["rising-star"],
  },
];

// ── Form types ────────────────────────────────────────────────────────────────

interface ReferralFormData {
  giverId: string;
  receiverId: string;
  businessCategory: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  dealStatus: Referral["status"];
  dealValue: string;
  notes: string;
}

const EMPTY_FORM: ReferralFormData = {
  giverId: "",
  receiverId: "",
  businessCategory: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  dealStatus: "pending",
  dealValue: "",
  notes: "",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Referral["status"] }) {
  const display = STATUS_MAP[status];
  return (
    <AppBadge variant={STATUS_VARIANT[display]}>
      {STATUS_LABEL[display]}
    </AppBadge>
  );
}

function formatCurrency(value?: number) {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ts));
}

function getMemberName(members: Member[], id: string) {
  return members.find((m) => m.id === id)?.name ?? id;
}

// ── Log Referral Modal ────────────────────────────────────────────────────────

interface LogModalProps {
  open: boolean;
  onClose: () => void;
  members: Member[];
  onSubmit: (data: ReferralFormData) => Promise<void>;
  isPending: boolean;
}

function LogReferralModal({
  open,
  onClose,
  members,
  onSubmit,
  isPending,
}: LogModalProps) {
  const [form, setForm] = useState<ReferralFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ReferralFormData, string>>
  >({});

  const memberOptions = members.map((m) => ({
    value: m.id,
    label: `${m.name} — ${m.businessName}`,
  }));

  const categoryOptions = BUSINESS_CATEGORIES.map((c) => ({
    value: c,
    label: c,
  }));

  const statusOptions: { value: Referral["status"]; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "contacted", label: "In Progress" },
    { value: "converted", label: "Closed" },
    { value: "declined", label: "Declined" },
  ];

  function validate() {
    const errs: Partial<Record<keyof ReferralFormData, string>> = {};
    if (!form.giverId) errs.giverId = "Select the referral giver.";
    if (!form.receiverId) errs.receiverId = "Select the referral receiver.";
    if (form.giverId && form.receiverId && form.giverId === form.receiverId)
      errs.receiverId = "Giver and receiver must be different members.";
    if (!form.businessCategory)
      errs.businessCategory = "Select a business category.";
    if (!form.contactName.trim()) errs.contactName = "Enter a contact name.";
    if (form.dealValue && Number.isNaN(Number(form.dealValue)))
      errs.dealValue = "Enter a valid number.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    await onSubmit(form);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function field<K extends keyof ReferralFormData>(
    key: K,
    value: ReferralFormData[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        setForm(EMPTY_FORM);
        setErrors({});
      }}
      title="Log New Referral"
      description="Record a business referral between members."
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-smooth"
            data-ocid="referral.cancel_button"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="log-referral-form"
            disabled={isPending}
            className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth disabled:opacity-60"
            data-ocid="referral.submit_button"
          >
            {isPending ? "Saving…" : "Log Referral"}
          </button>
        </>
      }
    >
      <form
        id="log-referral-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppSelect
            label="Referral Giver *"
            options={memberOptions}
            placeholder="Select giver"
            value={form.giverId}
            onChange={(e) => field("giverId", e.target.value)}
            error={errors.giverId}
            data-ocid="referral.giver_select"
          />
          <AppSelect
            label="Referral Receiver *"
            options={memberOptions}
            placeholder="Select receiver"
            value={form.receiverId}
            onChange={(e) => field("receiverId", e.target.value)}
            error={errors.receiverId}
            data-ocid="referral.receiver_select"
          />
        </div>
        <AppSelect
          label="Business Category *"
          options={categoryOptions}
          placeholder="Select category"
          value={form.businessCategory}
          onChange={(e) => field("businessCategory", e.target.value)}
          error={errors.businessCategory}
          data-ocid="referral.category_select"
        />
        <AppInput
          label="Contact Name *"
          placeholder="Name of the referred contact"
          value={form.contactName}
          onChange={(e) => field("contactName", e.target.value)}
          error={errors.contactName}
          data-ocid="referral.contact_name_input"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppInput
            label="Contact Email"
            type="email"
            placeholder="email@example.com"
            value={form.contactEmail}
            onChange={(e) => field("contactEmail", e.target.value)}
            data-ocid="referral.contact_email_input"
          />
          <AppInput
            label="Contact Phone"
            type="tel"
            placeholder="+1 555-0000"
            value={form.contactPhone}
            onChange={(e) => field("contactPhone", e.target.value)}
            data-ocid="referral.contact_phone_input"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppSelect
            label="Deal Status *"
            options={statusOptions}
            value={form.dealStatus}
            onChange={(e) =>
              field("dealStatus", e.target.value as Referral["status"])
            }
            data-ocid="referral.status_select"
          />
          <AppInput
            label="Deal Value (USD)"
            type="number"
            placeholder="Optional"
            value={form.dealValue}
            onChange={(e) => field("dealValue", e.target.value)}
            error={errors.dealValue}
            hint="Estimated or actual deal value"
            data-ocid="referral.deal_value_input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="log-referral-notes"
            className="text-sm font-medium text-foreground"
          >
            Notes
          </label>
          <textarea
            id="log-referral-notes"
            value={form.notes}
            onChange={(e) => field("notes", e.target.value)}
            placeholder="Brief description or context about this referral…"
            rows={3}
            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-smooth resize-none"
            data-ocid="referral.notes_textarea"
          />
        </div>
      </form>
    </Modal>
  );
}

// ── Edit Referral Modal ───────────────────────────────────────────────────────

interface EditModalProps {
  referral: Referral | null;
  onClose: () => void;
  onSave: (
    id: string,
    status: Referral["status"],
    value?: number,
  ) => Promise<void>;
  isPending: boolean;
}

function EditReferralModal({
  referral,
  onClose,
  onSave,
  isPending,
}: EditModalProps) {
  const [status, setStatus] = useState<Referral["status"]>(
    referral?.status ?? "pending",
  );
  const [value, setValue] = useState<string>(referral?.value?.toString() ?? "");
  const [valueError, setValueError] = useState("");

  const statusOptions: { value: Referral["status"]; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "contacted", label: "In Progress" },
    { value: "converted", label: "Closed" },
    { value: "declined", label: "Declined" },
  ];

  // Sync when referral changes
  const open = !!referral;

  async function handleSave() {
    if (value && Number.isNaN(Number(value))) {
      setValueError("Enter a valid number.");
      return;
    }
    if (!referral) return;
    await onSave(referral.id, status, value ? Number(value) : undefined);
  }

  if (!referral) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Referral"
      description="Update the status and deal value for this referral."
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-smooth"
            data-ocid="referral.edit.cancel_button"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth disabled:opacity-60"
            data-ocid="referral.edit.save_button"
          >
            {isPending ? "Saving…" : "Save Changes"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <AppSelect
          label="Deal Status"
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value as Referral["status"])}
          data-ocid="referral.edit.status_select"
        />
        <AppInput
          label="Deal Value (USD)"
          type="number"
          placeholder="Optional"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setValueError("");
          }}
          error={valueError}
          data-ocid="referral.edit.deal_value_input"
        />
      </div>
    </Modal>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

interface DeleteModalProps {
  referral: Referral | null;
  members: Member[];
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isPending: boolean;
}

function DeleteReferralModal({
  referral,
  members,
  onClose,
  onConfirm,
  isPending,
}: DeleteModalProps) {
  if (!referral) return null;
  const giver = getMemberName(members, referral.giverId);
  const receiver = getMemberName(members, referral.receiverId);

  return (
    <Modal
      open={!!referral}
      onClose={onClose}
      title="Delete Referral"
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-smooth"
            data-ocid="referral.delete.cancel_button"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-5 py-2 text-sm font-semibold bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-smooth disabled:opacity-60"
            data-ocid="referral.delete.confirm_button"
          >
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <p className="text-sm text-foreground">
            Remove the referral from{" "}
            <span className="font-semibold">{giver}</span> to{" "}
            <span className="font-semibold">{receiver}</span>?
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This action cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
] as const;

type FilterTab = (typeof FILTER_TABS)[number]["value"];

export default function ReferralsPage() {
  const { actor } = useActor(createActor);

  const { data: backendReferrals, isLoading: loadingReferrals } =
    useReferrals();
  const { data: backendMembers, isLoading: loadingMembers } = useMembers();
  const createReferral = useCreateReferral();
  const updateStatus = useUpdateReferralStatus();

  // Merge seed data with backend data when no actor
  const referrals: Referral[] = useMemo(() => {
    if (!actor) return SEED_REFERRALS;
    return backendReferrals ?? [];
  }, [actor, backendReferrals]);

  const members: Member[] = useMemo(() => {
    if (!actor) return SEED_MEMBERS;
    return backendMembers ?? [];
  }, [actor, backendMembers]);

  const isLoading = actor ? loadingReferrals || loadingMembers : false;

  // UI state
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [showLogModal, setShowLogModal] = useState(false);
  const [editReferral, setEditReferral] = useState<Referral | null>(null);
  const [deleteReferral, setDeleteReferral] = useState<Referral | null>(null);
  const [localReferrals, setLocalReferrals] = useState<Referral[]>([]);

  // Combined referrals (seed + locally added)
  const allReferrals = useMemo(() => {
    const base = actor ? referrals : [...SEED_REFERRALS, ...localReferrals];
    return base;
  }, [actor, referrals, localReferrals]);

  // Stats
  const stats = useMemo(() => {
    const total = allReferrals.length;
    const pending = allReferrals.filter((r) => r.status === "pending").length;
    const closed = allReferrals.filter((r) => r.status === "converted").length;
    const totalValue = allReferrals.reduce((sum, r) => sum + (r.value ?? 0), 0);
    return { total, pending, closed, totalValue };
  }, [allReferrals]);

  // Filtered referrals
  const filtered = useMemo(() => {
    let result = allReferrals;
    if (filterTab !== "all") {
      const backendStatus = BACKEND_STATUS_MAP[filterTab];
      result = result.filter((r) => r.status === backendStatus);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => {
        const giver = getMemberName(members, r.giverId).toLowerCase();
        const receiver = getMemberName(members, r.receiverId).toLowerCase();
        return (
          giver.includes(q) ||
          receiver.includes(q) ||
          r.businessName.toLowerCase().includes(q) ||
          r.contactName.toLowerCase().includes(q)
        );
      });
    }
    return result;
  }, [allReferrals, filterTab, search, members]);

  // Handlers
  async function handleLogReferral(data: ReferralFormData) {
    const newReferral: Referral = {
      id: `r-${Date.now()}`,
      giverId: data.giverId,
      receiverId: data.receiverId,
      chapterId:
        members.find((m) => m.id === data.giverId)?.chapterId ?? "downtown",
      businessName: data.businessCategory,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      description: data.notes,
      status: data.dealStatus,
      value: data.dealValue ? Number(data.dealValue) : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (actor) {
      await createReferral.mutateAsync({
        giverId: data.giverId,
        receiverId: data.receiverId,
        chapterId: newReferral.chapterId,
        businessName: newReferral.businessName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        description: data.notes,
        status: data.dealStatus,
        value: data.dealValue ? Number(data.dealValue) : undefined,
      });
    } else {
      setLocalReferrals((prev) => [newReferral, ...prev]);
    }
    toast.success("Referral logged successfully.");
    setShowLogModal(false);
  }

  async function handleEditSave(
    id: string,
    status: Referral["status"],
    value?: number,
  ) {
    if (actor) {
      await updateStatus.mutateAsync({ id, status });
    } else {
      setLocalReferrals((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status, value, updatedAt: Date.now() } : r,
        ),
      );
      // Also update seed data clones
      const inSeed = SEED_REFERRALS.findIndex((r) => r.id === id);
      if (inSeed >= 0) {
        SEED_REFERRALS[inSeed] = {
          ...SEED_REFERRALS[inSeed],
          status,
          value,
          updatedAt: Date.now(),
        };
      }
    }
    toast.success("Referral updated.");
    setEditReferral(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteReferral) return;
    const id = deleteReferral.id;
    if (!actor) {
      setLocalReferrals((prev) => prev.filter((r) => r.id !== id));
      const inSeed = SEED_REFERRALS.findIndex((r) => r.id === id);
      if (inSeed >= 0) SEED_REFERRALS.splice(inSeed, 1);
    }
    toast.success("Referral deleted.");
    setDeleteReferral(null);
  }

  // Table columns
  const columns = [
    {
      key: "giverId",
      header: "Giver",
      render: (r: Referral) => (
        <span className="font-medium text-foreground">
          {getMemberName(members, r.giverId)}
        </span>
      ),
    },
    {
      key: "receiverId",
      header: "Receiver",
      render: (r: Referral) => getMemberName(members, r.receiverId),
    },
    {
      key: "businessName",
      header: "Business Category",
      render: (r: Referral) => (
        <span className="text-muted-foreground">{r.businessName}</span>
      ),
    },
    {
      key: "contactName",
      header: "Contact",
      render: (r: Referral) => (
        <span className="text-sm text-foreground">{r.contactName}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r: Referral) => <StatusBadge status={r.status} />,
    },
    {
      key: "value",
      header: "Deal Value",
      align: "right" as const,
      render: (r: Referral) => (
        <span className="font-mono text-xs text-foreground">
          {formatCurrency(r.value)}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (r: Referral) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(r.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right" as const,
      render: (r: Referral, index: number) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditReferral(r);
            }}
            className="px-2 py-1 text-xs font-medium text-primary border border-primary/30 rounded-md hover:bg-primary/10 transition-smooth"
            data-ocid={`referral.edit_button.${index + 1}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteReferral(r);
            }}
            className="px-2 py-1 text-xs font-medium text-destructive border border-destructive/30 rounded-md hover:bg-destructive/10 transition-smooth"
            data-ocid={`referral.delete_button.${index + 1}`}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (isLoading)
    return (
      <Layout title="Referrals">
        <PageLoader />
      </Layout>
    );

  return (
    <Layout title="Referrals">
      <div className="space-y-6" data-ocid="referrals.page">
        {/* Stats row */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          data-ocid="referrals.stats_section"
        >
          <StatsCard
            label="Total Referrals"
            value={stats.total}
            icon={<Handshake className="w-5 h-5 text-primary" />}
          />
          <StatsCard
            label="Pending"
            value={stats.pending}
            icon={<TrendingUp className="w-5 h-5 text-primary" />}
          />
          <StatsCard
            label="Closed Deals"
            value={stats.closed}
            icon={<Handshake className="w-5 h-5 text-primary" />}
          />
          <StatsCard
            label="Total Deal Value"
            value={formatCurrency(stats.totalValue)}
            icon={<DollarSign className="w-5 h-5 text-primary" />}
          />
        </div>

        {/* Toolbar */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between elevation-subtle">
          {/* Filter tabs */}
          <div
            className="flex items-center gap-1 bg-muted rounded-lg p-1"
            role="tablist"
            data-ocid="referrals.filter.tab"
          >
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={filterTab === tab.value}
                onClick={() => setFilterTab(tab.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-smooth ${
                  filterTab === tab.value
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-ocid={`referrals.filter.${tab.value}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by member or contact…"
              className="w-full sm:w-64"
            />
            <button
              type="button"
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth shrink-0"
              data-ocid="referrals.log_button"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Log Referral</span>
              <span className="sm:hidden">Log</span>
            </button>
          </div>
        </div>

        {/* Data table */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Handshake className="w-7 h-7 text-muted-foreground" />}
            title={
              search || filterTab !== "all"
                ? "No referrals match your filters"
                : "No referrals yet"
            }
            description={
              search || filterTab !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Log the first referral between members to start tracking deals."
            }
            action={
              !search && filterTab === "all" ? (
                <button
                  type="button"
                  onClick={() => setShowLogModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
                  data-ocid="referrals.empty_state_log_button"
                >
                  <PlusCircle className="w-4 h-4" />
                  Log First Referral
                </button>
              ) : undefined
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            rowKey={(r, i) => r.id ?? String(i)}
          />
        )}

        {/* Pagination info */}
        {filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Showing {filtered.length} of {allReferrals.length} referral
            {allReferrals.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Modals */}
      <LogReferralModal
        open={showLogModal}
        onClose={() => setShowLogModal(false)}
        members={members}
        onSubmit={handleLogReferral}
        isPending={createReferral.isPending}
      />

      <EditReferralModal
        referral={editReferral}
        onClose={() => setEditReferral(null)}
        onSave={handleEditSave}
        isPending={updateStatus.isPending}
      />

      <DeleteReferralModal
        referral={deleteReferral}
        members={members}
        onClose={() => setDeleteReferral(null)}
        onConfirm={handleDeleteConfirm}
        isPending={false}
      />
    </Layout>
  );
}
