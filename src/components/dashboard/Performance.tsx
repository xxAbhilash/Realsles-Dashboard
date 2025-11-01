import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { useApi } from "@/hooks/useApi";
import { apis } from "@/utils/apis";

import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line
} from "recharts";
// Types for API response
type SkillScore = {
  skill: string;
  score: number;
  target: number;
  improvement: string;
};

type ModeBreakdown = {
  mode: string;
  skills: SkillScore[];
  overall_score?: number | null;
};

type PerformanceApiResponse = {
  overall_average_score: number;
  trend: "up" | "down";
  modes_breakdown: ModeBreakdown[];
  total_sessions_analyzed?: number;
};

export function Performance() {
  const { Get } = useApi();
  const user = useSelector((state: any) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PerformanceApiResponse | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<Array<{ month: string; closing: number | null; prospecting: number | null; discovering: number | null }>>([]);
  const [trendLoading, setTrendLoading] = useState(true);

  // Fetch main performance data
  useEffect(() => {
    if (!user?.user_id) return;
    setLoading(true);
    async function fetchPerformance() {
      const res = await Get<any>(`${apis.performance_manager_average_by_modes}${user.user_id}/average-by-modes`);
      if (res) {
        function capitalizeMode(name: string) {
          if (!name) return name;
          if (["closing", "discovering", "prospecting"].includes(name.toLowerCase())) {
            return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
          }
          return name.charAt(0).toUpperCase() + name.slice(1);
        }
        const modes_breakdown = Array.isArray(res.mode_averages)
          ? res.mode_averages.map((mode: any) => {
              const { overall_score, ...otherScores } = mode.average_scores || {};
              const skills = Object.entries(otherScores).map(([skill, score]) => ({
                skill,
                score,
                target: 10,
                improvement: "-"
              }));
              return ({
                mode: capitalizeMode(mode.mode_name),
                overall_score: typeof overall_score === 'number' ? overall_score : null,
                skills
              });
            })
          : [];
        setData({
          overall_average_score: res.overall_average_score ?? 0,
          trend: "up",
          modes_breakdown,
          total_sessions_analyzed: res.total_sessions_analyzed ?? 0
        });
      }
      setLoading(false);
    }
    fetchPerformance();
  }, [user?.user_id, Get]);

  // Fetch monthly trend data
  useEffect(() => {
    if (!user?.user_id) return;
    setTrendLoading(true);
    async function fetchMonthlyTrend() {
      const res = await Get<any>(`${apis.performance_manager_monthly_trend}${user.user_id}/monthly-trend`);
      if (res && Array.isArray(res.monthly_trends)) {
        // Format month to short name (e.g., Jan, Feb, etc.)
        const monthShort = (m: string) => {
          let parts = m.split(/[-\/]/);
          let monthNum = -1;
          if (parts.length === 2) {
            if (parts[0].length === 4) monthNum = parseInt(parts[1], 10); // YYYY-MM
            else monthNum = parseInt(parts[0], 10); // MM-YYYY
          }
          if (monthNum >= 1 && monthNum <= 12) {
            return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthNum - 1];
          }
          return m;
        };
        const formatted = res.monthly_trends.map((item: any) => {
          // Use 0 for missing/null/undefined values so lines always show
          const closing = typeof item.modes?.closing?.average_score === 'number' ? item.modes.closing.average_score : 0;
          const prospecting = typeof item.modes?.prospecting?.average_score === 'number' ? item.modes.prospecting.average_score : 0;
          const discovering = typeof item.modes?.discovering?.average_score === 'number' ? item.modes.discovering.average_score : 0;
          // Calculate overall as the average of the three
          const scores = [closing, prospecting, discovering];
          const overall = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
          return {
            month: monthShort(item.month),
            closing,
            prospecting,
            discovering,
            overall,
          };
        });
        setMonthlyTrend(formatted);
      } else {
        setMonthlyTrend([]);
      }
      setTrendLoading(false);
    }
    fetchMonthlyTrend();
  }, [user?.user_id, Get]);

  if (loading || trendLoading) {
    return <div className="p-6">Loading Performance Data...</div>;
  }

  if (!data) {
    return <div className="p-6">No performance data available.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Performance</h1>
          <p className="text-black">Track your conversation quality and improvement areas</p>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-black" />
              <span className="text-sm font-medium text-black">Overall Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-black">{data.overall_average_score}</div>
              <div className="flex items-center gap-1">
                {data.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-black" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-black" />
                )}
                <span className="text-sm text-black">vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-black" />
              <span className="text-sm font-medium text-black">Total Sessions</span>
            </div>
            <div className="text-3xl font-bold text-black">
              {data.total_sessions_analyzed ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Skill Breakdown by Modes as Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {Array.isArray(data.modes_breakdown) && data.modes_breakdown.map((mode, idx) => (
            <AccordionItem value={mode?.mode} key={mode?.mode}>
              <AccordionTrigger>
                <span className="font-semibold">Skill Breakdown - {mode?.mode}</span>
              </AccordionTrigger>
              <AccordionContent>
                <Card className="shadow-none border-none">
                  <CardContent className="space-y-4 p-0">
                    {typeof mode?.overall_score === 'number' && (
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Overall Score</span>
                          <span className="text-sm text-black font-bold">{mode?.overall_score}/100</span>
                        </div>
                        <Progress value={mode?.overall_score} className="h-2" />
                      </div>
                    )}
                    {Array.isArray(mode?.skills) && mode?.skills.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{skill?.skill.replace("_", " ")}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-black">
                              {skill?.score}/100
                            </span>
                            {/* <Badge
                              variant={skill?.score >= skill?.target ? "secondary" : "outline"}
                              className={
                                skill?.score >= skill?.target
                                  ? "bg-black/10 text-black"
                                  : skill?.score >= skill?.target - 0.5
                                    ? "bg-black/10 text-black"
                                    : "bg-black/10 text-black"
                              }
                            >
                              {skill?.improvement}
                            </Badge> */}
                          </div>
                        </div>
                        <Progress
                          value={typeof skill?.score === 'number' ? skill?.score : 0}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Monthly Performance Trend (Line Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis domain={[0, 100]} className="text-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="prospecting" name="Prospecting" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }} connectNulls isAnimationActive animationBegin={0} animationDuration={8000} animationEasing="linear" />
                <Line type="monotone" dataKey="discovering" name="Discovering" stroke="#fe4444" strokeWidth={3} dot={{ fill: '#fe4444', strokeWidth: 2, r: 6 }} activeDot={{ r: 8, stroke: '#fe4444', strokeWidth: 2 }} connectNulls isAnimationActive animationBegin={0} animationDuration={8000} animationEasing="linear" />
                <Line type="monotone" dataKey="closing" name="Closing" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', strokeWidth: 2, r: 6 }} activeDot={{ r: 8, stroke: '#22c55e', strokeWidth: 2 }} connectNulls isAnimationActive animationBegin={0} animationDuration={8000} animationEasing="linear" />
                <Line type="monotone" dataKey="overall" name="Overall" stroke="#FFD600" strokeWidth={3} dot={{ r: 5, fill: '#FFD600' }} activeDot={{ r: 8, stroke: '#FFD600', strokeWidth: 2 }} connectNulls isAnimationActive animationBegin={0} animationDuration={8000} animationEasing="linear" />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}