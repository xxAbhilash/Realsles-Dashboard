import { useEffect, useState, useMemo, useRef, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Search,
  X,
  Calendar,
  Clock,
  Target,
  UserCircle,
  ChevronRight,
  Sparkles,
  MapPin,
  Factory,
  Building,
  Package,
  FileText,
  Users,
  ClipboardList,
  RefreshCw,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Info,
  Share2,
  Check,
  Loader2,
  Upload,
  Plus,
  Trash2,
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useApi } from "@/hooks/useApi";
import { apis } from "@/utils/apis";
import { useSelector, useDispatch } from "react-redux";
import { triggerRefresh } from "@/redux/scenarioLibraryReducer";
import { showToast } from "@/lib/toastConfig";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface ScenarioItem {
  scenario_id?: string | number;
  session_id?: string | number;
  title?: string;
  user_id?: string;
  user_name?: string;
  first_name?: string;
  last_name?: string;
  mode?: {
    mode_id?: string | number;
    name?: string;
    description?: string;
    document_content?: string;
    documents?: string | Array<{ content?: string; url?: string; name?: string }>;
    content?: string;
  };
  persona?: {
    name?: string;
    persona_id?: string;
    profile_pic?: string;
    industry?: { name?: string; industry_id?: string };
    ai_role?: { name?: string };
    geography?: string;
    plant_size_impact?: { name?: string };
    manufacturing_model?: { name?: string };
    company_size_new?: { name?: string };
    gender?: string;
    persona_products?: Array<{
      product?: { name?: string; details?: string };
    }>;
  };
  scenario?: string;
  scenario_text?: string;
  message?: string;
  time_limit_days?: number;
  days_remaining?: number;
  is_completed?: boolean;
  created_at?: string;
  end_time?: string;
  manager_id?: string;
  manager_name?: string;
  team_name?: string;
  team_id?: string;
  status?: string;
  [key: string]: any;
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

const capitalize = (str?: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatText = (text?: string) => {
  if (!text) return "";
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

/** Removes curly braces before sending to the backend; UI keeps braces for highlight. */
const stripCurlyBraces = (str: string) => (str ?? "").replace(/\{|\}/g, "");

/**
 * Splits scenario text and returns React nodes with only properly balanced
 * {...} pairs highlighted in light yellow. Unclosed { or } are shown as plain
 * so that other balanced pairs later in the text still get highlighted.
 */
const scenarioTextWithHighlights = (text: string): ReactNode => {
  if (text == null || text === "") return null;
  const parts: React.ReactNode[] = [];
  let key = 0;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "{") {
      let depth = 1;
      const start = i;
      i += 1;
      while (i < text.length && depth > 0) {
        if (text[i] === "{") depth += 1;
        else if (text[i] === "}") depth -= 1;
        i += 1;
      }
      if (depth === 0) {
        parts.push(
          <span key={key++} className="bg-yellow-100 rounded px-0.5">
            {text.slice(start, i)}
          </span>
        );
      } else {
        parts.push(<span key={key++}>{text[start]}</span>);
        i = start + 1;
      }
      continue;
    }
    let plainStart = i;
    while (i < text.length && text[i] !== "{") i += 1;
    if (i > plainStart) {
      parts.push(<span key={key++}>{text.slice(plainStart, i)}</span>);
    }
  }
  return parts.length ? parts : text;
};

const PLACEHOLDER_SCENARIO = "Describe the scenario...";
const PLACEHOLDER_MESSAGE = "Message for the assigned users...";

/** Badge for scenario creator role: only super_admin → System Scenario (light orange). */
const getCreatorRoleBadge = (scenario: ScenarioItem): { label: string; className: string } | null => {
  const role =
    (scenario as any).creator_role ??
    (scenario as any).created_by?.role ??
    (scenario as any).creator_role_id;
  let roleStr = typeof role === "string" ? role.toLowerCase() : "";
  if (!roleStr && typeof role === "number") {
    roleStr = role === 1 ? "super_admin" : "";
  }
  if (roleStr === "super_admin") {
    return { label: "System Scenario", className: "bg-orange-100 text-orange-700 border-orange-200" };
  }
  return null;
};

/** True when scenario is created by sales_manager (team scenario). */
const isTeamScenario = (scenario: ScenarioItem): boolean => {
  const role =
    (scenario as any).creator_role ??
    (scenario as any).created_by?.role ??
    (scenario as any).creator_role_id;
  let roleStr = typeof role === "string" ? role.toLowerCase() : "";
  if (!roleStr && typeof role === "number") {
    roleStr = role === 2 ? "sales_manager" : "";
  }
  return roleStr === "sales_manager";
};

/** True when scenario is a system scenario (created by super_admin). */
const isSystemScenario = (scenario: ScenarioItem): boolean => {
  return !!getCreatorRoleBadge(scenario);
};

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────

export function ScenarioLibrary() {
  const { Get, Post, Put, Delete } = useApi();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const refreshTrigger = useSelector((state: any) => state.scenarioLibrary?.refreshTrigger ?? 0);

  // Data states
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI states
  const [scenarioSource, setScenarioSource] = useState<"system" | "custom">("system");
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Share flow state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareScenario, setShareScenario] = useState<ScenarioItem | null>(null);
  const [shareStep, setShareStep] = useState<1 | 2>(1);
  const [shareForm, setShareForm] = useState({
    title: "",
    scenario_text: "",
    message: "",
    document_content: "",
    time_limit_days: 7,
    mode_id: "",
    persona_id: "",
  });
  const [selectedShareUserIds, setSelectedShareUserIds] = useState<number[]>([]);
  const [shareTeamMembers, setShareTeamMembers] = useState<any[]>([]);
  const [modesData, setModesData] = useState<any[]>([]);
  const [personasData, setPersonasData] = useState<any[]>([]);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [isAssigningShare, setIsAssigningShare] = useState(false);
  const initialShareDocumentContentRef = useRef<string>("");
  const [shareDocumentSource, setShareDocumentSource] = useState<"existing" | "new" | null>(null);
  const [shareUploadedFile, setShareUploadedFile] = useState<File | null>(null);
  const [shareDocumentUploading, setShareDocumentUploading] = useState(false);

  // Detail edit state
  const [isDetailEditing, setIsDetailEditing] = useState(false);
  const [detailForm, setDetailForm] = useState({
    title: "",
    scenario_text: "",
    message: "",
    document_content: "",
    time_limit_days: 0,
  });

  // Delete team scenario
  const [scenarioToDelete, setScenarioToDelete] = useState<ScenarioItem | null>(null);
  const [isDeleteScenarioDialogOpen, setIsDeleteScenarioDialogOpen] = useState(false);
  const [isDeletingScenario, setIsDeletingScenario] = useState(false);

  // ──────────────────────────────────────────────────────
  // Fetch scenarios
  // ──────────────────────────────────────────────────────

  const fetchScenarios = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await Get(apis.scenarios_library);

      if (Array.isArray(response)) {
        setScenarios(response);
      } else if (response && typeof response === "object") {
        // Handle paginated or nested responses
        const data =
          (response as any).scenarios ||
          (response as any).data ||
          (response as any).results ||
          [];
        setScenarios(Array.isArray(data) ? data : []);
      } else {
        setScenarios([]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to fetch scenarios");
      setScenarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [refreshTrigger]);

  // ──────────────────────────────────────────────────────
  // Share: fetch modes, personas, team members
  // ──────────────────────────────────────────────────────

  const fetchModesAndPersonas = async (): Promise<{ modes: any[]; personas: any[] }> => {
    try {
      const modes = await Get(apis.interaction_modes);
      const modesResult = Array.isArray(modes) ? modes : [];
      setModesData(modesResult);
      const personas = await Get(apis.ai_personas);
      const personasResult = Array.isArray(personas) ? personas : [];
      setPersonasData(personasResult);
      return { modes: modesResult, personas: personasResult };
    } catch (e) {
      console.error(e);
      showToast.error("Failed to load modes and personas");
      return { modes: [], personas: [] };
    }
  };

  const getAllTeamMembers = async () => {
    if (!user?.user_id) return;
    try {
      const teamsData = await Get(`${apis.company_teams}manager/${user.user_id}`);
      if (!teamsData || !Array.isArray(teamsData)) {
        setShareTeamMembers([]);
        return;
      }
      const allMembers: any[] = [];
      for (const team of teamsData) {
        try {
          const members = await Get(`${apis.company_teams_members}team/${team.company_team_id}`);
          if (Array.isArray(members)) {
            for (const m of members) {
              allMembers.push({
                ...m,
                team_name: team.name,
                team_id: team.company_team_id,
              });
            }
          }
        } catch (_) {}
      }
      setShareTeamMembers(allMembers);
    } catch (e) {
      console.error(e);
      showToast.error("Failed to load team members");
      setShareTeamMembers([]);
    }
  };

  const handleOpenShare = async (scenario: ScenarioItem) => {
    setShareScenario(scenario);
    setShareStep(1);
    setSelectedShareUserIds([]);
    setIsShareLoading(true);

    const scenarioText =
      (typeof scenario.scenario === "string" && scenario.scenario.trim() ? scenario.scenario : null) ??
      (typeof (scenario as any).scenario_text === "string" && (scenario as any).scenario_text.trim()
        ? (scenario as any).scenario_text
        : null) ??
      (typeof (scenario as any).description === "string" && (scenario as any).description.trim()
        ? (scenario as any).description
        : null) ??
      (typeof (scenario as any).scenario_description === "string" && (scenario as any).scenario_description.trim()
        ? (scenario as any).scenario_description
        : null) ??
      "";
    const msgText =
      (typeof scenario.message === "string" && scenario.message.trim() ? scenario.message : null) ??
      (typeof (scenario as any).manager_message === "string" && (scenario as any).manager_message.trim()
        ? (scenario as any).manager_message
        : null) ??
      "";
    const mode = scenario.mode as Record<string, unknown> | undefined;
    const str = (v: unknown): string =>
      typeof v === "string" && v.trim() ? v.trim() : "";
    let docContent =
      str(mode?.document_content) ||
      str(mode?.content) ||
      str((mode as any)?.document) ||
      str((mode as any)?.attachment) ||
      str((scenario as any).document_content) ||
      "";
    if (!docContent && mode?.documents) {
      if (typeof mode.documents === "string") docContent = (mode.documents as string).trim() || "";
      else if (Array.isArray(mode.documents) && mode.documents.length > 0) {
        const first = mode.documents[0];
        const content = typeof first === "string" ? first : (first as any)?.content;
        docContent = str(content);
      }
    }

    initialShareDocumentContentRef.current = docContent;
    setShareDocumentSource(docContent ? "existing" : null);
    setShareUploadedFile(null);

    let modeId = (scenario.mode?.mode_id ?? (scenario.mode as any)?.id ?? "").toString();
    let personaId = (scenario.persona?.persona_id ?? (scenario.persona as any)?.id ?? "").toString();

    setShareForm({
      title: scenario.title || scenario.scenario || scenario.message || "Scenario",
      scenario_text: scenarioText,
      message: msgText,
      document_content: docContent,
      time_limit_days: scenario.time_limit_days ?? 7,
      mode_id: modeId,
      persona_id: personaId,
    });
    setIsShareDialogOpen(true);

    try {
      const { modes: modesResult, personas: personasResult } = await fetchModesAndPersonas();
      await getAllTeamMembers();
      if (!modeId && scenario.mode?.name) {
        const found = modesResult.find((m: any) => (m?.name ?? m?.mode_name) === scenario.mode?.name);
        if (found) {
          modeId = (found.mode_id ?? found.id).toString();
          setShareForm((prev) => ({ ...prev, mode_id: modeId }));
        }
      }
      if (!personaId && scenario.persona?.name) {
        const found = personasResult.find((p: any) => (p?.name ?? p?.persona_name) === scenario.persona?.name);
        if (found) {
          personaId = (found.persona_id ?? found.id).toString();
          setShareForm((prev) => ({ ...prev, persona_id: personaId }));
        }
      }
    } finally {
      setIsShareLoading(false);
    }
  };

  const handleOpenCreateScenario = async () => {
    setShareScenario(null);
    setShareStep(1);
    setSelectedShareUserIds([]);
    setShareForm({
      title: "",
      scenario_text: "",
      message: "",
      document_content: "",
      time_limit_days: 7,
      mode_id: "",
      persona_id: "",
    });
    initialShareDocumentContentRef.current = "";
    setShareDocumentSource(null);
    setShareUploadedFile(null);
    setIsShareLoading(true);

    try {
      await fetchModesAndPersonas();
      await getAllTeamMembers();
      setIsShareDialogOpen(true);
    } finally {
      setIsShareLoading(false);
    }
  };

  const handleShareProceed = () => {
    if (!shareForm.mode_id || !shareForm.persona_id || !shareForm.title.trim() || !shareForm.scenario_text.trim()) {
      showToast.error("Please fill in Title, Mode, Persona, and Scenario text");
      return;
    }
    if (!shareForm.time_limit_days || shareForm.time_limit_days < 1) {
      showToast.error("Please set a valid time limit (at least 1 day)");
      return;
    }
    setShareStep(2);
  };

  const handleShareDocumentUpload = async (file: File) => {
    setShareDocumentUploading(true);
    setShareUploadedFile(file);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await Post(apis.documents_upload, formData);
      if (response?.success && response?.summary) {
        setShareForm((p) => ({ ...p, document_content: response.summary }));
        setShareDocumentSource("new");
        showToast.success("Document uploaded and processed successfully");
      } else {
        throw new Error(response?.error || "Failed to process document");
      }
    } catch (err: any) {
      setShareUploadedFile(null);
      showToast.error(err?.response?.data?.detail || "Failed to upload document");
    } finally {
      setShareDocumentUploading(false);
    }
  };

  const handleShareFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleShareDocumentUpload(file);
    e.target.value = "";
  };

  const handleShareUseExistingDocument = () => {
    const initial = initialShareDocumentContentRef.current || "";
    setShareForm((p) => ({ ...p, document_content: initial }));
    setShareDocumentSource("existing");
    setShareUploadedFile(null);
  };

  const handleShareRemoveUploadedDocument = () => {
    setShareUploadedFile(null);
    const initial = initialShareDocumentContentRef.current || "";
    setShareForm((p) => ({ ...p, document_content: initial }));
    setShareDocumentSource(initial ? "existing" : null);
  };

  const toggleShareMember = (userId: number) => {
    setSelectedShareUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleShareScenario = async () => {
    if (selectedShareUserIds.length === 0) {
      showToast.error("Select at least one user to share with");
      return;
    }

    const s = shareScenario;
    const isNewScenario = !s;

    const origTitle = s ? (s.title || s.scenario || s.message || "Scenario") : "";
    const origScenarioText = s
      ? ((typeof s.scenario === "string" && s.scenario.trim() ? s.scenario : null) ??
        (typeof (s as any).scenario_text === "string" && (s as any).scenario_text.trim() ? (s as any).scenario_text : null) ??
        (typeof (s as any).description === "string" && (s as any).description.trim() ? (s as any).description : null) ??
        "")
      : "";
    const origMessage = s
      ? ((typeof s.message === "string" && s.message.trim() ? s.message : null) ??
        (typeof (s as any).manager_message === "string" && (s as any).manager_message.trim() ? (s as any).manager_message : null) ??
        "")
      : "";
    const origModeId = s ? (s.mode?.mode_id ?? (s.mode as any)?.id ?? "").toString() : "";
    const origPersonaId = s ? (s.persona?.persona_id ?? (s.persona as any)?.id ?? "").toString() : "";
    const origDocContent = initialShareDocumentContentRef.current ?? "";
    const origTimeLimit = s?.time_limit_days ?? 7;

    const title = shareForm.title?.trim() || "";
    const scenarioText = shareForm.scenario_text?.trim() || "";
    const message = shareForm.message?.trim() || "";
    const docContent = shareForm.document_content?.trim() || "";

    const hasChanged =
      isNewScenario ||
      title !== origTitle.trim() ||
      scenarioText !== origScenarioText.trim() ||
      message !== origMessage.trim() ||
      shareForm.mode_id !== origModeId ||
      shareForm.persona_id !== origPersonaId ||
      docContent !== origDocContent.trim() ||
      (shareForm.time_limit_days ?? 7) !== origTimeLimit;

    let scenarioIdToUse: string;

    if (hasChanged) {
      if (!shareForm.mode_id || !shareForm.persona_id || !title || !scenarioText) {
        showToast.error("Please fill in Title, Mode, Persona, and Scenario text");
        return;
      }
      try {
        const createPayload = {
          persona_id: shareForm.persona_id,
          mode_id: shareForm.mode_id,
          title,
          scenario_text: stripCurlyBraces(scenarioText),
          document_content: docContent,
          time_limit_days: shareForm.time_limit_days ?? 7,
          message: stripCurlyBraces(message),
        };
        const createRes = await Post(apis.scenarios, createPayload);
        const newId = (createRes as any)?.scenario_id ?? (createRes as any)?.id;
        if (!newId) {
          showToast.error("Failed to create scenario: no scenario_id returned");
          return;
        }
        scenarioIdToUse = String(newId);
      } catch (err: any) {
        showToast.error(err?.response?.data?.detail || "Failed to create scenario");
        return;
      }
    } else {
      if (!s || !s.scenario_id) {
        showToast.error("Scenario ID is missing");
        return;
      }
      scenarioIdToUse = s.scenario_id.toString();
    }

    setIsAssigningShare(true);
    const successNames: string[] = [];
    const failedNames: string[] = [];

    for (const userId of selectedShareUserIds) {
      const member = shareTeamMembers.find(
        (m: any) => (m?.user?.user_id ?? m?.user_id) === userId
      );
      const name =
        member?.user?.first_name && member?.user?.last_name
          ? `${member.user.first_name} ${member.user.last_name}`
          : "Unknown";

      try {
        const sessionPayload = {
          user_id: userId.toString(),
          persona_id: shareForm.persona_id,
          mode_id: shareForm.mode_id,
          scenario_id: scenarioIdToUse,
          scenario_text: stripCurlyBraces(scenarioText),
          document_content: docContent,
        };
        const sessionRes = await Post(apis.sessions_manager_create, sessionPayload);
        const sessionId = sessionRes?.session_id;
        if (!sessionId) {
          failedNames.push(name);
          continue;
        }
        const assignUrl = `${apis.scenarios_assign}/${scenarioIdToUse}/assign/${sessionId}`;
        await Post(assignUrl, {});
        successNames.push(name);
      } catch (_) {
        failedNames.push(name);
      }
    }

    setIsAssigningShare(false);
    if (successNames.length > 0) {
      showToast.success(`Scenario shared with ${successNames.join(", ")}`);
      setIsShareDialogOpen(false);
      setShareScenario(null);
      setSelectedShareUserIds([]);
      dispatch(triggerRefresh());
    }
    if (failedNames.length > 0) {
      showToast.error(`Failed to share with: ${failedNames.join(", ")}`);
    }
  };


  // ──────────────────────────────────────────────────────
  // Derived data (filters / stats)
  // ──────────────────────────────────────────────────────

  const uniqueModes = useMemo(() => {
    const modes = new Set<string>();
    scenarios.forEach((s) => {
      if (s.mode?.name) modes.add(s.mode.name);
    });
    return Array.from(modes);
  }, [scenarios]);

  const uniqueTeams = useMemo(() => {
    const teams = new Set<string>();
    scenarios.forEach((s) => {
      if (s.team_name) teams.add(s.team_name);
    });
    return Array.from(teams);
  }, [scenarios]);

  /** Order: system (super_admin) first, then team (sales_manager), then others. */
  const creatorRoleSortOrder = (s: ScenarioItem): number => {
    const role =
      (s as any).creator_role ??
      (s as any).created_by?.role ??
      (s as any).creator_role_id;
    let roleStr = typeof role === "string" ? role.toLowerCase() : "";
    if (!roleStr && typeof role === "number") {
      roleStr = role === 1 ? "super_admin" : role === 2 ? "sales_manager" : "";
    }
    if (roleStr === "super_admin") return 0;
    if (roleStr === "sales_manager") return 1;
    return 2;
  };

  const filteredScenarios = useMemo(() => {
    const filtered = scenarios.filter((s) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          s.persona?.name?.toLowerCase().includes(q) ||
          s.mode?.name?.toLowerCase().includes(q) ||
          s.scenario?.toLowerCase().includes(q) ||
          s.message?.toLowerCase().includes(q) ||
          s.user_name?.toLowerCase().includes(q) ||
          s.first_name?.toLowerCase().includes(q) ||
          s.last_name?.toLowerCase().includes(q) ||
          s.team_name?.toLowerCase().includes(q) ||
          s.persona?.industry?.name?.toLowerCase().includes(q) ||
          s.persona?.ai_role?.name?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Mode filter
      if (modeFilter !== "all" && s.mode?.name !== modeFilter) return false;

      // Team filter
      if (teamFilter !== "all" && s.team_name !== teamFilter) return false;

      // Source filter: system vs custom/modified
      if (scenarioSource === "system" && !isSystemScenario(s)) return false;
      if (scenarioSource === "custom" && isSystemScenario(s)) return false;

      return true;
    });
    // System scenarios first, then team scenarios, then others
    return [...filtered].sort((a, b) => creatorRoleSortOrder(a) - creatorRoleSortOrder(b));
  }, [scenarios, searchQuery, modeFilter, teamFilter, scenarioSource]);

  // Statistics (library = catalog count only)
  const stats = useMemo(() => ({
    total: scenarios.length,
  }), [scenarios]);

  const isAnyFilterActive =
    searchQuery || modeFilter !== "all" || teamFilter !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setModeFilter("all");
    setTeamFilter("all");
  };

  // ──────────────────────────────────────────────────────
  // Scenario Detail Dialog handler
  // ──────────────────────────────────────────────────────

  const handleScenarioClick = (scenario: ScenarioItem) => {
    setSelectedScenario(scenario);
    setIsDetailEditing(false);
    setIsDetailOpen(true);
  };

  const handleOpenDeleteScenario = (scenario: ScenarioItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!scenario.scenario_id) {
      showToast.error("Cannot delete: scenario ID missing");
      return;
    }
    setScenarioToDelete(scenario);
    setIsDeleteScenarioDialogOpen(true);
  };

  const handleConfirmDeleteScenario = async () => {
    if (!scenarioToDelete?.scenario_id) return;
    const scenarioId = String(scenarioToDelete.scenario_id);
    setIsDeletingScenario(true);
    try {
      await Delete(`${apis.scenarios}${scenarioId}`);
      setIsDeleteScenarioDialogOpen(false);
      setScenarioToDelete(null);
      dispatch(triggerRefresh());
      fetchScenarios();
    } catch (_) {
      // useApi Delete already shows error toast
    } finally {
      setIsDeletingScenario(false);
    }
  };

  // ──────────────────────────────────────────────────────
  // Sub-components
  // ──────────────────────────────────────────────────────

  const StatCard = ({
    icon: Icon,
    label,
    value,
    accent,
  }: {
    icon: any;
    label: string;
    value: number;
    accent: string;
  }) => (
    <Card className="border-border shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${accent} border border-border`}>
            <Icon className="h-5 w-5 text-black" />
          </div>
          <div>
            <p className="text-sm font-medium text-black/60 mb-0.5">{label}</p>
            <p className="text-3xl font-bold text-black">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ScenarioCard = ({ scenario }: { scenario: ScenarioItem }) => {
    const title = scenario.title || scenario.scenario || scenario.scenario_text || scenario.message || "Scenario";
    const personaName = formatText(scenario.persona?.name);
    const modeName = formatText(scenario.mode?.name);
    const roleBadge = getCreatorRoleBadge(scenario);

  return (
      <Card
        onClick={() => handleScenarioClick(scenario)}
        className="group cursor-pointer border border-gray-200/80 bg-white shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 rounded-xl overflow-hidden"
      >
        <CardContent className="p-5 flex flex-col h-full min-h-[140px]">
          {/* Title block: float only one line tall so line 1 wraps, lines 2–3 full width below badge */}
          <div className="overflow-visible mb-4 flex-1 min-h-0">
            <div className="float-right h-[1.4em] overflow-visible flex items-center gap-2 flex-shrink-0 ml-2 z-10">
              {roleBadge && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${roleBadge.className}`}
                >
                  {roleBadge.label}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  scenario.scenario_id ? handleOpenShare(scenario) : showToast.error("This scenario cannot be shared (missing scenario ID)");
                }}
                title="Share scenario"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {isTeamScenario(scenario) && scenario.scenario_id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => handleOpenDeleteScenario(scenario, e)}
                  title="Delete scenario"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <h3 className="text-[1.0625rem] font-semibold text-[#1a1a1a] leading-snug line-clamp-3 break-words min-w-0 group-hover:text-[#0f0f0f] transition-colors">
              {title}
            </h3>
          </div>

          {/* Footer: persona (subtle) + mode pill */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 clear-both">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {scenario.persona?.profile_pic ? (
                <img
                  src={scenario.persona.profile_pic}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover border border-gray-200/80 flex-shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200/80 flex items-center justify-center flex-shrink-0">
                  <UserCircle className="h-3 w-3 text-gray-400" />
                </div>
              )}
              <span className="text-xs text-gray-500 truncate">
                {personaName || "Unknown Persona"}
              </span>
            </div>
            {modeName && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium flex-shrink-0">
                <Target className="h-3 w-3 opacity-70" />
                {modeName}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary flex-shrink-0 transition-colors" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const ScenarioListItem = ({ scenario }: { scenario: ScenarioItem }) => {
    const title = scenario.title || scenario.scenario || scenario.scenario_text || scenario.message || "Scenario";
    const personaName = formatText(scenario.persona?.name);
    const modeName = formatText(scenario.mode?.name);
    const roleBadge = getCreatorRoleBadge(scenario);

    return (
      <Card
        onClick={() => handleScenarioClick(scenario)}
        className="group cursor-pointer border border-gray-200/80 bg-white shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 rounded-xl"
      >
        <CardContent className="py-3.5 px-4">
          {/* Title block: float only one line tall so line 1 wraps, lines 2–3 full width below badge */}
          <div className="overflow-visible">
            <div className="float-right h-[1.4em] overflow-visible flex items-center gap-2 flex-shrink-0 ml-2 z-10">
              {roleBadge && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${roleBadge.className}`}
                >
                  {roleBadge.label}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  scenario.scenario_id ? handleOpenShare(scenario) : showToast.error("This scenario cannot be shared (missing scenario ID)");
                }}
                title="Share scenario"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {isTeamScenario(scenario) && scenario.scenario_id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => handleOpenDeleteScenario(scenario, e)}
                  title="Delete scenario"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <h3 className="text-sm font-semibold text-[#1a1a1a] line-clamp-3 break-words min-w-0 group-hover:text-[#0f0f0f] transition-colors">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-4 clear-both mt-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                {scenario.persona?.profile_pic ? (
                  <img
                    src={scenario.persona.profile_pic}
                    alt=""
                    className="w-4 h-4 rounded-full object-cover border border-gray-200/80"
                  />
                ) : (
                  <UserCircle className="h-3.5 w-3.5 text-gray-400" />
                )}
                <span className="truncate">{personaName || "Unknown Persona"}</span>
                {modeName && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="truncate">{modeName}</span>
                  </>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary flex-shrink-0 transition-colors" />
          </div>
        </CardContent>
      </Card>
    );
  };

  // ──────────────────────────────────────────────────────
  // Detail Dialog — pre-compute values outside JSX
  // ──────────────────────────────────────────────────────

  const _ds = selectedScenario;
  const _dsTitle = _ds ? (_ds.title || _ds.scenario || _ds.scenario_text || _ds.message || "Scenario") : "";
  const _dsRoleBadge = _ds ? getCreatorRoleBadge(_ds) : null;
  const _dsScenarioText = _ds
    ? (
        (typeof _ds.scenario === "string" && _ds.scenario.trim() ? _ds.scenario : null) ??
        (typeof (_ds as any).scenario_text === "string" && (_ds as any).scenario_text.trim()
          ? (_ds as any).scenario_text
          : null) ??
        null
      )
    : null;
  const _dsMessage = _ds
    ? (
        (typeof _ds.message === "string" && _ds.message.trim() ? _ds.message : null) ??
        (typeof (_ds as any).manager_message === "string" && (_ds as any).manager_message.trim()
          ? (_ds as any).manager_message
          : null) ??
        (typeof (_ds as any).assignment_message === "string" && (_ds as any).assignment_message.trim()
          ? (_ds as any).assignment_message
          : null) ??
        null
      )
    : null;
  const _dsDocContent = (() => {
    if (!_ds) return null;
    const mode = _ds.mode as Record<string, unknown> | undefined;
    if (!mode) return null;
    const str = (v: unknown): string | null =>
      typeof v === "string" && v.trim() ? v.trim() : null;
    return (
      str(mode.document_content) ??
      str(mode.content) ??
      str((mode as any).document) ??
      str((mode as any).attachment) ??
      str((_ds as any).document_content) ??
      (typeof mode.documents === "string" && (mode.documents as string).trim() ? mode.documents as string : null) ??
      (Array.isArray(mode.documents) && mode.documents.length > 0
        ? str(typeof mode.documents[0] === "string" ? mode.documents[0] : (mode.documents[0] as any)?.content)
        : null)
    );
  })();

  const handleStartDetailEdit = () => {
    if (!_ds || !isTeamScenario(_ds)) return;
    setDetailForm({
      title: _dsTitle,
      scenario_text: _dsScenarioText ?? "",
      message: _dsMessage ?? "",
      document_content: _dsDocContent ?? "",
      time_limit_days: _ds.time_limit_days ?? 0,
    });
    setIsDetailEditing(true);
  };

  const handleCancelDetailEdit = () => {
    setIsDetailEditing(false);
  };

  const handleSaveDetailEdit = async () => {
    if (!_ds || !_ds.scenario_id) {
      showToast.error("Scenario ID is missing");
      return;
    }
    const scenarioId = String(_ds.scenario_id);

    const origTitle = _dsTitle;
    const origScenarioText = _dsScenarioText ?? "";
    const origMessage = _dsMessage ?? "";
    const origDocContent = _dsDocContent ?? "";
    const origTimeLimit = _ds.time_limit_days ?? 0;

    const title = detailForm.title.trim();
    const scenarioText = detailForm.scenario_text.trim();
    const message = detailForm.message.trim();
    const docContent = detailForm.document_content;
    const timeLimit = detailForm.time_limit_days;

    const body: any = {};
    if (title !== origTitle.trim()) body.title = title;
    if (scenarioText !== origScenarioText.trim()) body.scenario_text = stripCurlyBraces(scenarioText);
    if (message !== origMessage.trim()) body.message = stripCurlyBraces(message);
    if (docContent !== origDocContent) body.document_content = docContent;
    if (timeLimit !== origTimeLimit) body.time_limit_days = timeLimit;
    if ((_ds as any).session_id) body.session_id = String((_ds as any).session_id);

    if (Object.keys(body).length === 0) {
      showToast.error("No changes to save");
      return;
    }

    try {
      await Put(`${apis.scenarios}${scenarioId}`, body);
      // Update local state
      setScenarios((prev) =>
        prev.map((s) =>
          s.scenario_id === _ds.scenario_id
            ? {
                ...s,
                title,
                scenario: scenarioText || s.scenario,
                scenario_text: scenarioText || (s as any).scenario_text,
                message,
                document_content: docContent,
                time_limit_days: timeLimit,
              }
            : s
        )
      );
      setSelectedScenario((prev) =>
        prev && prev.scenario_id === _ds.scenario_id
          ? {
              ...prev,
              title,
              scenario: scenarioText || prev.scenario,
              scenario_text: scenarioText || (prev as any).scenario_text,
              message,
              document_content: docContent,
              time_limit_days: timeLimit,
            }
          : prev
      );
      setIsDetailEditing(false);
      dispatch(triggerRefresh());
    } catch (err: any) {
      showToast.error(err?.response?.data?.detail || "Failed to update scenario");
    }
  };

  // Share dialog — pre-compute grouped members (avoids re-computing inside JSX)
  const _shareGrouped = useMemo(() => {
    const byTeam: Record<string, any[]> = {};
    shareTeamMembers.forEach((m: any) => {
      const key = m.team_name || m.team_id || "Other";
      if (!byTeam[key]) byTeam[key] = [];
      byTeam[key].push(m);
    });
    return Object.entries(byTeam);
  }, [shareTeamMembers]);

  // ──────────────────────────────────────────────────────
  // Main Render
  // ──────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-black hidden sm:block" />
            Scenario Library
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            View and manage all assigned scenarios across your teams
          </p>
        </div>
        {/* Create Scenario button — no longer required; commented out
        <div className="flex items-center">
          <Button
            variant="default"
            className="h-10 md:h-11 px-4 md:px-5 rounded-full flex items-center gap-2 shadow-md"
            onClick={handleOpenCreateScenario}
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm md:text-base font-semibold">Create Scenario</span>
          </Button>
        </div>
        */}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500" />
            <p className="text-muted-foreground text-sm font-medium">Loading scenarios...</p>
          </div>
        </div>
      ) : error ? (
        /* Error State */
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <Info className="h-5 w-5" />
              <p className="font-medium">{error}</p>
            </div>
            <Button
              onClick={() => dispatch(triggerRefresh())}
              variant="outline"
              className="mt-4"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Statistics: single count for library — full width to match content below */}
          <div className="w-full">
            <StatCard icon={BookOpen} label="Scenarios in library" value={stats.total} accent="bg-yellow-100" />
          </div>

          {/* Search & Filter Bar */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Top row: Search + Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                    <Input
                      placeholder="Search by persona, mode, scenario, assignee..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-50/50 border-border focus:ring-yellow-300"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Controls: view mode, source, filters */}
                  <div className="flex items-center justify-end gap-2 self-end sm:self-auto">
                    {/* View toggle */}
                    <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-white">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded-md transition-colors ${
                          viewMode === "grid"
                            ? "bg-yellow-100 text-black"
                            : "text-black/40 hover:text-black/60"
                        }`}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded-md transition-colors ${
                          viewMode === "list"
                            ? "bg-yellow-100 text-black"
                            : "text-black/40 hover:text-black/60"
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Source toggle: system vs custom */}
                    <div className="hidden sm:flex items-center gap-1 border border-border rounded-lg p-1 bg-white">
                      <button
                        onClick={() => setScenarioSource("system")}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                          scenarioSource === "system"
                            ? "bg-yellow-100 text-black"
                            : "text-black/40 hover:text-black/70"
                        }`}
                      >
                        System
                      </button>
                      <button
                        onClick={() => setScenarioSource("custom")}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                          scenarioSource === "custom"
                            ? "bg-yellow-100 text-black"
                            : "text-black/40 hover:text-black/70"
                        }`}
                      >
                        Team / custom
                      </button>
                    </div>

                    {/* Filter toggle */}
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className={`gap-2 border-border ${showFilters ? "bg-yellow-50 border-yellow-300" : ""}`}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {isAnyFilterActive && (
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Filter row (collapsible) */}
                {showFilters && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-border/50">
                    {/* Mode filter */}
                    {uniqueModes.length > 0 && (
                      <Select value={modeFilter} onValueChange={setModeFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-gray-50/50">
                          <SelectValue placeholder="Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Modes</SelectItem>
                          {uniqueModes.map((mode) => (
                            <SelectItem key={mode} value={mode}>
                              {formatText(mode)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Team filter */}
                    {uniqueTeams.length > 0 && (
                      <Select value={teamFilter} onValueChange={setTeamFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-gray-50/50">
                          <SelectValue placeholder="Team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Teams</SelectItem>
                          {uniqueTeams.map((team) => (
                            <SelectItem key={team} value={team}>
                              {formatText(team)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Clear filters */}
                    {isAnyFilterActive && (
                      <Button
                        variant="ghost"
                        onClick={clearAllFilters}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 self-start"
                        size="sm"
                      >
                        <X className="h-3.5 w-3.5" />
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-black/50 font-medium">
              Showing {filteredScenarios.length} of {scenarios.length} scenarios
            </p>
          </div>

          {/* Scenarios Grid / List */}
          {filteredScenarios.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {filteredScenarios.map((scenario, index) => (
                  <ScenarioCard
                    key={scenario.scenario_id || scenario.session_id || index}
                    scenario={scenario}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredScenarios.map((scenario, index) => (
                  <ScenarioListItem
                    key={scenario.scenario_id || scenario.session_id || index}
                    scenario={scenario}
                  />
                ))}
              </div>
            )
          ) : (
            /* Empty State */
      <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <div className="p-4 rounded-full bg-yellow-50 border border-border">
                    <ClipboardList className="h-8 w-8 text-black/40" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-1">
                      {isAnyFilterActive ? "No matching scenarios" : "No scenarios yet"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isAnyFilterActive
                        ? "Try adjusting your search or filters to find what you're looking for."
                        : "Your scenario library is empty. Assign scenarios to your team members to get started."}
                    </p>
                    {isAnyFilterActive && (
                      <Button
                        variant="outline"
                        onClick={clearAllFilters}
                        className="mt-4 gap-2"
                        size="sm"
                      >
                        <X className="h-3.5 w-3.5" />
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </div>
        </CardContent>
      </Card>
          )}
        </>
      )}

      {/* ── Detail Dialog (inline, not a sub-component) ── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl border border-gray-200 bg-white shadow-xl p-0 gap-0">
          {_ds && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-6 pr-12 py-4 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-4 w-4 text-[#1a1a1a]" />
                  </div>
                  <span className="text-lg font-semibold text-[#1a1a1a]">Scenario details</span>
                  {_dsRoleBadge && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${_dsRoleBadge.className}`}
                    >
                      {_dsRoleBadge.label}
                    </span>
                  )}
                </div>
                {isTeamScenario(_ds) && !isDetailEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium"
                    onClick={handleStartDetailEdit}
                  >
                    Edit
                  </Button>
                )}
              </div>

              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {/* 1. Title */}
                <section>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Title</p>
                  {isDetailEditing ? (
                    <Input
                      value={detailForm.title}
                      onChange={(e) => setDetailForm((p) => ({ ...p, title: e.target.value }))}
                      className="h-10"
                    />
                  ) : (
                    <h2 className="text-[1.0625rem] font-semibold text-[#1a1a1a] leading-snug">{_dsTitle}</h2>
                  )}
                </section>

                {/* 2. Mode */}
                {_ds.mode && (
                  <section>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Mode</p>
                    <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3">
                      <p className="text-sm font-semibold text-[#1a1a1a]">{formatText(_ds.mode.name) || "—"}</p>
                      {_ds.mode.description && _ds.mode.description.trim() !== _ds.mode.name?.trim() && (
                        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{_ds.mode.description}</p>
                      )}
                    </div>
                  </section>
                )}

                {/* 3. Persona */}
                {_ds.persona && (
                  <section>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Persona</p>
                    <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        {_ds.persona.profile_pic ? (
                          <img src={_ds.persona.profile_pic} alt="" className="h-11 w-11 rounded-lg object-cover border border-gray-200" />
                        ) : (
                          <div className="h-11 w-11 rounded-lg bg-gray-200/80 border border-gray-200 flex items-center justify-center">
                            <UserCircle className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-[#1a1a1a]">{formatText(_ds.persona.name) || "—"}</p>
                          {_ds.persona.ai_role?.name && (
                            <p className="text-xs text-gray-500 mt-0.5">{formatText(_ds.persona.ai_role.name)}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {_ds.persona.industry?.name && (
                          <div>
                            <span className="text-gray-500">Industry</span>
                            <p className="font-medium text-[#1a1a1a]">{formatText(_ds.persona.industry.name)}</p>
                          </div>
                        )}
                        {_ds.persona.geography && (
                          <div>
                            <span className="text-gray-500">Geography</span>
                            <p className="font-medium text-[#1a1a1a]">{formatText(_ds.persona.geography)}</p>
                          </div>
                        )}
                        {_ds.persona.plant_size_impact?.name && (
                          <div>
                            <span className="text-gray-500">Plant size</span>
                            <p className="font-medium text-[#1a1a1a]">{capitalize(_ds.persona.plant_size_impact.name)}</p>
                          </div>
                        )}
                        {_ds.persona.manufacturing_model?.name && (
                          <div>
                            <span className="text-gray-500">Manufacturing model</span>
                            <p className="font-medium text-[#1a1a1a]">{capitalize(_ds.persona.manufacturing_model.name)}</p>
                          </div>
                        )}
                        {_ds.persona.company_size_new?.name && (
                          <div>
                            <span className="text-gray-500">Company size</span>
                            <p className="font-medium text-[#1a1a1a]">
                              {capitalize(_ds.persona.company_size_new.name)}
                              {_ds.persona.company_size_new.name === "small"
                                ? " (1–500)"
                                : _ds.persona.company_size_new.name === "medium"
                                  ? " (501–5,000)"
                                  : _ds.persona.company_size_new.name === "large"
                                    ? " (5,000+)"
                                    : ""}
                            </p>
                          </div>
                        )}
                        {_ds.persona.gender && (
                          <div>
                            <span className="text-gray-500">Gender</span>
                            <p className="font-medium text-[#1a1a1a]">{formatText(_ds.persona.gender)}</p>
                          </div>
                        )}
                      </div>
                      {_ds.persona.persona_products && _ds.persona.persona_products.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200/80">
                          <p className="text-xs text-gray-500 mb-1.5">Products</p>
                          <div className="flex flex-wrap gap-1.5">
                            {_ds.persona.persona_products.map((item, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-xs font-medium text-[#1a1a1a]">
                                {item.product?.name || "—"}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* 4. Scenario text */}
                <section>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Scenario text</p>
                  {isDetailEditing ? (
                    <Textarea
                      value={detailForm.scenario_text}
                      onChange={(e) => setDetailForm((p) => ({ ...p, scenario_text: e.target.value }))}
                      className="min-h-[100px] resize-none"
                    />
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3">
                      <p className="text-sm text-[#1a1a1a] leading-relaxed whitespace-pre-wrap">{_dsScenarioText ?? "—"}</p>
                    </div>
                  )}
                </section>

                {/* 5. Message */}
                <section>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Message</p>
                  {isDetailEditing ? (
                    <Textarea
                      value={detailForm.message}
                      onChange={(e) => setDetailForm((p) => ({ ...p, message: e.target.value }))}
                      className="min-h-[80px] resize-none"
                    />
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3">
                      <p className="text-sm text-[#1a1a1a] leading-relaxed whitespace-pre-wrap">{_dsMessage ?? "—"}</p>
                    </div>
                  )}
                </section>

                {/* 6. Document content */}
                <section>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Document content attached with the mode</p>
                  {isDetailEditing ? (
                    <Textarea
                      value={detailForm.document_content}
                      onChange={(e) => setDetailForm((p) => ({ ...p, document_content: e.target.value }))}
                      className="min-h-[80px] resize-none"
                    />
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3">
                      <p className="text-sm text-[#1a1a1a]">{_dsDocContent ? "Document attached" : "No document content attached."}</p>
                    </div>
                  )}
                </section>

                {/* 7. Time limit */}
                <section>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Time limit</p>
                  {isDetailEditing ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <Input
                        type="number"
                        min={0}
                        value={detailForm.time_limit_days}
                        onChange={(e) =>
                          setDetailForm((p) => ({
                            ...p,
                            time_limit_days: Number.isNaN(parseInt(e.target.value, 10))
                              ? 0
                              : parseInt(e.target.value, 10),
                          }))
                        }
                        className="h-9 w-24"
                      />
                      <span className="text-xs text-gray-500">days</span>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <p className="text-sm font-medium text-[#1a1a1a]">
                        {_ds.time_limit_days !== undefined && _ds.time_limit_days !== null
                          ? `${_ds.time_limit_days} ${_ds.time_limit_days === 1 ? "day" : "days"}`
                          : "—"}
                      </p>
                    </div>
                  )}
                </section>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                  {isDetailEditing && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleCancelDetailEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="flex-1"
                        onClick={handleSaveDetailEdit}
                        disabled={!detailForm.title.trim()}
                      >
                        Save changes
                      </Button>
                    </div>
                  )}
                  <Button
                    className="w-full gap-2"
                    onClick={() => {
                      if (_ds.scenario_id) {
                        handleOpenShare(_ds);
                      } else {
                        showToast.error("This scenario cannot be shared (missing scenario ID)");
                      }
                    }}
                    disabled={!_ds.scenario_id}
                  >
                    <Share2 className="h-4 w-4" />
                    Share with users
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete scenario confirmation ── */}
      <AlertDialog open={isDeleteScenarioDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsDeleteScenarioDialogOpen(false);
          setScenarioToDelete(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete scenario?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this team scenario. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingScenario}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteScenario}
              disabled={isDeletingScenario}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingScenario ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Share Dialog (inline, not a sub-component) ── */}
      <Dialog
        open={isShareDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsShareDialogOpen(false);
            setShareScenario(null);
            setShareStep(1);
            setSelectedShareUserIds([]);
            setShareDocumentSource(null);
            setShareUploadedFile(null);
            initialShareDocumentContentRef.current = "";
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              {shareScenario ? "Share scenario" : "Create scenario"}
            </DialogTitle>
          </DialogHeader>

          {isShareLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : shareStep === 1 ? (
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              <div className="space-y-2">
                <Label>Title <span className="text-destructive">*</span></Label>
                <Input
                  value={shareForm.title}
                  onChange={(e) => setShareForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Scenario title"
                  className="h-11"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mode <span className="text-destructive">*</span></Label>
                  <Select
                    value={shareForm.mode_id}
                    onValueChange={(v) => setShareForm((p) => ({ ...p, mode_id: v }))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {modesData.map((m: any) => (
                        <SelectItem key={m?.mode_id ?? m?.id} value={(m?.mode_id ?? m?.id).toString()}>
                          {m?.name ?? m?.mode_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Persona <span className="text-destructive">*</span></Label>
                  <Select
                    value={shareForm.persona_id}
                    onValueChange={(v) => setShareForm((p) => ({ ...p, persona_id: v }))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select persona" />
                    </SelectTrigger>
                    <SelectContent>
                      {personasData.map((p: any) => (
                        <SelectItem key={p?.persona_id ?? p?.id} value={(p?.persona_id ?? p?.id).toString()}>
                          {p?.name ?? p?.persona_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Scenario text <span className="text-destructive">*</span></Label>
                <div className="relative">
                  {/* Highlighted background layer */}
                  <div className="absolute inset-0 w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm whitespace-pre-wrap overflow-hidden pointer-events-none">
                    {shareForm.scenario_text ? (
                      scenarioTextWithHighlights(shareForm.scenario_text)
                    ) : (
                      <span className="text-muted-foreground">{PLACEHOLDER_SCENARIO}</span>
                    )}
                  </div>
                  {/* Transparent textarea overlay */}
                  <Textarea
                    value={shareForm.scenario_text}
                    onChange={(e) => setShareForm((p) => ({ ...p, scenario_text: e.target.value }))}
                    placeholder={PLACEHOLDER_SCENARIO}
                    className="min-h-[120px] resize-none relative bg-transparent text-transparent caret-black selection:bg-primary/30"
                    style={{ caretColor: 'black' }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message (optional)</Label>
                <div className="relative">
                  {/* Highlighted background layer */}
                  <div className="absolute inset-0 w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm whitespace-pre-wrap overflow-hidden pointer-events-none">
                    {shareForm.message ? (
                      scenarioTextWithHighlights(shareForm.message)
                    ) : (
                      <span className="text-muted-foreground">{PLACEHOLDER_MESSAGE}</span>
                    )}
                  </div>
                  {/* Transparent textarea overlay */}
                  <Textarea
                    value={shareForm.message}
                    onChange={(e) => setShareForm((p) => ({ ...p, message: e.target.value }))}
                    placeholder={PLACEHOLDER_MESSAGE}
                    className="min-h-[80px] resize-none relative bg-transparent text-transparent caret-black selection:bg-primary/30"
                    style={{ caretColor: 'black' }}
                  />
                </div>
              </div>
              {/* Document: existing vs upload new */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Document (optional)</Label>
                {initialShareDocumentContentRef.current?.trim() ? (
                  <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      An existing document is attached to this scenario. Do you want to keep it or upload a new one?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={shareDocumentSource === "existing" || shareDocumentSource === null ? "default" : "outline"}
                        size="sm"
                        onClick={handleShareUseExistingDocument}
                      >
                        Use existing document
                      </Button>
                      <Button
                        type="button"
                        variant={shareDocumentSource === "new" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShareDocumentSource("new")}
                        disabled={shareDocumentUploading}
                      >
                        Upload new document
                      </Button>
                    </div>
                    {shareDocumentSource === "existing" || (shareDocumentSource === null && initialShareDocumentContentRef.current) ? (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        Using existing document content for this share.
                      </p>
                    ) : null}
                    {(shareDocumentSource === "new" || shareUploadedFile) && (
                      <div className="border-2 border-dashed rounded-lg p-4 bg-background">
                        {!shareUploadedFile ? (
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (max 10MB)</p>
                            <label className="cursor-pointer">
                              <span className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90">
                                {shareDocumentUploading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Select file
                                  </>
                                )}
                              </span>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={handleShareFileChange}
                                disabled={shareDocumentUploading}
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 p-2 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm font-medium truncate">{shareUploadedFile.name}</span>
                              {shareForm.document_content && !shareDocumentUploading && (
                                <Badge variant="secondary" className="text-xs flex-shrink-0">Processed</Badge>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={handleShareRemoveUploadedDocument}
                              disabled={shareDocumentUploading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {shareDocumentUploading && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Processing document...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-4">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Upload a document (optional). PDF, DOC, DOCX (max 10MB)</p>
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90">
                          {shareDocumentUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Select file
                            </>
                          )}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleShareFileChange}
                          disabled={shareDocumentUploading}
                        />
                      </label>
                    </div>
                    {shareUploadedFile && (
                      <div className="flex items-center justify-between gap-2 mt-3 p-2 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{shareUploadedFile.name}</span>
                          {shareForm.document_content && !shareDocumentUploading && (
                            <Badge variant="secondary" className="text-xs flex-shrink-0">Processed</Badge>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={handleShareRemoveUploadedDocument}
                          disabled={shareDocumentUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Time limit (days) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  min={1}
                  value={shareForm.time_limit_days || ""}
                  onChange={(e) =>
                    setShareForm((p) => ({ ...p, time_limit_days: Math.max(1, parseInt(e.target.value, 10) || 1) }))
                  }
                  className="h-11"
                />
              </div>
              <div className="pt-4">
                <Button className="w-full h-11 font-semibold" onClick={handleShareProceed}>
                  Proceed to select users
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              <Label className="text-base font-semibold">Select users to share with</Label>
              <div className="border rounded-lg p-3 max-h-[320px] overflow-y-auto space-y-2">
                {shareTeamMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No team members found.</p>
                ) : (
                  _shareGrouped.map(([teamName, list]) => (
                    <div key={teamName} className="mb-4 last:mb-0">
                      <p className="text-sm font-medium text-muted-foreground mb-2">{teamName}</p>
                      <div className="space-y-1">
                        {list.map((member: any) => {
                          const uid = member?.user?.user_id ?? member?.user_id;
                          const isSelected = selectedShareUserIds.includes(uid);
                          return (
                            <div
                              key={uid}
                              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                              }`}
                              onClick={() => toggleShareMember(uid)}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src={member?.user?.avatar} />
                                  <AvatarFallback>
                                    {(member?.user?.first_name?.[0] ?? "") + (member?.user?.last_name?.[0] ?? "")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">
                                    {member?.user?.first_name} {member?.user?.last_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{member?.user?.email}</p>
                                </div>
                              </div>
                              {isSelected && <Check className="h-5 w-5 text-primary" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 h-11" onClick={() => setShareStep(1)} disabled={isAssigningShare}>
                  Back
                </Button>
                <Button
                  className="flex-1 h-11"
                  onClick={handleShareScenario}
                  disabled={isAssigningShare || selectedShareUserIds.length === 0}
                >
                  {isAssigningShare ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>Share with {selectedShareUserIds.length} user(s)</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
