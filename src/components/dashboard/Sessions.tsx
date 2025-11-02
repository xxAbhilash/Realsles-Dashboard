import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Calendar, Clock, TrendingUp, ChevronDown } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useSelector } from "react-redux";
import { apis } from "@/utils/apis";
import { useNavigate } from "react-router-dom";


export function Sessions() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);
  const FILTERS = [
    { label: "All", value: "all" },
    { label: "1 Day", value: "1d" },
    { label: "7 Days", value: "7d" },
    { label: "1 Month", value: "1m" },
    { label: "6 Months", value: "6m" },
    { label: "1 Year", value: "1y" },
  ];


  const handleStartSession = () => {
    window.location.href = "https://mainreal-sales.vercel.app/about";
  };


  const { Get } = useApi();
  const { by_user } = apis;
  const user = useSelector((state: any) => state.auth.user);
  const [sessionsData, setSessionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.user_id) return;
      setLoading(true);
      const data = await Get(`${by_user}${user.user_id}`);
      if (Array.isArray(data)) {
        // For each session, fetch mode and persona details
        const sessionsWithDetails = await Promise.all(
          data.map(async (session: any) => {
            let modeName = session.mode;
            let personaName = session.persona;
            // Fetch mode name if mode_id exists
            if (session.mode_id) {
              const modeDetail = await Get(apis.interaction_modes + session.mode_id);
              modeName = modeDetail?.name || modeName || "Unknown Mode";
            }
            // Fetch persona name if persona_id exists
            if (session.persona_id) {
              const personaDetail = await Get(apis.ai_persona_by_id + session.persona_id);
              personaName = personaDetail?.name || personaName || "Unknown Persona";
            }
            return {
              ...session,
              mode: modeName,
              persona: personaName,
              date: session.date || session.created_at || "",
              overall_score: session.performance_report?.overall_score ?? null,
            };
          })
        );
        setSessionsData(sessionsWithDetails);
      }
      setLoading(false);
    };
    fetchSessions();
  }, [user?.user_id]);

  // Helper to get date range
  const getDateLimit = (filter: string) => {
    const now = new Date();
    switch (filter) {
      case "1d":
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, now.getHours(), now.getMinutes(), now.getSeconds());
      case "7d":
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, now.getHours(), now.getMinutes(), now.getSeconds());
      case "1m":
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
      case "6m":
        return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
      case "1y":
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
      default:
        return null;
    }
  };

  // Filtered sessions for the card
  const filteredSessions = selectedFilter === "all"
    ? sessionsData
    : sessionsData.filter(session => {
      const sessionDate = session.start_time ? new Date(session.start_time) : (session.date ? new Date(session.date) : null);
      const limit = getDateLimit(selectedFilter);
      return sessionDate && limit && sessionDate >= limit;
    });

  // Count for the card
  const filteredCount = selectedFilter === "all" ? sessionsData.length : filteredSessions.length;

  const totalSessions = sessionsData.length;
  const avgScore = totalSessions > 0
    ? sessionsData.reduce((acc, session) => acc + (typeof session.overall_score === 'number' ? session.overall_score : 0), 0) / totalSessions
    : 0;
  // duration is in seconds, sum all seconds
  const totalDurationSeconds = sessionsData.reduce((acc, session) => {
    let seconds = 0;
    if (typeof session.duration === 'number') {
      seconds = session.duration;
    } else if (typeof session.duration === 'string') {
      // Try to extract the number of seconds from a string
      const match = session.duration.match(/(\d+)/);
      if (match) {
        seconds = parseInt(match[1], 10);
      }
    }
    return acc + (isNaN(seconds) ? 0 : seconds);
  }, 0);

  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
  const totalSeconds = totalDurationSeconds % 60;

  if (loading) {
    return <div className="p-6">Loading Session Data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground">Track your AI Coaching sessions and progress</p>
        </div>
        <Button onClick={() => handleStartSession()}>Start New Session</Button>
      </div>

      {/* Session Statistics */}


      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Total Sessions</span>
            </div>
            <div className="text-3xl font-bold">{totalSessions}</div>
            <div className="text-sm text-muted-foreground">All time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="text-sm font-medium">Avg Performance</span>
            </div>
            <div className="text-3xl font-bold">{avgScore.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Across all sessions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-info" />
              <span className="text-sm font-medium">Total Time</span>
            </div>
            <div className="text-3xl font-bold">{totalHours}h {totalMinutes}m {totalSeconds}s</div>
            <div className="text-sm text-muted-foreground">Across all sessions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium">Sort Sessions</span>
            </div>
            <div className="inline-block relative mb-2" ref={filterRef}>
              <button
                className="flex items-center px-2 py-1 border rounded bg-white shadow-sm text-xs cursor-pointer min-w-[90px]"
                onClick={() => setShowDropdown(v => !v)}
              >
                {FILTERS.find(f => f.value === selectedFilter)?.label || "All"}
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
              {showDropdown && (
                <div className="absolute z-10 mt-1 bg-white border rounded shadow-lg min-w-[90px] left-0">
                  {FILTERS.map(f => (
                    <div
                      key={f.value}
                      className={`px-2 py-1 hover:bg-muted cursor-pointer text-xs ${selectedFilter === f.value ? 'font-bold text-primary' : ''}`}
                      onClick={() => { setSelectedFilter(f.value); setShowDropdown(false); }}
                    >
                      {f.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">Filter by date range</div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <div className="text-sm text-muted-foreground mt-1">
            Showing: <span className="font-semibold text-primary">{FILTERS.find(f => f.value === selectedFilter)?.label || "All"}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">
                      <span className="capitalize">{session.mode}</span> <span className="text-muted-foreground">|</span> {session.persona} <span className="text-muted-foreground">|</span> {session.date ? session.date.slice(0, 10) : ""}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-medium">{session.duration} <span className="text-xs text-muted-foreground">s</span></div>
                  </div>

                  <div className="text-right min-w-[100px]">
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                    <div className="font-bold text-lg">
                      {typeof session.overall_score === 'number' ? (
                        <span className="text-black">{session.overall_score}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                      <span className="text-muted-foreground text-sm">/100</span>
                    </div>
                  </div>

                  <Badge variant={session.status === "completed" ? "secondary" : "default"}>
                    {session.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}