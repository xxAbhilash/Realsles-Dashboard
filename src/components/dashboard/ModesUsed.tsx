import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Phone, Presentation, MessageCircle, Users, TrendingUp, MoveDownRight, MoveUpRight } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { apis } from "@/utils/apis";

const modeIcons: Record<string, any> = {
  "Cold Calling": Phone,
  "Product Demo": Presentation,
  "Objection Handling": MessageCircle,
  "Discovery Call": Target,
  "Closing Techniques": TrendingUp,
};

export function ModesUsed() {
  const { Get } = useApi();
  const user = useSelector((state: any) => state.auth.user);
  const [modesData, setModesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modeAverages, setModeAverages] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchModes = async () => {
      if (!user?.user_id) return;
      setLoading(true);
      // Get sessions for user
      const sessions = await Get(apis.by_user + user.user_id);
      if (!Array.isArray(sessions)) {
        setLoading(false);
        return;
      }
      // Aggregate sessions by mode_id and track most recent start_time for each mode
      const modeStats: Record<string, any> = {};
      for (const session of sessions) {
        const modeId = session.mode_id;
        if (!modeId) continue;
        const sessionTime = session.start_time ? new Date(session.start_time) : (session.date ? new Date(session.date) : null);
        if (!modeStats[modeId]) {
          modeStats[modeId] = {
            mode_id: modeId,
            sessions: 0,
            scores: [],
            lastUsed: sessionTime,
          };
        }
        modeStats[modeId].sessions += 1;
        modeStats[modeId].scores.push(session.score || 0);
        // Update lastUsed if newer
        if (sessionTime && (!modeStats[modeId].lastUsed || sessionTime > modeStats[modeId].lastUsed)) {
          modeStats[modeId].lastUsed = sessionTime;
        }
      }
      // Helper to capitalize specific mode names
      const capitalizeModeName = (name: string) => {
        if (!name) return name;
        if (["discovering", "closing", "prospecting"].includes(name.toLowerCase())) {
          return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        }
        return name;
      };

      // Fetch mode averages from performance report
      let modeAveragesMap: Record<string, number> = {};
      try {
        const perf = await Get(apis.performance_manager_average_by_modes + user.user_id + "/average-by-modes");
        if (perf && Array.isArray(perf.mode_averages)) {
          for (const mode of perf.mode_averages) {
            const modeName = capitalizeModeName(mode.mode_name);
            const overallScore = mode.average_scores?.overall_score;
            if (typeof overallScore === 'number') {
              modeAveragesMap[modeName] = overallScore;
            }
          }
        }
      } catch (e) { }
      setModeAverages(modeAveragesMap);

      const modeEntries = await Promise.all(
        Object.values(modeStats).map(async (stat: any) => {
          const modeDetail = await Get(apis.interaction_modes + stat.mode_id);
          let modeName = modeDetail?.name || "Unknown Mode";
          modeName = capitalizeModeName(modeName);
          // Format lastUsed as 'Mon D YYYY' (e.g., Aug 8 2025) if available
          let lastUsedStr = "-";
          if (stat.lastUsed instanceof Date && !isNaN(stat.lastUsed)) {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const m = months[stat.lastUsed.getMonth()];
            const d = stat.lastUsed.getDate();
            const y = stat.lastUsed.getFullYear();
            lastUsedStr = `${m} ${d} ${y}`;
          }
          const avgScore = typeof modeAveragesMap[modeName] === 'number' ? modeAveragesMap[modeName] : 0;
          let trend = "down";
          let trendColor = "bg-destructive/10 text-destructive";
          let TrendIcon = MoveDownRight;
          if (avgScore >= 80) {
            trend = "up-green";
            trendColor = "bg-success/10 text-success";
            TrendIcon = MoveUpRight;
          } else if (avgScore >= 60) {
            trend = "up-yellow";
            trendColor = "bg-warning/10 text-warning";
            TrendIcon = MoveUpRight;
          }
          return {
            mode: modeName,
            icon: modeIcons[modeName] || Target,
            sessions: stat.sessions,
            totalSessions: sessions.length,
            avgScore,
            lastUsed: lastUsedStr,
            trend,
            trendColor,
            TrendIcon,
            description: modeDetail?.description || "No description available"
          };
        })
      );
      setModesData(modeEntries.reverse());
      setLoading(false);
    };
    fetchModes();
  }, [user?.user_id]);


  const mostUsedMode = modesData.length > 0
    ? modesData.reduce((prev, current) => (current.totalSessions > prev.totalSessions ? current : prev), modesData[0])
    : {};

  const bestPerformingMode = modesData.length > 0
    ? modesData.reduce((prev, current) => (current.avgScore > prev.avgScore ? current : prev), modesData[0])
    : {};

  if (loading) {
    return <div className="p-6">Loading Modes Data...</div>;
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modes</h1>
          <p className="text-muted-foreground">Explore different acceleration scenarios and track usage</p>
        </div>
      </div>

      {/* Mode Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Total Modes</span>
            </div>
            <div className="text-3xl font-bold">{modesData.length}</div>
            <div className="text-sm text-muted-foreground">Acceleration scenarios</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-success" />
              <span className="text-sm font-medium">Most Used</span>
            </div>
            <div className="text-lg font-bold">{mostUsedMode.mode}</div>
            <div className="text-sm text-muted-foreground">{mostUsedMode.sessions} sessions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-info" />
              <span className="text-sm font-medium">Best Performance</span>
            </div>
            <div className="text-lg font-bold">{bestPerformingMode.mode}</div>
            <div className="text-sm text-muted-foreground">Avg {bestPerformingMode.avgScore}/100</div>
          </CardContent>
        </Card>
      </div>

      {/* Modes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modesData.map((mode, index) => {
          const IconComponent = mode.icon;
          const usagePercentage = (mode.sessions / mode.totalSessions) * 100;

          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{mode.mode}</CardTitle>
                  </div>
                  <Badge
                    variant={mode.trend === "up-green" ? "secondary" : mode.trend === "up-yellow" ? "secondary" : "outline"}
                    className={mode.trendColor}
                  >
                    <mode.TrendIcon className="w-4 h-4" />
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{mode.description}</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usage</span>
                    <span>{mode.sessions} sessions ({usagePercentage.toFixed(0)}%)</span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Score</div>
                    <div className="text-lg font-bold">
                      <span
                        className={
                          mode.trend === "up-green"
                            ? "text-success"
                            : mode.trend === "up-yellow"
                              ? "text-warning"
                              : "text-destructive"
                        }
                      >
                        {mode.avgScore}
                      </span>
                      <span className="text-muted-foreground text-sm">/100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Last Used</div>
                    <div className="text-sm font-medium">{mode.lastUsed}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage Distribution - SVG Bar Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Prepare data for three modes: Closing, Prospecting, Discovering */}
          {(() => {
            // Map mode names to colors and labels
            const modeMap = {
              "Closing": { color: "#22c55e", label: "Closing" }, // green
              "Prospecting": { color: "#3b82f6", label: "Prospecting" }, // blue
              "Discovering": { color: "#ef4444", label: "Discovering" } // red
            };
            // Aggregate sessions for each mode
            const modeCounts: Record<string, number> = {
              Closing: 0,
              Prospecting: 0,
              Discovering: 0
            };
            modesData.forEach(mode => {
              // Map real mode names to the three categories
              if (mode.mode.toLowerCase().includes("clos")) modeCounts.Closing += mode.sessions;
              else if (mode.mode.toLowerCase().includes("prospect")) modeCounts.Prospecting += mode.sessions;
              else if (mode.mode.toLowerCase().includes("discover")) modeCounts.Discovering += mode.sessions;
            });
            const totalSessions = Object.values(modeCounts).reduce((a, b) => a + b, 0) || 1;
            // Bar graph dimensions
            const barHeight = 32;
            const barMaxWidth = 300;
            const graphData = [
              { key: "Closing", ...modeMap.Closing, count: modeCounts.Closing },
              { key: "Prospecting", ...modeMap.Prospecting, count: modeCounts.Prospecting },
              { key: "Discovering", ...modeMap.Discovering, count: modeCounts.Discovering }
            ];
            // Pie chart dimensions
            const pieSize = 340;
            const center = pieSize / 2;
            const radius = pieSize / 2 - 24;
            // If no sessions, show fallback
            if (totalSessions === 0) {
              return <div className="text-muted-foreground text-center py-8">No data available</div>;
            }
            // If only one mode has all the sessions, show a full pie for that mode
            const nonZeroModes = graphData.filter(m => m.count > 0);
            let slices;
            if (nonZeroModes.length === 1) {
              // Draw a full circle for the only mode used
              slices = [
                <circle
                  key={nonZeroModes[0].key}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill={nonZeroModes[0].color}
                  filter="url(#pieShadow)"
                />
              ];
            } else {
              // Calculate pie slices based on session counts
              let startAngle = 0;
              slices = graphData.map((mode) => {
                const percent = mode.count / totalSessions;
                const angle = percent * 2 * Math.PI;
                const endAngle = startAngle + angle;
                // Calculate coordinates for arc
                const x1 = center + radius * Math.cos(startAngle);
                const y1 = center + radius * Math.sin(startAngle);
                const x2 = center + radius * Math.cos(endAngle);
                const y2 = center + radius * Math.sin(endAngle);
                const largeArcFlag = angle > Math.PI ? 1 : 0;
                const pathData = [
                  `M ${center} ${center}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                const slice = (
                  <path
                    key={mode.key}
                    d={pathData}
                    fill={mode.color}
                    stroke="#fff"
                    strokeWidth={2}
                    filter="url(#pieShadow)"
                  />
                );
                startAngle = endAngle;
                return slice;
              });
            }
            // Pie chart legend
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, width: '100%' }}>
                <svg width={pieSize} height={pieSize} style={{ display: 'block' }}>
                  <defs>
                    <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity="0.18" />
                    </filter>
                  </defs>
                  {slices}
                  {/* Center label */}
                  <text
                    x={center}
                    y={center}
                    textAnchor="middle"
                    fontSize="26"
                    fill="#fde047"
                    dy="10"
                    style={{
                      textShadow: '0 2px 8px #222, 0 0px 2px #000',
                      fontWeight: 700,
                    }}
                  >
                    Total: {totalSessions}
                  </text>
                </svg>
                <div style={{ minWidth: 220, textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: pieSize }}>
                  {graphData.map((mode) => (
                    <div key={mode.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
                      <span style={{ display: 'inline-block', width: 24, height: 24, background: mode.color, borderRadius: 4, marginRight: 16 }}></span>
                      <span style={{ fontWeight: 700, fontSize: 18 }}>{mode.label}</span>
                      <span style={{ marginLeft: 16, color: '#6b7280', fontSize: 16 }}>{mode.count} ({((mode.count / totalSessions) * 100).toFixed(0)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}