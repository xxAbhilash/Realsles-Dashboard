import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Target, 
  Clock, 
  Calendar, 
  Info,
  UserCircle,
  ClipboardList,
  FileText,
  ChevronRight,
  Sparkles,
  CheckCircle,
  MapPin,
  Factory,
  Building,
  Package,
  Briefcase,
  Play,
  AlertCircle,
  Plus,
  Minus,
  BarChart3,
  MessageSquare,
  Lightbulb,
  TrendingUp
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useApi } from "@/hooks/useApi";
import { apis } from "@/utils/apis";
import { useSelector } from "react-redux";
import { RootState } from "@/types";
import { showToast } from "@/lib/toastConfig";

export function AssignedScenarios() {
  const { Get } = useApi();
  const user = useSelector((state: RootState) => state.auth.user);
  const [scenarioData, setScenarioData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScenarioDialogOpen, setIsScenarioDialogOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isPendingScenariosOpen, setIsPendingScenariosOpen] = useState(false);
  const [isLapsedScenariosOpen, setIsLapsedScenariosOpen] = useState(false);
  const [isCompletedScenariosOpen, setIsCompletedScenariosOpen] = useState(false);
  const [isPerformanceDialogOpen, setIsPerformanceDialogOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | number | null>(null);

  const fetchScenarios = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await Get(apis.scenarios_dashboard_sales_rep);
      
      if (response) {
        setScenarioData(response);
      } else {
        setScenarioData(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to fetch scenarios");
      setScenarioData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  // Open pending scenarios by default when there are pending scenarios
  useEffect(() => {
    if (scenarioData?.pending_scenarios) {
      const pendingScenarios = scenarioData.pending_scenarios.filter((s: any) => !s.is_completed && (s.days_remaining ?? 0) > 0);
      if (pendingScenarios.length > 0) {
        setIsPendingScenariosOpen(true);
      }
    }
  }, [scenarioData]);

  const handleScenarioClick = async (scenario: any) => {
    setSelectedScenario(scenario);
    setIsScenarioDialogOpen(true);
    // Refresh scenario data to get latest completion status
    try {
      const response = await Get(apis.scenarios_dashboard_sales_rep);
      if (response) {
        setScenarioData(response);
        // Update selectedScenario with latest data if available
        if (response?.pending_scenarios) {
          const updatedScenario = response.pending_scenarios.find(
            (s: any) => s.scenario_id === scenario.scenario_id || s.session_id === scenario.session_id
          );
          if (updatedScenario) {
            setSelectedScenario(updatedScenario);
          }
        }
      }
    } catch (err) {
      // Silently fail - use the scenario we already have
      console.error("Failed to refresh scenario data:", err);
    }
  };

  // Check if session has been started (but not necessarily completed)
  const hasSessionStarted = (sessionId: string | number) => {
    if (!sessionId) return false;
    const startedSessions = JSON.parse(localStorage.getItem('startedSessions') || '[]');
    return startedSessions.includes(String(sessionId));
  };

  // Mark session as started
  const markSessionAsStarted = (sessionId: string | number) => {
    if (!sessionId) return;
    const startedSessions = JSON.parse(localStorage.getItem('startedSessions') || '[]');
    if (!startedSessions.includes(String(sessionId))) {
      startedSessions.push(String(sessionId));
      localStorage.setItem('startedSessions', JSON.stringify(startedSessions));
    }
  };

  const handleStartSessionClick = () => {
    if (!selectedScenario) return;
    
    // If session is completed, don't allow starting
    if (selectedScenario.is_completed) {
      return;
    }
    
    // If session has already been started, don't allow starting again
    if (hasSessionStarted(selectedScenario.session_id)) {
      return;
    }
    
    // Show confirmation dialog
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmStartSession = () => {
    setIsConfirmDialogOpen(false);
    if (!selectedScenario) return;
    
    // Mark session as started
    markSessionAsStarted(selectedScenario.session_id);
    
    // Proceed with starting the session
    handleStartSession();
  };

  const handleStartSession = () => {
    if (!selectedScenario) return;

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      console.log("Token retrieved from localStorage:", token ? "Token exists" : "Token is null");
      console.log("Token length:", token?.length || 0);
      if (!token) {
        showToast.error("Authentication token not found. Please login again.");
        return;
      }

      // Get user_id - use from scenario if available, otherwise from Redux
      const userId = selectedScenario.user_id || (user as any)?.user_id || (user as any)?.user?.user_id;
      if (!userId) {
        showToast.error("User information not found. Please login again.");
        return;
      }

      // Extract mode_id
      const modeId = selectedScenario.mode?.mode_id || selectedScenario.mode?.id;
      if (!modeId) {
        showToast.error("Mode information not found in scenario.");
        return;
      }

      // Extract session_id
      const sessionId = selectedScenario.session_id;
      if (!sessionId) {
        showToast.error("Session ID not found in scenario.");
        return;
      }

      // Format persona_data
      const personaData = selectedScenario.persona;
      if (!personaData) {
        showToast.error("Persona information not found in scenario.");
        return;
      }

      // Get full mode data
      const modeData = selectedScenario.mode;
      if (!modeData) {
        showToast.error("Mode data not found in scenario.");
        return;
      }

      // Extract voice_id from persona data
      const voiceId = personaData.voice_id || personaData.voice?.voice_id || selectedScenario.voice_id || null;

      // Store all session details in localStorage
      const sessionData = {
        mode_id: modeId.toString(),
        mode_data: modeData,
        persona_data: personaData,
        session_id: sessionId.toString(),
        user: userId.toString(),
        token: token,
        scenario: selectedScenario.scenario || "",
        time_limit_days: selectedScenario.time_limit_days || 0,
        days_remaining: selectedScenario.days_remaining || 0,
        manager_id: selectedScenario.manager_id || "",
        manager_name: selectedScenario.manager_name || "",
        message: selectedScenario.message || "",
        voice_id: voiceId
      };

      localStorage.setItem("sessionData", JSON.stringify(sessionData));

      // Build URL with session_id, persona_data, token, and voice_id as query parameters
      const baseUrl = "https://mainreal-sales.vercel.app/chat/audio";
      
      // Stringify persona_data
      const personaDataString = JSON.stringify(personaData);
      console.log("Persona Data String:", personaDataString);
      console.log("Persona Data Length:", personaDataString.length);
      
      // Build query parameters manually to ensure all data is included
      const personaDataEncoded = encodeURIComponent(personaDataString);
      const sessionIdEncoded = encodeURIComponent(sessionId.toString());
      const tokenEncoded = encodeURIComponent(token);
      
      console.log("Token before encoding:", token);
      console.log("Token after encoding:", tokenEncoded);
      console.log("Token encoded length:", tokenEncoded.length);
      
      // Build URL with all parameters
      const queryParams = [
        `session_id=${sessionIdEncoded}`,
        `persona_data=${personaDataEncoded}`,
        `token=${tokenEncoded}`
      ];

      // Add voice_id if available
      if (voiceId) {
        const voiceIdEncoded = encodeURIComponent(voiceId.toString());
        queryParams.push(`voice_id=${voiceIdEncoded}`);
        console.log("Voice ID added:", voiceId);
      }
      
      const url = `${baseUrl}?${queryParams.join('&')}`;
      
      console.log("Query params array:", queryParams);
      console.log("Final URL:", url);
      console.log("URL Length:", url.length);
      console.log("URL includes token:", url.includes('token='));
      
      // Verify token is in URL before navigation
      if (!url.includes('token=')) {
        console.error("ERROR: Token is missing from URL!");
        showToast.error("Failed to include token in URL. Please try again.");
        return;
      }
      
      // Double-check: Parse the URL to verify all params are present
      const urlObj = new URL(url);
      console.log("Parsed URL search params:", urlObj.searchParams.toString());
      console.log("session_id from parsed URL:", urlObj.searchParams.get('session_id'));
      console.log("persona_data from parsed URL:", urlObj.searchParams.get('persona_data') ? "Present" : "Missing");
      console.log("token from parsed URL:", urlObj.searchParams.get('token') ? "Present" : "Missing");
      console.log("voice_id from parsed URL:", urlObj.searchParams.get('voice_id') ? urlObj.searchParams.get('voice_id') : "Missing");
      
      // Final verification
      if (!urlObj.searchParams.get('token')) {
        console.error("CRITICAL ERROR: Token is not in parsed URL!");
        showToast.error("Token validation failed. Please try again.");
        return;
      }
      
      console.log("✅ All parameters verified. Navigating to:", url.substring(0, 200) + "...");
      window.location.href = url;
    } catch (error: any) {
      console.error("Error starting session:", error);
      showToast.error("Failed to start session. Please try again.");
    }
  };

  const formatText = (text: string) => {
    return text?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || text;
  };

  const capitalizeFirstLetter = (text: string) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const handleViewPerformance = async (sessionId: string | number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click
    setSelectedSessionId(sessionId);
    setIsPerformanceDialogOpen(true);
    setPerformanceLoading(true);
    setPerformanceData(null);
    
    try {
      const response = await Get(`${apis.performance_report}${sessionId}`);
      if (response) {
        setPerformanceData(response);
      }
    } catch (err: any) {
      console.error("Failed to fetch performance report:", err);
      showToast.error(err?.response?.data?.detail || "Failed to fetch performance report");
    } finally {
      setPerformanceLoading(false);
    }
  };

  const formatSkillName = (skill: string) => {
    return skill
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCoachingText = (text: string) => {
    if (!text) return '';
    
    // First, normalize the text - replace \n \n with \n\n for consistent paragraph splitting
    const normalizedText = text.replace(/\n\s+\n/g, '\n\n');
    
    // Split by double newlines for major paragraphs
    const majorSections = normalizedText.split(/\n\n+/).filter(s => s.trim());
    
    return majorSections.map((section, sectionIdx) => {
      const trimmed = section.trim();
      
      // Check if section starts with "Specifically:" or similar headers
      if (trimmed.match(/^[A-Z][^:]*:\s*$/)) {
        return (
          <h4 key={sectionIdx} className="font-semibold text-black mt-4 mb-3 text-base">
            {trimmed}
          </h4>
        );
      }
      
      // Process lines within the section
      const lines = trimmed.split(/\n/).filter(l => l.trim());
      
      return (
        <div key={sectionIdx} className="mb-4">
          {lines.map((line, lineIdx) => {
            const lineTrimmed = line.trim();
            
            // Check if it's a bullet point with score (format: "- SKILL NAME (score): description")
            if (lineTrimmed.startsWith('- ')) {
              const bulletText = lineTrimmed.substring(2).trim();
              const scoreMatch = bulletText.match(/^([^(]+)\s*\((\d+)\)\s*:\s*(.+)$/);
              
              if (scoreMatch) {
                const [, skillName, score, description] = scoreMatch;
                return (
                  <div key={lineIdx} className="mb-4">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-yellow-600 font-semibold text-lg mt-0.5">•</span>
                      <div className="flex-1">
                        <span className="font-semibold text-black text-sm">{skillName.trim()}</span>
                        <span className="text-black/70 ml-2 font-medium">({score})</span>
                      </div>
                    </div>
                    <p className="ml-6 text-sm text-black/80 leading-relaxed">{description.trim()}</p>
                  </div>
                );
              } else {
                // Regular bullet point without score
                return (
                  <div key={lineIdx} className="mb-2 flex items-start gap-2">
                    <span className="text-yellow-600 font-semibold mt-1.5">•</span>
                    <p className="text-sm text-black leading-relaxed flex-1">{bulletText}</p>
                  </div>
                );
              }
            }
            
            // Check if it's a section header (all caps, short)
            if (lineTrimmed === lineTrimmed.toUpperCase() && lineTrimmed.length < 60 && !lineTrimmed.includes('(')) {
              return (
                <h4 key={lineIdx} className="font-semibold text-black mt-4 mb-2 text-sm">
                  {lineTrimmed}
                </h4>
              );
            }
            
            // Regular paragraph line
            return (
              <p key={lineIdx} className="text-sm text-black leading-relaxed mb-2">
                {lineTrimmed}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight">Assigned Scenarios</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Review and complete your assigned training scenarios
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <p className="text-muted-foreground text-sm">Loading scenarios...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <Info className="h-5 w-5" />
              <p className="font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : scenarioData ? (
        <>
          {/* Statistics Card */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-100 border border-border">
                    <Clock className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black/60 mb-1">Total Pending Scenarios</p>
                    <p className="text-4xl font-bold text-black">{scenarioData?.total_pending || 0}</p>
                  </div>
                </div>
                {scenarioData?.pending_scenarios && scenarioData.pending_scenarios.length > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-black/50 mb-1">Active Assignments</p>
                    <Badge variant="secondary" className="bg-yellow-100 text-black border-border text-sm px-3 py-1">
                      {scenarioData.pending_scenarios.length} {scenarioData.pending_scenarios.length === 1 ? 'scenario' : 'scenarios'}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scenarios List */}
          {scenarioData?.pending_scenarios && scenarioData.pending_scenarios.length > 0 ? (
            <div className="space-y-4">
              {/* Separate pending, lapsed, and completed scenarios */}
              {(() => {
                const pendingScenarios = scenarioData.pending_scenarios.filter((s: any) => !s.is_completed && (s.days_remaining ?? 0) > 0);
                const lapsedScenarios = scenarioData.pending_scenarios.filter((s: any) => !s.is_completed && (s.days_remaining ?? 0) === 0);
                const completedScenarios = scenarioData.pending_scenarios.filter((s: any) => s.is_completed);
                
                return (
                  <>
                    {/* Pending Scenarios */}
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsPendingScenariosOpen(!isPendingScenariosOpen)}
                        className="w-full flex items-center justify-between p-4 h-auto border-2 border-border bg-card hover:bg-muted"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-black" />
                          <span className="text-lg font-semibold text-black">Pending</span>
                          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                            {pendingScenarios.length} {pendingScenarios.length === 1 ? 'scenario' : 'scenarios'}
                          </Badge>
                        </div>
                        <div className="w-6 h-6 rounded bg-[#FFDE5A] flex items-center justify-center shrink-0">
                          <Plus className={`h-4 w-4 text-black ${isPendingScenariosOpen ? 'hidden' : ''}`} />
                          <Minus className={`h-4 w-4 text-black ${isPendingScenariosOpen ? '' : 'hidden'}`} />
                        </div>
                      </Button>

                      {isPendingScenariosOpen && (
              <div className="grid gap-4">
                          {pendingScenarios.length > 0 ? (
                            [...pendingScenarios]
                              .sort((a: any, b: any) => {
                                // Sort by days_remaining in ascending order (fewer days first)
                                const daysA = a.days_remaining ?? Infinity;
                                const daysB = b.days_remaining ?? Infinity;
                                return daysA - daysB;
                              })
                              .map((scenario: any, index: number) => (
                                <Card
                                  key={scenario.scenario_id || index}
                                  onClick={() => handleScenarioClick(scenario)}
                                  className="group cursor-pointer border-border hover:border-yellow-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                >
                                  <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-6">
                                      <div className="flex-1 space-y-4">
                                        {/* Header Section - Status */}
                                        <div className="flex items-center gap-3">
                                          <Badge 
                                            variant="outline"
                                            className="text-xs font-medium px-3 py-1.5 border-red-300 bg-red-50 text-red-700"
                                          >
                                            <Clock className="h-3 w-3 mr-1.5" />
                                            Pending
                                          </Badge>
                                        </div>

                                        {/* Manager Assignment Message */}
                                        <div>
                                          <p className="text-sm font-medium text-black leading-relaxed">
                                            You have been assigned a scenario by <span className="font-semibold">{capitalizeFirstLetter(scenario.manager_name) || "Manager"}</span>
                                            {scenario.message ? (
                                              <span className="block mt-2 text-sm text-black/70 font-normal">
                                                with this message: <span className="italic">"{scenario.message}"</span>
                                              </span>
                                            ) : null}
                                          </p>
                                        </div>

                                        {/* Information Section */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/50">
                                          <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-yellow-50/30 border border-border/50">
                                              <Calendar className="h-4 w-4 text-black/60" />
                                            </div>
                                            <div>
                                              <p className="text-xs font-medium text-black/50 mb-1">Created On</p>
                                              <p className="text-sm font-semibold text-black">
                                                {scenario.created_at 
                                                  ? new Date(scenario.created_at).toLocaleDateString('en-US', { 
                                                      weekday: 'short',
                                                      month: 'short', 
                                                      day: 'numeric',
                                                      year: 'numeric'
                                                    })
                                                  : "N/A"}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-yellow-50/30 border border-border/50">
                                              <Clock className="h-4 w-4 text-black/60" />
                                            </div>
                                            <div>
                                              <p className="text-xs font-medium text-black/50 mb-1">Days Remaining</p>
                                              <p className="text-sm font-semibold text-black">
                                                {scenario.days_remaining || 0} {scenario.days_remaining === 1 ? 'day' : 'days'}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <ChevronRight className="h-5 w-5 text-black/30 group-hover:text-black/60 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                          ) : (
                            <Card>
                              <CardContent className="p-8">
                                <div className="flex flex-col items-center justify-center gap-2 text-center">
                                  <Clock className="h-8 w-8 text-red-300" />
                                  <p className="text-sm text-muted-foreground">No pending scenarios</p>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Lapsed Scenarios */}
                    {lapsedScenarios.length > 0 && (
                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsLapsedScenariosOpen(!isLapsedScenariosOpen)}
                          className="w-full flex items-center justify-between p-4 h-auto border-2 border-border bg-card hover:bg-muted"
                        >
                          <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-black" />
                            <span className="text-lg font-semibold text-black">Overdue</span>
                            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                              {lapsedScenarios.length} {lapsedScenarios.length === 1 ? 'scenario' : 'scenarios'}
                            </Badge>
                          </div>
                          <div className="w-6 h-6 rounded bg-[#FFDE5A] flex items-center justify-center shrink-0">
                            <Plus className={`h-4 w-4 text-black ${isLapsedScenariosOpen ? 'hidden' : ''}`} />
                            <Minus className={`h-4 w-4 text-black ${isLapsedScenariosOpen ? '' : 'hidden'}`} />
                          </div>
                        </Button>

                        {isLapsedScenariosOpen && (
                          <div className="grid gap-4">
                            {[...lapsedScenarios]
                              .sort((a: any, b: any) => {
                                // Sort by created_at descending (newest first)
                                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                                return dateB - dateA;
                              })
                              .map((scenario: any, index: number) => (
                  <Card
                    key={scenario.scenario_id || index}
                    onClick={() => handleScenarioClick(scenario)}
                    className="group cursor-pointer border-border hover:border-yellow-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          {/* Header Section - Status */}
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant="outline"
                              className={`text-xs font-medium px-3 py-1.5 ${
                                scenario.is_completed
                                  ? "border-green-300 bg-green-50 text-green-700"
                                                : "border-orange-400 bg-orange-100 text-orange-700"
                              }`}
                            >
                              {scenario.is_completed ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1.5" />
                                  Completed
                                </>
                              ) : (
                                <>
                                                <AlertCircle className="h-3 w-3 mr-1.5" />
                                                Overdue
                                </>
                              )}
                            </Badge>
                          </div>

                          {/* Manager Assignment Message */}
                          <div>
                            <p className="text-sm font-medium text-black leading-relaxed">
                              You have been assigned a scenario by <span className="font-semibold">{capitalizeFirstLetter(scenario.manager_name) || "Manager"}</span>
                              {scenario.message ? (
                                <span className="block mt-2 text-sm text-black/70 font-normal">
                                  with this message: <span className="italic">"{scenario.message}"</span>
                                </span>
                              ) : null}
                            </p>
                          </div>

                          {/* Information Section */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/50">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-yellow-50/30 border border-border/50">
                                <Calendar className="h-4 w-4 text-black/60" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-black/50 mb-1">Created On</p>
                                <p className="text-sm font-semibold text-black">
                                  {scenario.created_at 
                                    ? new Date(scenario.created_at).toLocaleDateString('en-US', { 
                                        weekday: 'short',
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                      })
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-yellow-50/30 border border-border/50">
                                              <AlertCircle className="h-4 w-4 text-black/60" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-black/50 mb-1">Days Remaining</p>
                                <p className="text-sm font-semibold text-black">
                                                0 days (Time lapsed)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-black/30 group-hover:text-black/60 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
                        )}
                      </div>
                    )}

                    {/* Completed Scenarios */}
                    {completedScenarios.length > 0 && (
                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsCompletedScenariosOpen(!isCompletedScenariosOpen)}
                          className="w-full flex items-center justify-between p-4 h-auto border-2 border-border bg-card hover:bg-muted"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-black" />
                            <span className="text-lg font-semibold text-black">Completed</span>
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                              {completedScenarios.length} {completedScenarios.length === 1 ? 'scenario' : 'scenarios'}
                            </Badge>
                          </div>
                          <div className="w-6 h-6 rounded bg-[#FFDE5A] flex items-center justify-center shrink-0">
                            <Plus className={`h-4 w-4 text-black ${isCompletedScenariosOpen ? 'hidden' : ''}`} />
                            <Minus className={`h-4 w-4 text-black ${isCompletedScenariosOpen ? '' : 'hidden'}`} />
                          </div>
                        </Button>

                        {isCompletedScenariosOpen && (
                          <div className="grid gap-4">
                            {[...completedScenarios]
                              .sort((a: any, b: any) => {
                                // Sort by created_at descending (newest first)
                                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                                return dateB - dateA;
                              })
                              .map((scenario: any, index: number) => (
                                <Card
                                  key={scenario.scenario_id || index}
                                  onClick={() => handleScenarioClick(scenario)}
                                  className="group cursor-pointer border-border hover:border-yellow-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                >
                                  <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-6">
                                      <div className="flex-1 space-y-4">
                                        {/* Header Section - Status */}
                                        <div className="flex items-center gap-3">
                                          <Badge 
                                            variant="outline"
                                            className="text-xs font-medium px-3 py-1.5 border-green-300 bg-green-50 text-green-700"
                                          >
                                            <CheckCircle className="h-3 w-3 mr-1.5" />
                                            Completed
                                          </Badge>
                                        </div>

                                        {/* Manager Assignment Message */}
                                        <div>
                                          <p className="text-sm font-medium text-black leading-relaxed">
                                            You have been assigned a scenario by <span className="font-semibold">{capitalizeFirstLetter(scenario.manager_name) || "Manager"}</span>
                                            {scenario.message ? (
                                              <span className="block mt-2 text-sm text-black/70 font-normal">
                                                with this message: <span className="italic">"{scenario.message}"</span>
                                              </span>
                                            ) : null}
                                          </p>
                                        </div>

                                        {/* Information Section */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/50">
                                          <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-yellow-50/30 border border-border/50">
                                              <Calendar className="h-4 w-4 text-black/60" />
                                            </div>
                                            <div>
                                              <p className="text-xs font-medium text-black/50 mb-1">Created On</p>
                                              <p className="text-sm font-semibold text-black">
                                                {scenario.created_at 
                                                  ? new Date(scenario.created_at).toLocaleDateString('en-US', { 
                                                      weekday: 'short',
                                                      month: 'short', 
                                                      day: 'numeric',
                                                      year: 'numeric'
                                                    })
                                                  : "N/A"}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-yellow-50/30 border border-border/50">
                                              <CheckCircle className="h-4 w-4 text-black/60" />
                                            </div>
                                            <div>
                                              <p className="text-xs font-medium text-black/50 mb-1">Status</p>
                                              <p className="text-sm font-semibold text-black">
                                                Completed
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Performance Button */}
                                        <div className="pt-3 border-t border-border/50">
                                          <Button
                                            variant="outline"
                                            onClick={(e) => handleViewPerformance(scenario.session_id, e)}
                                            className="w-full bg-yellow-50 hover:bg-yellow-100 border-border text-black"
                                          >
                                            <BarChart3 className="h-4 w-4 mr-2" />
                                            Performance
                                          </Button>
                                        </div>
                                      </div>
                                      <ChevronRight className="h-5 w-5 text-black/30 group-hover:text-black/60 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <div className="p-4 rounded-full bg-yellow-50 border border-border">
                    <ClipboardList className="h-8 w-8 text-black/40" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-1">No scenarios assigned</h3>
                    <p className="text-sm text-muted-foreground">
                      You don't have any pending scenarios at the moment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scenario Details Dialog */}
          <Dialog open={isScenarioDialogOpen} onOpenChange={setIsScenarioDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-yellow-100 border border-border">
                    <Sparkles className="h-5 w-5 text-black" />
                  </div>
                  <span>Scenario Details</span>
                </DialogTitle>
              </DialogHeader>
              
              {selectedScenario && (
                <div className="space-y-6 pt-4">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={`text-sm font-medium px-3 py-1 ${
                        selectedScenario.is_completed
                          ? "border-green-300 bg-green-50 text-green-700"
                          : (selectedScenario.days_remaining ?? 0) === 0
                          ? "border-orange-400 bg-orange-100 text-orange-700"
                          : "border-red-300 bg-red-50 text-red-700"
                      }`}
                    >
                      {selectedScenario.is_completed ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1.5" />
                          Completed
                        </>
                      ) : (selectedScenario.days_remaining ?? 0) === 0 ? (
                        <>
                          <AlertCircle className="h-4 w-4 mr-1.5" />
                          Time lapsed
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 mr-1.5" />
                          Pending
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Message */}
                  {selectedScenario.message && (
                    <Card className="border-border bg-yellow-50/30">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-black/60 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-black/70 mb-2">Message</p>
                            <p className="text-base text-black leading-relaxed">{selectedScenario.message}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Mode Card */}
                  {selectedScenario.mode && (
                    <Card className="border-border">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-yellow-100 border border-border">
                            <Target className="h-5 w-5 text-black" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-black/50 mb-1">Mode</p>
                            <p className="text-base font-semibold text-black mb-1">{formatText(selectedScenario.mode.name) || "N/A"}</p>
                            {selectedScenario.mode.description && 
                             selectedScenario.mode.description.trim() !== selectedScenario.mode.name?.trim() && (
                              <p className="text-sm text-black/60 mt-2">{selectedScenario.mode.description}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Persona Details Card */}
                  {selectedScenario.persona && (
                      <Card className="border-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <UserCircle className="h-5 w-5" />
                            Persona Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Persona Name */}
                          <div>
                            <p className="text-xs font-medium text-black/50 mb-1">Name</p>
                            <p className="text-base font-semibold text-black">{selectedScenario.persona.name || "N/A"}</p>
                          </div>

                          {/* Industry */}
                          {selectedScenario.persona.industry && (
                            <div className="flex items-start gap-3 p-3 bg-yellow-50/30 border border-border/50 rounded-lg">
                              <Factory className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-black/50 mb-1">Industry</p>
                                <p className="text-sm font-semibold text-black">{formatText(selectedScenario.persona.industry.name) || "N/A"}</p>
                              </div>
                            </div>
                          )}

                          {/* AI Role */}
                          {selectedScenario.persona.ai_role && (
                            <div className="flex items-start gap-3 p-3 bg-yellow-50/30 border border-border/50 rounded-lg">
                              <Briefcase className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-black/50 mb-1">AI Role</p>
                                <p className="text-sm font-semibold text-black">{formatText(selectedScenario.persona.ai_role.name) || "N/A"}</p>
                              </div>
                            </div>
                          )}

                          {/* Geography */}
                          {selectedScenario.persona.geography && (
                            <div className="flex items-start gap-3 p-3 bg-yellow-50/30 border border-border/50 rounded-lg">
                              <MapPin className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-black/50 mb-1">Geography</p>
                                <p className="text-sm font-semibold text-black">{formatText(selectedScenario.persona.geography) || "N/A"}</p>
                              </div>
                            </div>
                          )}

                          {/* Plant Size Impact */}
                          {selectedScenario.persona.plant_size_impact && (
                            <div className="flex items-start gap-3 p-3 bg-yellow-50/30 border border-border/50 rounded-lg">
                              <Factory className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-black/50 mb-1">Plant Size Impact</p>
                                <p className="text-sm font-semibold text-black">{selectedScenario.persona.plant_size_impact.name || "N/A"}</p>
                              </div>
                            </div>
                          )}

                          {/* Manufacturing Model */}
                          {selectedScenario.persona.manufacturing_model && (
                            <div className="flex items-start gap-3 p-3 bg-yellow-50/30 border border-border/50 rounded-lg">
                              <Building className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-black/50 mb-1">Manufacturing Model</p>
                                <p className="text-sm font-semibold text-black">{selectedScenario.persona.manufacturing_model.name || "N/A"}</p>
                              </div>
                            </div>
                          )}

                          {/* Company Size */}
                          {selectedScenario.persona.company_size_new && (
                            <div className="flex items-start gap-3 p-3 bg-yellow-50/30 border border-border/50 rounded-lg">
                              <Building className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-black/50 mb-1">Company Size</p>
                                <p className="text-sm font-semibold text-black">{selectedScenario.persona.company_size_new.name || "N/A"}</p>
                              </div>
                            </div>
                          )}

                          {/* Gender */}
                          {selectedScenario.persona.gender && (
                            <div className="flex items-start gap-3 p-3 bg-yellow-50/30 border border-border/50 rounded-lg">
                              <UserCircle className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-black/50 mb-1">Gender</p>
                                <p className="text-sm font-semibold text-black">{formatText(selectedScenario.persona.gender) || "N/A"}</p>
                              </div>
                            </div>
                          )}

                          {/* Persona Products */}
                          {selectedScenario.persona.persona_products && selectedScenario.persona.persona_products.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-black/50 mb-2">Products</p>
                              <div className="space-y-2">
                                {selectedScenario.persona.persona_products.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50/30 border border-border/50 rounded-lg">
                                    <Package className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-black">{item.product?.name || "N/A"}</p>
                                      {item.product?.details && 
                                       item.product.details.trim() !== item.product?.name?.trim() && (
                                        <p className="text-xs text-black/60 mt-1">{item.product.details}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                  {/* Details Grid */}
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold">Timeline & Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                          (selectedScenario.days_remaining ?? 0) === 0 
                            ? "bg-orange-50/30 border-orange-200" 
                            : "bg-yellow-50/30 border-border/50"
                        }`}>
                          {(selectedScenario.days_remaining ?? 0) === 0 ? (
                            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          ) : (
                          <Clock className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-xs font-medium text-black/50 mb-1">Days Remaining</p>
                            <p className={`text-sm font-semibold ${
                              (selectedScenario.days_remaining ?? 0) === 0 ? "text-orange-700" : "text-black"
                            }`}>
                              {(selectedScenario.days_remaining ?? 0) === 0 ? "0 days (Time lapsed)" : `${selectedScenario.days_remaining || 0} days`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Start Session Button */}
                  <div className="pt-4 border-t flex justify-center">
                    {selectedScenario.is_completed ? (
                      <Button
                        className="h-12 px-8 text-base font-semibold bg-green-600 hover:bg-green-700"
                        disabled={true}
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Session Completed
                      </Button>
                    ) : hasSessionStarted(selectedScenario.session_id) ? (
                      <Button
                        className="h-12 px-8 text-base font-semibold"
                        disabled={true}
                      >
                        <Clock className="h-5 w-5 mr-2" />
                        Session Already Started
                      </Button>
                    ) : (
                      <Button
                        className="h-12 px-8 text-base font-semibold"
                        onClick={handleStartSessionClick}
                        disabled={!selectedScenario || !selectedScenario.mode || !selectedScenario.session_id || !selectedScenario.persona}
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Start Session
                      </Button>
                    )}
                  </div>

                  {/* Confirmation Dialog */}
                  <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Start Session</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to start? You cannot access it again after you end at the middle of the session.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmStartSession}>
                          Yes, Start Session
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Performance Report Dialog */}
          <Dialog open={isPerformanceDialogOpen} onOpenChange={setIsPerformanceDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-yellow-100 border border-border">
                    <BarChart3 className="h-5 w-5 text-black" />
                  </div>
                  <span>Performance Report</span>
                </DialogTitle>
              </DialogHeader>
              
              {performanceLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                    <p className="text-muted-foreground text-sm">Loading performance report...</p>
                  </div>
                </div>
              ) : performanceData ? (
                <div className="space-y-6 pt-4">
                  {/* Overall Score */}
                  {typeof performanceData.overall_score === 'number' && (
                    <Card className="border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-5 h-5 text-black" />
                          <span className="text-sm font-medium text-black">Overall Score</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-4xl font-bold text-black">{performanceData.overall_score.toFixed(1)}</div>
                          <div className="flex-1">
                            <Progress value={performanceData.overall_score} className="h-3" />
                          </div>
                          <div className="text-sm text-black/60">/100</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Skills Breakdown */}
                  {performanceData.skills && Object.keys(performanceData.skills).length > 0 && (
                    <Card className="border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Skills Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {Object.entries(performanceData.skills).map(([skill, score]: [string, any]) => (
                          <div key={skill} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-black">{formatSkillName(skill)}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-black font-semibold">
                                  {typeof score === 'number' ? score.toFixed(1) : 'N/A'}/100
                                </span>
                              </div>
                            </div>
                            <Progress
                              value={typeof score === 'number' ? score : 0}
                              className="h-2"
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Additional Performance Metrics */}
                  {performanceData.mode_name && (
                    <Card className="border-border">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-yellow-100 border border-border">
                            <Target className="h-5 w-5 text-black" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-black/50 mb-1">Mode</p>
                            <p className="text-base font-semibold text-black">{formatText(performanceData.mode_name)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Display all other fields from performance data */}
                  {Object.entries(performanceData).map(([key, value]: [string, any]) => {
                    // Skip already displayed fields and coaching fields (handled separately)
                    if (['overall_score', 'skills', 'mode_name', 'coaching_summary', 'coaching_notes', 'feedback', 'recommendations', 'areas_for_improvement', 'strengths', 'weaknesses'].includes(key)) return null;
                    
                    // Skip null/undefined values
                    if (value === null || value === undefined) return null;
                    
                    // Skip objects and arrays (they're complex structures)
                    if (typeof value === 'object' && !Array.isArray(value)) return null;
                    
                    return (
                      <Card key={key} className="border-border">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-yellow-50/30 border border-border/50">
                              <Info className="h-4 w-4 text-black/60" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-black/50 mb-1">{formatSkillName(key)}</p>
                              <p className="text-sm font-semibold text-black">
                                {typeof value === 'number' ? value.toFixed(2) : String(value)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Coaching Summary Section */}
                  {(performanceData.coaching_summary || 
                    performanceData.coaching_notes || 
                    performanceData.feedback || 
                    performanceData.recommendations ||
                    performanceData.areas_for_improvement ||
                    performanceData.strengths ||
                    performanceData.weaknesses) && (
                    <Card className="border-border bg-yellow-50/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-black" />
                          Coaching Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Coaching Summary */}
                        {performanceData.coaching_summary && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-black/70">Summary</p>
                            <div className="bg-white p-6 rounded-lg border border-border/50">
                              {typeof performanceData.coaching_summary === 'string' 
                                ? formatCoachingText(performanceData.coaching_summary)
                                : <p className="text-sm text-black leading-relaxed">{JSON.stringify(performanceData.coaching_summary)}</p>}
                            </div>
                          </div>
                        )}

                        {/* Coaching Notes */}
                        {performanceData.coaching_notes && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-black/70">Coaching Notes</p>
                            <div className="bg-white p-6 rounded-lg border border-border/50">
                              {typeof performanceData.coaching_notes === 'string' 
                                ? formatCoachingText(performanceData.coaching_notes)
                                : <p className="text-sm text-black leading-relaxed">{JSON.stringify(performanceData.coaching_notes)}</p>}
                            </div>
                          </div>
                        )}

                        {/* Feedback */}
                        {performanceData.feedback && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-black/70">Feedback</p>
                            <div className="bg-white p-6 rounded-lg border border-border/50">
                              {typeof performanceData.feedback === 'string' 
                                ? formatCoachingText(performanceData.feedback)
                                : <p className="text-sm text-black leading-relaxed">{JSON.stringify(performanceData.feedback)}</p>}
                            </div>
                          </div>
                        )}

                        {/* Strengths */}
                        {performanceData.strengths && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-black/70 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              Strengths
                            </p>
                            <div className="bg-white p-4 rounded-lg border border-border/50">
                              {Array.isArray(performanceData.strengths) ? (
                                <ul className="list-disc list-inside space-y-1 text-sm text-black">
                                  {performanceData.strengths.map((strength: string, idx: number) => (
                                    <li key={idx} className="leading-relaxed">{strength}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-black leading-relaxed">
                                  {typeof performanceData.strengths === 'string' 
                                    ? performanceData.strengths 
                                    : JSON.stringify(performanceData.strengths)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Areas for Improvement */}
                        {performanceData.areas_for_improvement && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-black/70 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-600" />
                              Areas for Improvement
                            </p>
                            <div className="bg-white p-4 rounded-lg border border-border/50">
                              {Array.isArray(performanceData.areas_for_improvement) ? (
                                <ul className="list-disc list-inside space-y-1 text-sm text-black">
                                  {performanceData.areas_for_improvement.map((area: string, idx: number) => (
                                    <li key={idx} className="leading-relaxed">{area}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-black leading-relaxed">
                                  {typeof performanceData.areas_for_improvement === 'string' 
                                    ? performanceData.areas_for_improvement 
                                    : JSON.stringify(performanceData.areas_for_improvement)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Weaknesses */}
                        {performanceData.weaknesses && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-black/70 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              Areas to Focus On
                            </p>
                            <div className="bg-white p-4 rounded-lg border border-border/50">
                              {Array.isArray(performanceData.weaknesses) ? (
                                <ul className="list-disc list-inside space-y-1 text-sm text-black">
                                  {performanceData.weaknesses.map((weakness: string, idx: number) => (
                                    <li key={idx} className="leading-relaxed">{weakness}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-black leading-relaxed">
                                  {typeof performanceData.weaknesses === 'string' 
                                    ? performanceData.weaknesses 
                                    : JSON.stringify(performanceData.weaknesses)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {performanceData.recommendations && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-black/70 flex items-center gap-2">
                              <Target className="h-4 w-4 text-blue-600" />
                              Recommendations
                            </p>
                            <div className="bg-white p-4 rounded-lg border border-border/50">
                              {Array.isArray(performanceData.recommendations) ? (
                                <ul className="list-disc list-inside space-y-1 text-sm text-black">
                                  {performanceData.recommendations.map((rec: string, idx: number) => (
                                    <li key={idx} className="leading-relaxed">{rec}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-black leading-relaxed">
                                  {typeof performanceData.recommendations === 'string' 
                                    ? performanceData.recommendations 
                                    : JSON.stringify(performanceData.recommendations)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <div className="p-4 rounded-full bg-yellow-50 border border-border">
                    <BarChart3 className="h-8 w-8 text-black/40" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-1">No performance data available</h3>
                    <p className="text-sm text-muted-foreground">
                      Performance report data is not available for this session.
                    </p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="p-4 rounded-full bg-yellow-50 border border-border">
                <ClipboardList className="h-8 w-8 text-black/40" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black mb-1">No data available</h3>
                <p className="text-sm text-muted-foreground">
                  Unable to load scenario information at this time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
