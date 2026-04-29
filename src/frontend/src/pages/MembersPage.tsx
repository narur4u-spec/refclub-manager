import { cn } from "@/lib/utils";
import { Edit2, Plus, Trash2, Upload, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppBadge } from "../components/AppBadge";
import { AppInput } from "../components/AppInput";
import { Modal } from "../components/AppModal";
import { AppSelect } from "../components/AppSelect";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Layout } from "../components/Layout";
import { PageLoader } from "../components/LoadingSpinner";
import { MemberImportModal } from "../components/MemberImportModal";
import {
  useChapters,
  useCreateMember,
  useMembers,
  useUpdateMember,
} from "../hooks/useBackend";
import type { ChapterId, Member } from "../types";

// ── Seed data so the page looks populated on first load ──────────────────────

const SEED_MEMBERS: Member[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    businessName: "Mitchell Law Group",
    industry: "Legal Services",
    email: "sarah@mitchelllaw.com",
    phone: "555-0101",
    chapterId: "downtown",
    joinedAt: 1680000000000,
    status: "active",
    badges: ["top-performer"],
  },
  {
    id: "2",
    name: "James Thornton",
    businessName: "Thornton Realty",
    industry: "Real Estate",
    email: "james@thorntonrealty.com",
    phone: "555-0102",
    chapterId: "downtown",
    joinedAt: 1681000000000,
    status: "active",
    badges: ["active-giver"],
  },
  {
    id: "3",
    name: "Priya Sharma",
    businessName: "Sharma Tech Solutions",
    industry: "IT Consulting",
    email: "priya@sharmatech.io",
    phone: "555-0103",
    chapterId: "techhub",
    joinedAt: 1682000000000,
    status: "active",
    badges: ["rising-star"],
  },
  {
    id: "4",
    name: "Carlos Mendez",
    businessName: "Mendez Financial",
    industry: "Financial Planning",
    email: "carlos@mendezfin.com",
    phone: "555-0104",
    chapterId: "techhub",
    joinedAt: 1683000000000,
    status: "active",
    badges: ["connector"],
  },
  {
    id: "5",
    name: "Linda Park",
    businessName: "Park Design Studio",
    industry: "Graphic Design",
    email: "linda@parkdesign.co",
    phone: "555-0105",
    chapterId: "westside",
    joinedAt: 1684000000000,
    status: "active",
    badges: ["ambassador"],
  },
  {
    id: "6",
    name: "Robert Chen",
    businessName: "Chen Accounting",
    industry: "Accounting",
    email: "robert@chenaccounting.com",
    phone: "555-0106",
    chapterId: "westside",
    joinedAt: 1685000000000,
    status: "active",
    badges: [],
  },
  {
    id: "7",
    name: "Amanda Foster",
    businessName: "Foster Marketing",
    industry: "Marketing",
    email: "amanda@fostermarketing.com",
    phone: "555-0107",
    chapterId: "innovation-park",
    joinedAt: 1686000000000,
    status: "inactive",
    badges: [],
  },
  {
    id: "8",
    name: "David Kim",
    businessName: "Kim Construction",
    industry: "Construction",
    email: "david@kimconstruction.com",
    phone: "555-0108",
    chapterId: "innovation-park",
    joinedAt: 1687000000000,
    status: "active",
    badges: ["top-performer", "active-giver"],
  },
  {
    id: "9",
    name: "Rachel Torres",
    businessName: "Torres Insurance",
    industry: "Insurance",
    email: "rachel@torresins.com",
    phone: "555-0109",
    chapterId: "business-bay",
    joinedAt: 1688000000000,
    status: "active",
    badges: [],
  },
  {
    id: "10",
    name: "Michael Wong",
    businessName: "Wong Dental",
    industry: "Healthcare",
    email: "michael@wongdental.com",
    phone: "555-0110",
    chapterId: "business-bay",
    joinedAt: 1689000000000,
    status: "active",
    badges: ["connector"],
  },
];

// ── Form state ────────────────────────────────────────────────────────────────

interface MemberFormData {
  name: string;
  businessName: string;
  businessCategory: string;
  email: string;
  phone: string;
  website: string;
  chapterId: ChapterId | "";
}

const EMPTY_FORM: MemberFormData = {
  name: "",
  businessName: "",
  businessCategory: "",
  email: "",
  phone: "",
  website: "",
  chapterId: "",
};

type FormErrors = Partial<Record<keyof MemberFormData, string>>;

function validateForm(data: MemberFormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = "Name is required";
  if (!data.businessName.trim())
    errors.businessName = "Business name is required";
  if (!data.businessCategory.trim())
    errors.businessCategory = "Category is required";
  if (!data.email.trim()) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(data.email))
    errors.email = "Enter a valid email";
  if (!data.chapterId) errors.chapterId = "Chapter is required";
  return errors;
}

// ── Confirm delete dialog ─────────────────────────────────────────────────────

function ConfirmDeleteDialog({
  open,
  member,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  member: Member | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Remove Member"
      description={`Are you sure you want to remove ${member?.name ?? "this member"} from the club? This action cannot be undone.`}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-muted hover:bg-muted/70 transition-smooth"
            data-ocid="members.cancel_button"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-destructive hover:bg-destructive/90 transition-smooth"
            data-ocid="members.confirm_button"
          >
            Remove Member
          </button>
        </>
      }
    >
      <div />
    </Modal>
  );
}

// ── Member form modal ─────────────────────────────────────────────────────────

function MemberFormModal({
  open,
  onClose,
  initial,
  chapterOptions,
  onSave,
  isSaving,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Member | null;
  chapterOptions: { value: string; label: string }[];
  onSave: (data: MemberFormData) => void;
  isSaving: boolean;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState<MemberFormData>(() =>
    initial
      ? {
          name: initial.name,
          businessName: initial.businessName,
          businessCategory: initial.industry,
          email: initial.email,
          phone: initial.phone,
          website: "",
          chapterId: initial.chapterId,
        }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof MemberFormData, boolean>>
  >({});

  // Reset form when modal opens with new initial state
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name,
              businessName: initial.businessName,
              businessCategory: initial.industry,
              email: initial.email,
              phone: initial.phone,
              website: "",
              chapterId: initial.chapterId,
            }
          : EMPTY_FORM,
      );
      setErrors({});
      setTouched({});
    }
  }

  const set = (field: keyof MemberFormData, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (touched[field]) {
      const newForm = { ...form, [field]: value };
      const newErrors = validateForm(newForm);
      setErrors((p) => ({ ...p, [field]: newErrors[field] }));
    }
  };

  const blur = (field: keyof MemberFormData) => {
    setTouched((p) => ({ ...p, [field]: true }));
    const newErrors = validateForm(form);
    setErrors((p) => ({ ...p, [field]: newErrors[field] }));
  };

  const handleSubmit = () => {
    const allTouched = Object.fromEntries(
      Object.keys(EMPTY_FORM).map((k) => [k, true]),
    ) as Partial<Record<keyof MemberFormData, boolean>>;
    setTouched(allTouched);
    const newErrors = validateForm(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSave(form);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Member" : "Add New Member"}
      description={
        isEdit
          ? "Update member details below."
          : "Fill in the member's business details to add them to the club."
      }
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-muted hover:bg-muted/70 transition-smooth"
            data-ocid="members.form.cancel_button"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-smooth",
              isSaving && "opacity-60 cursor-not-allowed",
            )}
            data-ocid="members.form.submit_button"
          >
            {isSaving ? "Saving…" : isEdit ? "Save Changes" : "Add Member"}
          </button>
        </>
      }
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        data-ocid="members.form.dialog"
      >
        <AppInput
          label="Full Name *"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          onBlur={() => blur("name")}
          placeholder="e.g. Sarah Mitchell"
          error={errors.name}
          data-ocid="members.form.name.input"
        />
        <AppInput
          label="Business Name *"
          value={form.businessName}
          onChange={(e) => set("businessName", e.target.value)}
          onBlur={() => blur("businessName")}
          placeholder="e.g. Mitchell Law Group"
          error={errors.businessName}
          data-ocid="members.form.businessname.input"
        />
        <AppInput
          label="Business Category *"
          value={form.businessCategory}
          onChange={(e) => set("businessCategory", e.target.value)}
          onBlur={() => blur("businessCategory")}
          placeholder="e.g. Legal Services"
          error={errors.businessCategory}
          data-ocid="members.form.category.input"
        />
        <AppInput
          label="Email *"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          onBlur={() => blur("email")}
          placeholder="name@business.com"
          error={errors.email}
          data-ocid="members.form.email.input"
        />
        <AppInput
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="555-0100"
          data-ocid="members.form.phone.input"
        />
        <AppInput
          label="Website"
          type="url"
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
          placeholder="https://yourbusiness.com"
          data-ocid="members.form.website.input"
        />
        <div className="sm:col-span-2">
          <AppSelect
            label="Chapter *"
            value={form.chapterId}
            onChange={(e) => set("chapterId", e.target.value)}
            onBlur={() => blur("chapterId")}
            options={chapterOptions}
            placeholder="Select a chapter…"
            error={errors.chapterId}
            data-ocid="members.form.chapter.select"
          />
        </div>
      </div>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MembersPage() {
  const { data: backendMembers, isLoading } = useMembers();
  const { data: chapters = [] } = useChapters();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();

  // Use seed data when backend returns empty
  const allMembers: Member[] = useMemo(
    () =>
      backendMembers && backendMembers.length > 0
        ? backendMembers
        : SEED_MEMBERS,
    [backendMembers],
  );

  // Local state for optimistic add/edit/delete
  const [localMembers, setLocalMembers] = useState<Member[]>([]);
  const members = useMemo(
    () => (localMembers.length > 0 ? localMembers : allMembers),
    [localMembers, allMembers],
  );

  const [search, setSearch] = useState("");
  const [chapterFilter, setChapterFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const chapterOptions = chapters.map((c) => ({ value: c.id, label: c.name }));
  const chapterFilterOptions = [
    { value: "", label: "All Chapters" },
    ...chapterOptions,
  ];

  const chapterMap = useMemo(
    () => Object.fromEntries(chapters.map((c) => [c.id, c.name])),
    [chapters],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return members.filter((m) => {
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.businessName.toLowerCase().includes(q) ||
        m.industry.toLowerCase().includes(q);
      const matchChapter = !chapterFilter || m.chapterId === chapterFilter;
      return matchSearch && matchChapter;
    });
  }, [members, search, chapterFilter]);

  const activeCount = members.filter((m) => m.status === "active").length;

  const openAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (member: Member) => {
    setEditTarget(member);
    setModalOpen(true);
  };

  const handleSave = async (data: MemberFormData) => {
    setIsSaving(true);
    try {
      if (editTarget) {
        const updated: Member = {
          ...editTarget,
          name: data.name,
          businessName: data.businessName,
          industry: data.businessCategory,
          email: data.email,
          phone: data.phone,
          chapterId: data.chapterId as ChapterId,
        };
        await updateMember.mutateAsync(updated);
        setLocalMembers((prev) =>
          (prev.length > 0 ? prev : allMembers).map((m) =>
            m.id === editTarget.id ? updated : m,
          ),
        );
      } else {
        const newMember: Member = {
          id: String(Date.now()),
          name: data.name,
          businessName: data.businessName,
          industry: data.businessCategory,
          email: data.email,
          phone: data.phone,
          chapterId: data.chapterId as ChapterId,
          joinedAt: Date.now(),
          status: "active",
          badges: [],
        };
        await createMember.mutateAsync({
          name: newMember.name,
          businessName: newMember.businessName,
          industry: newMember.industry,
          email: newMember.email,
          phone: newMember.phone,
          chapterId: newMember.chapterId,
          status: newMember.status,
          avatarUrl: undefined,
        });
        setLocalMembers((prev) => [
          ...(prev.length > 0 ? prev : allMembers),
          newMember,
        ]);
      }
      setModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setLocalMembers((prev) =>
      (prev.length > 0 ? prev : allMembers).filter(
        (m) => m.id !== deleteTarget.id,
      ),
    );
    setDeleteTarget(null);
  };

  const columns = [
    {
      key: "name",
      header: "Member",
      render: (m: Member) => (
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-foreground truncate">{m.name}</span>
          <span className="text-xs text-muted-foreground truncate">
            {m.email}
          </span>
        </div>
      ),
    },
    {
      key: "businessName",
      header: "Business",
      render: (m: Member) => (
        <div className="flex flex-col min-w-0">
          <span className="truncate">{m.businessName}</span>
          <span className="text-xs text-muted-foreground truncate">
            {m.industry}
          </span>
        </div>
      ),
    },
    {
      key: "chapterId",
      header: "Chapter",
      render: (m: Member) => (
        <AppBadge variant="outline">
          {chapterMap[m.chapterId] ?? m.chapterId}
        </AppBadge>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (m: Member) => (
        <span className="text-muted-foreground">{m.phone || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center" as const,
      render: (m: Member) => (
        <AppBadge variant={m.status === "active" ? "success" : "muted"}>
          {m.status === "active" ? "Active" : "Inactive"}
        </AppBadge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (m: Member, idx: number) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(m);
            }}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-smooth"
            aria-label={`Edit ${m.name}`}
            data-ocid={`members.edit_button.${idx + 1}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(m);
            }}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-smooth"
            aria-label={`Remove ${m.name}`}
            data-ocid={`members.delete_button.${idx + 1}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const headerActions = (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
        <Users className="w-3.5 h-3.5 text-primary" />
        <span
          className="text-xs font-semibold text-primary"
          data-ocid="members.count_badge"
        >
          {activeCount} active · {members.length} total
        </span>
      </div>
      <button
        type="button"
        onClick={() => setImportOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground bg-muted hover:bg-muted/70 border border-border transition-smooth"
        data-ocid="members.import_button"
      >
        <Upload className="w-4 h-4" />
        Import Members
      </button>
      <button
        type="button"
        onClick={openAdd}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-smooth"
        data-ocid="members.add_button"
      >
        <Plus className="w-4 h-4" />
        Add Member
      </button>
    </div>
  );

  return (
    <Layout title="Members" actions={headerActions}>
      <div className="space-y-4" data-ocid="members.page">
        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <div className="relative flex items-center">
              <svg
                className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, business, or category…"
                className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-card transition-smooth"
                data-ocid="members.search_input"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 p-1 rounded text-muted-foreground hover:text-foreground transition-smooth"
                  aria-label="Clear search"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="sm:w-52">
            <AppSelect
              options={chapterFilterOptions}
              value={chapterFilter}
              onChange={(e) => setChapterFilter(e.target.value)}
              placeholder="All Chapters"
              data-ocid="members.chapter.select"
            />
          </div>
        </div>

        {/* Table / states */}
        {isLoading ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="w-7 h-7 text-muted-foreground" />}
            title={
              search || chapterFilter ? "No members found" : "No members yet"
            }
            description={
              search || chapterFilter
                ? "Try adjusting your search or filter."
                : "Add your first member to get started."
            }
            action={
              !search && !chapterFilter ? (
                <button
                  type="button"
                  onClick={openAdd}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-smooth"
                  data-ocid="members.empty_state_add_button"
                >
                  <Plus className="w-4 h-4" />
                  Add First Member
                </button>
              ) : undefined
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            rowKey={(m) => m.id}
            onRowClick={openEdit}
          />
        )}
      </div>

      {/* Add / Edit modal */}
      <MemberFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editTarget}
        chapterOptions={chapterOptions}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Delete confirm dialog */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        member={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Import members modal */}
      <MemberImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          setImportOpen(false);
          toast.success("Members imported successfully!");
        }}
      />
    </Layout>
  );
}
