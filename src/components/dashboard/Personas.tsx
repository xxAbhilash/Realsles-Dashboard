import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Brain, Shield, DollarSign, Zap, Clock, MoveDownRight, MoveUpRight } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { apis } from "@/utils/apis";

const personaIcons: Record<string, any> = {
  "Aggressive Buyer": Zap,
  "Skeptical Buyer": Shield,
  "Budget-Conscious Buyer": DollarSign,
  "Technical Buyer": Brain,
  "Friendly Buyer": User,
  "Time-Pressed Buyer": Clock,
};

export function Personas() {
  const { Get } = useApi();
  const user = useSelector((state: any) => state.auth.user);
  const [personasData, setPersonasData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPersonas, setTotalPersonas] = useState<number>(0);

  let capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchPersonas = async () => {
      if (!user?.user_id) return;
      setLoading(true);
      // Get all personas in the system
      try {
        const allPersonas = await Get(apis.ai_personas);
        if (Array.isArray(allPersonas)) {
          setTotalPersonas(allPersonas.length);
        } else {
          setTotalPersonas(0);
        }
      } catch (e) {
        setTotalPersonas(0);
      }
      // Get sessions for user
      const sessions = await Get(apis.by_user + user.user_id);
      if (!Array.isArray(sessions)) {
        setLoading(false);
        return;
      }
      // Aggregate sessions by persona_id and use overall_score from performance_report
      const personaStats: Record<string, any> = {};
      for (const session of sessions) {
        const personaId = session.persona_id;
        if (!personaId) continue;
        // Use start_time if available, else fallback to date
        const sessionTime = session.start_time ? new Date(session.start_time) : (session.date ? new Date(session.date) : null);
        if (!personaStats[personaId]) {
          personaStats[personaId] = {
            persona_id: personaId,
            sessions: 0,
            scores: [],
            lastUsed: sessionTime,
          };
        }
        personaStats[personaId].sessions += 1;
        // Use overall_score from performance_report if available
        const overallScore = session.performance_report?.overall_score;
        if (typeof overallScore === 'number') {
          personaStats[personaId].scores.push(overallScore);
        }
        // Update lastUsed if newer
        if (sessionTime && (!personaStats[personaId].lastUsed || sessionTime > personaStats[personaId].lastUsed)) {
          personaStats[personaId].lastUsed = sessionTime;
        }
      }
      // Fetch persona details for each persona_id
      const personaEntries = await Promise.all(
        Object.values(personaStats).map(async (stat: any) => {
          const personaDetail = await Get(apis.ai_persona_by_id + stat.persona_id);
          // Format lastUsed as 'Mon D YYYY' if available
          let lastUsedStr = "-";
          if (stat.lastUsed instanceof Date && !isNaN(stat.lastUsed)) {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const m = months[stat.lastUsed.getMonth()];
            const d = stat.lastUsed.getDate();
            const y = stat.lastUsed.getFullYear();
            lastUsedStr = `${m} ${d} ${y}`;
          }
          return {
            persona: personaDetail?.name || "Unknown Persona",
            icon: personaIcons[personaDetail?.name] || User,
            sessions: stat.sessions,
            avgScore: stat.scores.length > 0 ? (stat.scores.reduce((a: number, b: number) => a + b, 0) / stat.scores.length) : 0,
            lastUsed: lastUsedStr,
            difficulty: personaDetail?.difficulty || "Medium",
            characteristics: personaDetail?.characteristics || [],
            description: personaDetail?.description || "No description available",
            color: personaDetail?.color || "primary",
            personaDetail: personaDetail
          };
        })
      );
      setPersonasData(personaEntries);
      setLoading(false);
    };
    fetchPersonas();
  }, [user?.user_id, Get]);

  const totalSessions = personasData.reduce((acc, persona) => acc + persona.sessions, 0);
  const avgPerformance = personasData.length > 0 ? personasData.reduce((acc, persona) => acc + persona.avgScore, 0) / personasData.length : 0;
  // Removed mostChallenging, added personasUsed
  const personasUsed = personasData.length;

  if (loading) {
    return <div className="p-6">Loading Persona Data...</div>;
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Personas</h1>
          <p className="text-muted-foreground">Practice with different buyer personalities and behaviors</p>
        </div>
      </div>
      {/* Persona Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Total Personas</span>
            </div>
            <div className="text-3xl font-bold">{totalPersonas}</div>
            <div className="text-sm text-muted-foreground">Available types</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium">Personas Used</span>
            </div>
            <div className="text-3xl font-bold">{personasUsed}</div>
            <div className="text-sm text-muted-foreground">Used in sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-success" />
              <span className="text-sm font-medium">Sessions</span>
            </div>
            <div className="text-3xl font-bold">{totalSessions}</div>
            <div className="text-sm text-muted-foreground">Total interactions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-info" />
              <span className="text-sm font-medium">Avg Performance</span>
            </div>
            <div className="text-3xl font-bold">{avgPerformance.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Across all personas</div>
          </CardContent>
        </Card>
      </div>
      {/* Performance by Persona */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Persona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personasData
              .sort((a, b) => b.avgScore - a.avgScore)
              .map((persona, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-40 text-sm font-medium">{persona.persona}</div>
                  <div className="flex-1">
                    <Progress value={persona.avgScore} max={100} className="h-3" />
                  </div>
                  <div className="w-16 text-sm font-bold text-right">
                    {persona.avgScore.toFixed(1)}/100
                  </div>
                  <div className="w-24 text-sm text-muted-foreground text-right">
                    {persona.sessions} sessions
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
      {/* Personas Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {personasData.map((persona, index) => {
          const IconComponent = persona.icon;
          const usagePercentage = totalSessions > 0 ? (persona.sessions / totalSessions) * 100 : 0;
          // Trend logic and badge (same as ModesUsed)
          let trend = "down";
          let trendColor = "bg-destructive/10 text-destructive";
          let TrendIcon = MoveDownRight;
          if (persona.avgScore >= 80) {
            trend = "up-green";
            trendColor = "bg-success/10 text-success";
            TrendIcon = MoveUpRight;
          } else if (persona.avgScore >= 65) {
            trend = "up-yellow";
            trendColor = "bg-warning/10 text-warning";
            TrendIcon = MoveUpRight;
          }
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${persona.color}/10`}>
                      <IconComponent className={`w-5 h-5 text-${persona.color}`} />
                    </div>
                    <CardTitle className="text-lg">{persona.persona}</CardTitle>
                  </div>
                  <Badge
                    variant={trend === "up-green" ? "secondary" : trend === "up-yellow" ? "secondary" : "outline"}
                    className={trendColor}
                  >
                    <TrendIcon className="w-4 h-4" />
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* <p className="text-sm text-muted-foreground">{persona.description}</p> */}
                
                <div
            className={`overflow-auto w-full`}
          >
            <p className="m-plus-rounded-1c-semibold text-lg text-[#000000] uppercase pb-1.5">
              {persona?.personaDetail?.name?.replace(/_/g, " ")}
            </p>
            <p className="font-medium m-plus-rounded-1c-bold text-[1.05rem] capitalize">
              Details:
            </p>
            <p className="flex items-start gap-2 sora-medium md:text-[14px] text-[13px]">
              <span className="p-0.5 mt-2 rounded-full bg-[#2d2d2d]" />
              {capitalize(persona?.personaDetail?.ai_role?.name?.replace(/_/g, " "))}
            </p>
            <p className="flex items-start gap-2 sora-medium md:text-[14px] text-[13px]">
              <span className="p-0.5 mt-2 rounded-full bg-[#2d2d2d]" />
              {capitalize(persona?.personaDetail?.industry?.name?.replace(/_/g, " "))}
            </p>
            <p className="flex items-start gap-2 sora-medium md:text-[14px] text-[13px]">
              <span className="p-0.5 mt-2 rounded-full bg-[#2d2d2d]" />
              {capitalize(persona?.personaDetail?.manufacturing_model?.name?.replace(/_/g, " "))}
            </p>
            <p className="flex items-start gap-2 sora-medium md:text-[14px] text-[13px]">
              <span className="p-0.5 mt-2 rounded-full bg-[#2d2d2d]" />
              {capitalize(persona?.personaDetail?.plant_size_impact?.name?.replace(/_/g, " "))}
            </p>
            <p className="flex items-start gap-2 sora-medium md:text-[14px] text-[13px]">
              <span className="p-0.5 mt-2 rounded-full bg-[#2d2d2d]" />
              {capitalize(persona?.personaDetail?.company_size_new?.name?.replace(/_/g, " "))}&nbsp;
              {persona?.personaDetail?.company_size_new?.name === "small"
                ? "(1-500)"
                : persona?.personaDetail?.company_size_new?.name === "medium"
                ? "(501-5,000)"
                : persona?.personaDetail?.company_size_new?.name === "large"
                ? "(5,000+)"
                : ""}
            </p>
            <p className="flex items-start gap-2 sora-medium md:text-[14px] text-[13px]">
              <span className="p-0.5 mt-2 rounded-full bg-[#2d2d2d]" />
              {persona?.personaDetail?.geography?.replace(/_/g, " ")}
            </p>
            {persona?.personaDetail?.persona_products?.length > 0 && (
              <div className="mt-2">
                <p className="font-medium m-plus-rounded-1c-bold text-[1.05rem] capitalize">
                  Products:
                </p>
                <div className="list-disc list-inside text-[13px]">
                  {persona?.personaDetail?.persona_products.map((prod, idx) => (
                    <p
                      className="flex items-start gap-2 sora-medium md:text-[14px] text-[13px]"
                      key={idx}
                    >
                      <span className="p-0.5 mt-2 rounded-full bg-[#2d2d2d]" />
                      {capitalize(prod?.product?.name?.replace(/_/g, " "))}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

                <div className="space-y-2">
                  {/* <div className="text-sm font-medium">Characteristics:</div> */}
                  <div className="flex flex-wrap gap-1">
                    {persona.characteristics.map((char: string, charIndex: number) => (
                      <Badge key={charIndex} variant="outline" className="text-xs">
                        {char}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usage</span>
                    <span>{persona.sessions} sessions ({usagePercentage.toFixed(0)}%)</span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Score</div>
                    <div className="text-lg font-bold">
                      <span
                        className={
                          trend === "up-green"
                            ? "text-success"
                            : trend === "up-yellow"
                              ? "text-warning"
                              : "text-destructive"
                        }
                      >
                        {persona.avgScore.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground text-sm">/100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Last Used</div>
                    <div className="text-sm font-medium">{persona.lastUsed}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}