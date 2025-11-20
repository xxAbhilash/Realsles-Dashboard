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
  Play
} from "lucide-react";
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-black">Your Scenarios</h2>
                <Badge variant="outline" className="bg-yellow-50 text-black border-border">
                  {scenarioData.pending_scenarios.length} {scenarioData.pending_scenarios.length === 1 ? 'item' : 'items'}
                </Badge>
              </div>

              <div className="grid gap-4">
                {scenarioData.pending_scenarios.map((scenario: any, index: number) => (
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
                                  : "border-red-300 bg-red-50 text-red-700"
                              }`}
                            >
                              {scenario.is_completed ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1.5" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1.5" />
                                  Pending
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
                ))}
              </div>
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
                          : "border-red-300 bg-red-50 text-red-700"
                      }`}
                    >
                      {selectedScenario.is_completed ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1.5" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 mr-1.5" />
                          Pending
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Scenario Text */}
                  {selectedScenario.scenario && (
                    <Card className="border-border bg-yellow-50/30">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-black/60 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-black/70 mb-2">Scenario Description</p>
                            <p className="text-base text-black leading-relaxed">{selectedScenario.scenario}</p>
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
                        <div className="flex items-start gap-3 p-3 bg-yellow-50/30 border border-border/50 rounded-lg">
                          <Clock className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-black/50 mb-1">Days Remaining</p>
                            <p className="text-sm font-semibold text-black">{selectedScenario.days_remaining || 0} days</p>
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
