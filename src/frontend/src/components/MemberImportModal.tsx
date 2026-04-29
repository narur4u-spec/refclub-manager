import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useChapters, useImportMembers } from "../hooks/useBackend";
import type { MemberImport } from "../types";
import { Modal } from "./AppModal";
import { AppSelect } from "./AppSelect";

// ── Constants ─────────────────────────────────────────────────────────────────

const CHAPTER_SEED = [
  { id: "downtown", name: "Downtown" },
  { id: "techhub", name: "Tech Hub" },
  { id: "westside", name: "Westside" },
  { id: "innovation-park", name: "Innovation Park" },
  { id: "business-bay", name: "Business Bay" },
];

const EXPECTED_FIELDS: {
  key: keyof MemberImport;
  label: string;
  required: boolean;
}[] = [
  { key: "name", label: "Full Name", required: true },
  { key: "businessName", label: "Business Name", required: false },
  { key: "businessCategory", label: "Business Category", required: false },
  { key: "email", label: "Email", required: false },
  { key: "phone", label: "Phone", required: false },
  { key: "website", label: "Website", required: false },
  { key: "chapterId", label: "Chapter", required: true },
];

// ── CSV parsing ────────────────────────────────────────────────────────────────

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(nonEmpty[0]);
  const rows = nonEmpty.slice(1).map(parseLine);
  return { headers, rows };
}

// ── Chapter resolution ─────────────────────────────────────────────────────────

const CHAPTER_INDEX: Record<string, string> = {};
// pre-build lookup once (by name lower and by index 1-5)
for (let i = 0; i < CHAPTER_SEED.length; i++) {
  const ch = CHAPTER_SEED[i];
  CHAPTER_INDEX[ch.name.toLowerCase()] = ch.id;
  CHAPTER_INDEX[String(i + 1)] = ch.id;
  CHAPTER_INDEX[ch.id.toLowerCase()] = ch.id;
}

function resolveChapterId(raw: string, chapters: typeof CHAPTER_SEED): string {
  if (!raw) return "";
  const lower = raw.trim().toLowerCase();
  // Check dynamic chapters
  for (const ch of chapters) {
    if (ch.name.toLowerCase() === lower || ch.id.toLowerCase() === lower)
      return ch.id;
  }
  // fallback to static index
  return CHAPTER_INDEX[lower] ?? "";
}

// ── Auto-detect column mapping ─────────────────────────────────────────────────

const HEADER_ALIASES: Record<keyof MemberImport, string[]> = {
  name: ["name", "full name", "fullname", "member name", "membername"],
  businessName: [
    "business name",
    "businessname",
    "business",
    "company",
    "company name",
  ],
  businessCategory: [
    "category",
    "business category",
    "businesscategory",
    "industry",
    "type",
  ],
  email: ["email", "email address", "e-mail"],
  phone: ["phone", "phone number", "phonenumber", "mobile", "tel"],
  website: ["website", "web", "url", "site"],
  chapterId: ["chapter", "chapter id", "chapterid", "chapter name", "group"],
};

function autoDetect(headers: string[]): Record<keyof MemberImport, string> {
  const mapping = {} as Record<keyof MemberImport, string>;
  for (const field of EXPECTED_FIELDS) {
    const aliases = HEADER_ALIASES[field.key];
    const found = headers.find((h) => aliases.includes(h.toLowerCase()));
    mapping[field.key] = found ?? "";
  }
  return mapping;
}

// ── Types ──────────────────────────────────────────────────────────────────────

type Step = "upload" | "preview" | "result";

interface ParsedCSV {
  headers: string[];
  rows: string[][];
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface MemberImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function MemberImportModal({
  isOpen,
  onClose,
  onSuccess,
}: MemberImportModalProps) {
  const { data: chapters = CHAPTER_SEED } = useChapters();
  const importMutation = useImportMembers();

  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedCSV | null>(null);
  const [mapping, setMapping] = useState<Record<keyof MemberImport, string>>(
    {} as Record<keyof MemberImport, string>,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [mutationError, setMutationError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("upload");
    setFileName("");
    setParsed(null);
    setMapping({} as Record<keyof MemberImport, string>);
    setIsDragging(false);
    setParseError("");
    setResult(null);
    setMutationError("");
    importMutation.reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      setParseError("Please select a valid .csv file.");
      return;
    }
    setParseError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);
      if (headers.length === 0) {
        setParseError("CSV appears to be empty.");
        return;
      }
      setParsed({ headers, rows });
      setMapping(autoDetect(headers));
      setStep("preview");
    };
    reader.onerror = () => setParseError("Could not read the file.");
    reader.readAsText(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const colOptions = (parsed?.headers ?? []).map((h) => ({
    value: h,
    label: h,
  }));
  const colOptionsWithEmpty = [{ value: "", label: "— skip —" }, ...colOptions];

  // Build MemberImport rows from CSV + mapping
  const buildMembers = (): {
    members: MemberImport[];
    skippedCount: number;
    validationErrors: string[];
  } => {
    if (!parsed) return { members: [], skippedCount: 0, validationErrors: [] };
    const members: MemberImport[] = [];
    const validationErrors: string[] = [];
    let skipped = 0;

    for (let i = 0; i < parsed.rows.length; i++) {
      const row = parsed.rows[i];
      const get = (field: keyof MemberImport) => {
        const col = mapping[field];
        if (!col) return "";
        const idx = parsed.headers.indexOf(col);
        return idx >= 0 ? (row[idx] ?? "").trim() : "";
      };

      const name = get("name");
      const chapterRaw = get("chapterId");
      const chapterId = resolveChapterId(
        chapterRaw,
        chapters as typeof CHAPTER_SEED,
      );

      if (!name) {
        validationErrors.push(`Row ${i + 2}: missing name — skipped`);
        skipped++;
        continue;
      }
      if (!chapterId) {
        validationErrors.push(
          `Row ${i + 2} (${name}): unrecognized chapter "${chapterRaw}" — skipped`,
        );
        skipped++;
        continue;
      }

      members.push({
        name,
        businessName: get("businessName"),
        businessCategory: get("businessCategory"),
        email: get("email"),
        phone: get("phone"),
        website: get("website"),
        chapterId,
      });
    }

    return { members, skippedCount: skipped, validationErrors };
  };

  const handleImport = async () => {
    setMutationError("");
    const { members, skippedCount, validationErrors } = buildMembers();
    if (members.length === 0 && skippedCount === 0) {
      setMutationError("No rows to import.");
      return;
    }

    try {
      const res = await importMutation.mutateAsync(members);
      const importedCount = Number(res.imported);
      const totalSkipped = skippedCount + Number(res.skipped);
      const allErrors = [...validationErrors, ...res.errors];
      setResult({
        imported: importedCount,
        skipped: totalSkipped,
        errors: allErrors,
      });
      setStep("result");
      if (importedCount > 0) {
        onSuccess(importedCount);
      }
    } catch (err) {
      setMutationError(
        err instanceof Error ? err.message : "Import failed. Please try again.",
      );
    }
  };

  const { members: _previewMembers, validationErrors: previewErrors } = parsed
    ? buildMembers()
    : { members: [], validationErrors: [] };
  const totalRows = parsed?.rows.length ?? 0;
  const invalidCount = previewErrors.length;
  const validCount = totalRows - invalidCount;

  // ── Render ──────────────────────────────────────────────────────────────────

  const modalTitle =
    step === "upload"
      ? "Import Members from CSV"
      : step === "preview"
        ? `Preview Import — ${fileName}`
        : "Import Complete";

  const modalDesc =
    step === "upload"
      ? "Upload a CSV file to bulk-import up to 200 members at once."
      : step === "preview"
        ? "Map CSV columns to member fields, then click Import."
        : undefined;

  const footer =
    step === "upload" ? (
      <button
        type="button"
        onClick={handleClose}
        className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-muted hover:bg-muted/70 transition-smooth"
        data-ocid="import.cancel_button"
      >
        Cancel
      </button>
    ) : step === "preview" ? (
      <>
        <button
          type="button"
          onClick={() => {
            setStep("upload");
            setParsed(null);
          }}
          className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-muted hover:bg-muted/70 transition-smooth"
          data-ocid="import.back_button"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={importMutation.isPending || validCount === 0}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-smooth",
            (importMutation.isPending || validCount === 0) &&
              "opacity-60 cursor-not-allowed",
          )}
          data-ocid="import.submit_button"
        >
          {importMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Importing…
            </>
          ) : (
            <>
              Import {validCount} Member{validCount !== 1 ? "s" : ""}
            </>
          )}
        </button>
      </>
    ) : (
      <button
        type="button"
        onClick={handleClose}
        className="px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-smooth"
        data-ocid="import.close_button"
      >
        Done
      </button>
    );

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={modalTitle}
      description={modalDesc}
      size="lg"
      footer={footer}
    >
      {/* ── Step 1: Upload ── */}
      {step === "upload" && (
        <div className="space-y-4" data-ocid="import.upload.panel">
          <button
            type="button"
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed cursor-pointer transition-smooth w-full",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/40",
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            aria-label="Upload CSV file"
            data-ocid="import.dropzone"
          >
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium text-foreground">
                Drop your CSV file here
              </p>
              <p className="text-sm text-muted-foreground">
                or{" "}
                <span className="text-primary underline underline-offset-2">
                  click to browse
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileUp className="w-3.5 h-3.5" />
              <span>Accepted: .csv — max 200 member rows</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="sr-only"
              onChange={handleFileChange}
              data-ocid="import.upload_button"
            />
          </button>

          {parseError && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              data-ocid="import.error_state"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {parseError}
            </div>
          )}

          <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 space-y-1">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Expected CSV columns
            </p>
            <p className="text-xs text-muted-foreground">
              name*, chapter*, businessName, businessCategory, email, phone,
              website
            </p>
            <p className="text-xs text-muted-foreground">
              Chapter can be a name (e.g. "Downtown") or number (1–5). Columns
              are auto-mapped by header name.
            </p>
          </div>
        </div>
      )}

      {/* ── Step 2: Preview + Mapping ── */}
      {step === "preview" && parsed && (
        <div className="space-y-5" data-ocid="import.preview.panel">
          {/* Column mapping */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Column Mapping
              </h3>
              <span className="text-xs text-muted-foreground">
                {totalRows} row{totalRows !== 1 ? "s" : ""} detected
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXPECTED_FIELDS.map((field) => (
                <AppSelect
                  key={field.key}
                  label={`${field.label}${field.required ? " *" : ""}`}
                  value={mapping[field.key]}
                  onChange={(e) =>
                    setMapping((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  options={field.required ? colOptions : colOptionsWithEmpty}
                  placeholder={field.required ? "Select column…" : "— skip —"}
                  error={
                    field.required && !mapping[field.key]
                      ? `${field.label} column is required`
                      : undefined
                  }
                  data-ocid={`import.mapping.${field.key}.select`}
                />
              ))}
            </div>
          </div>

          {/* Validation summary */}
          {previewErrors.length > 0 && (
            <div
              className="rounded-lg bg-destructive/5 border border-destructive/20 px-4 py-3 space-y-1"
              data-ocid="import.validation.error_state"
            >
              <p className="text-xs font-semibold text-destructive uppercase tracking-wide">
                {invalidCount} row{invalidCount !== 1 ? "s" : ""} will be
                skipped
              </p>
              <ul className="space-y-0.5 max-h-20 overflow-y-auto">
                {previewErrors.slice(0, 8).map((err) => (
                  <li key={err} className="text-xs text-destructive/80">
                    {err}
                  </li>
                ))}
                {previewErrors.length > 8 && (
                  <li className="text-xs text-muted-foreground">
                    …and {previewErrors.length - 8} more
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Preview table */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Data Preview{" "}
              <span className="text-muted-foreground font-normal">
                (first 10 rows)
              </span>
            </h3>
            <div
              className="overflow-auto rounded-lg border border-border max-h-56"
              data-ocid="import.preview.table"
            >
              <table className="w-full text-xs min-w-max">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <tr>
                    {parsed.headers.map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap border-b border-border"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 10).map((row, i) => {
                    const rowKey = `${row[0] ?? ""}-${row[1] ?? ""}-${i}`;
                    return (
                      <tr
                        key={rowKey}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30"
                        data-ocid={`import.preview.item.${i + 1}`}
                      >
                        {parsed.headers.map((h, ci) => (
                          <td
                            key={h}
                            className="px-3 py-1.5 text-muted-foreground max-w-[160px] truncate"
                          >
                            {row[ci] ?? ""}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {parsed.rows.length > 10 && (
              <p className="text-xs text-muted-foreground">
                Showing first 10 of {parsed.rows.length} rows.
              </p>
            )}
          </div>

          {/* Mutation error */}
          {mutationError && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              data-ocid="import.error_state"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {mutationError}
            </div>
          )}

          {/* Loading state */}
          {importMutation.isPending && (
            <div
              className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground"
              data-ocid="import.loading_state"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Importing members, please wait…
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Result ── */}
      {step === "result" && result && (
        <div className="space-y-4 py-2" data-ocid="import.result.panel">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="p-4 rounded-full bg-success/10 border border-success/20">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {result.imported} member{result.imported !== 1 ? "s" : ""}{" "}
                imported
              </p>
              {result.skipped > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {result.skipped} row{result.skipped !== 1 ? "s" : ""} skipped
                </p>
              )}
            </div>
          </div>

          {result.errors.length > 0 && (
            <div
              className="rounded-lg bg-muted/50 border border-border px-4 py-3 space-y-2"
              data-ocid="import.result.errors"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Skip reasons
              </p>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {result.errors.map((err) => (
                  <li
                    key={err}
                    className="flex items-start gap-1.5 text-xs text-muted-foreground"
                  >
                    <X className="w-3 h-3 shrink-0 mt-0.5 text-destructive" />
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            className="grid grid-cols-2 gap-3"
            data-ocid="import.result.summary"
          >
            <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-primary">
                {result.imported}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Imported</p>
            </div>
            <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 text-center">
              <p className="text-2xl font-bold text-muted-foreground">
                {result.skipped}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Skipped</p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
