import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Users, Plus, ChevronDown, Building2, TrendingUp, Calendar, User, BarChart3, Search, X, ArrowLeft, Check, Edit, Trash2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { apis } from "@/utils/apis";
import { useApi } from "@/hooks/useApi";
import { useSelector } from "react-redux";
import { showToast } from "@/lib/toastConfig";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import moment from "moment"

const teamsData = [
  // {
  //   id: 1,
  //   name: "Enterprise Solutions",
  //   company: "TechCorp Solutions",
  //   members: [
  //     { id: 1, name: "John Doe", email: "john@techcorp.com", score: 8.5, sessions: 12 },
  //     { id: 2, name: "Jane Smith", email: "jane@techcorp.com", score: 7.8, sessions: 10 },
  //     { id: 3, name: "Mike Johnson", email: "mike@techcorp.com", score: 9.1, sessions: 15 }
  //   ],
  //   created: "2024-01-01",
  //   avgPerformance: 8.5,
  //   totalSessions: 37
  // },
  // {
  //   id: 2,
  //   name: "SMB Sales",
  //   company: "Global Sales Inc",
  //   members: [
  //     { id: 4, name: "Sarah Wilson", email: "sarah@globalsales.com", score: 7.2, sessions: 8 },
  //     { id: 5, name: "Tom Brown", email: "tom@globalsales.com", score: 8.9, sessions: 14 }
  //   ],
  //   created: "2023-12-15",
  //   avgPerformance: 8.1,
  //   totalSessions: 22
  // },
  // {
  //   id: 3,
  //   name: "Strategic Accounts",
  //   company: "Enterprise Dynamics",
  //   members: [
  //     { id: 6, name: "Lisa Chen", email: "lisa@enterprisedynamics.com", score: 9.3, sessions: 18 },
  //     { id: 7, name: "David Miller", email: "david@enterprisedynamics.com", score: 8.7, sessions: 16 },
  //     { id: 8, name: "Anna Garcia", email: "anna@enterprisedynamics.com", score: 7.9, sessions: 11 }
  //   ],
  //   created: "2023-11-20",
  //   avgPerformance: 8.6,
  //   totalSessions: 45
  // }
];

// const companiesData = [
//   { id: 1, name: "TechCorp Solutions" },
//   { id: 2, name: "Global Sales Inc" },
//   { id: 3, name: "Enterprise Dynamics" }
// ];

const availableUsers = [
  // { id: 9, name: "Chris Taylor", email: "chris@techcorp.com", company: "TechCorp Solutions" },
  // { id: 10, name: "Emma Davis", email: "emma@globalsales.com", company: "Global Sales Inc" },
  // { id: 11, name: "Alex Rodriguez", email: "alex@enterprisedynamics.com", company: "Enterprise Dynamics" }
];

// Remove mock growthData
// const growthData = [
//   { month: "Jan", performance: 6.5, sessions: 25 },
//   { month: "Feb", performance: 7.2, sessions: 32 },
//   { month: "Mar", performance: 7.8, sessions: 38 },
//   { month: "Apr", performance: 8.1, sessions: 42 },
//   { month: "May", performance: 8.5, sessions: 48 },
//   { month: "Jun", performance: 8.8, sessions: 55 }
// ];

export function Teams() {

  const user = useSelector((state: any) => state?.auth?.user);
  const { sales_companies, company_teams, company_teams_members } = apis;
  const { Get, Post, Put, Delete } = useApi();

  const [teams, setTeams]: any = useState(teamsData);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam]: any = useState<object>(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [viewMode, setViewMode] = useState<"overview" | "detail">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [companiesData, setCompaniesData] = useState([]);
  const [addteamMember, setAddteamMember]: any = useState<boolean>(false)
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMembersForTeam, setSelectedMembersForTeam] = useState<number[]>([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [teamMembers, setTeamMembers] = useState<number[]>([]);
  const [teamMembersGraph, setTeamMembersGraph]: any = useState<object>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTeamData, setEditTeamData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState<any>(null);
  const [isDeleteMemberDialogOpen, setIsDeleteMemberDialogOpen] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectMember, setSelectMember] = useState("")
  const [data, setData]: any = useState([]);

  console.log(teamMembers, data, "teamMembers__")
  // Add state for selected mode
  // const [selectedMode, setSelectedMode] = useState<'prospecting' | 'discovering' | 'closing'>('closing');

  console.log(selectMember, "selectMember")

  console.log(teams, "teams")

  console.log(selectedMembersForTeam, "selectedMembersForTeam")
  console.log(selectedTeam, "selectedTeam")

  // Form state for creating new team
  const [newTeamData, setNewTeamData] = useState({
    name: "",
    company_id: "",
    members: [] as number[]
  });

  console.log(newTeamData, "newTeamData")
  const [isCreating, setIsCreating] = useState(false);

  const totalMembers = (teams?.reduce((acc, team) => acc + team?.members?.length, 0)) || 0;
  const avgTeamPerformance = (teams?.reduce((acc, team) => acc + team.avgPerformance, 0) / teams?.length) || 0;

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTeamClick = (team: typeof teamsData[0]) => {
    setSelectedTeam(team);
    setViewMode("detail");
  };

  const handleBackToOverview = () => {
    setViewMode("overview");
    setSelectedTeam(null);
    setTeamMembers([])
  };

  const getTeams = async () => {
    setLoading(true)
    try {
      let data = await Get(`${company_teams}manager/${user?.user_id}`)
      if (data?.length) {
        setTeams(data)
        setLoading(false)
      }
    } catch (error) {
      console.log(error, "_error_")
    } finally {
      setLoading(false)
    }
  }

  const getCompaniesById = async () => {
    try {
      let data = await Get(`${sales_companies}manager/${user?.user_id}`);
      if (data?.length) {
        setCompaniesData(data)
      }
    } catch (error) {
      console.log(error, "_error_")
      showToast.error("Failed to fetch companies. Please try again.");
    }
  }

  const getCompanyTeamMembers = async () => {
    try {
      let data = await Get(`${company_teams_members}team/${selectedTeam?.company_team_id}`);
      if (data?.length) {
        setTeamMembers(data)
      } else {
        setTeamMembers([])
      }
    } catch (error) {
      console.log(error, "_error_")
      showToast.error("Failed to fetch companies. Please try again.");
    }
  }

  const getCompanyTeamMembersGraph = async () => {
    try {
      let data = await Get(`${company_teams}${selectedTeam?.company_team_id}/monthly-trend?months_back=6`);
      if (data?.company_team_id) {
        setTeamMembersGraph(data)
      } else {
        setTeamMembersGraph({})
      }
    } catch (error) {
      console.log(error, "_error_")
      showToast.error("Failed to fetch companies. Please try again.");
    }
  }

  console.log(teamMembersGraph, "teamMembersGraph")

  const getAvailableMembers = async () => {
    try {
      // This would be your API call to get available members
      // For now, using mock data
      let data = await Get(`${sales_companies}${selectedTeam?.sales_company_id}`);
      console.log(data?.users, "data_users")
      if (data?.users?.length) {
        setAvailableMembers(data?.users.map((v) => ({ ...v, company: data?.name })))
      }
    } catch (error) {
      console.error("Error fetching available members:", error);
      showToast.error("Failed to fetch available members");
    }
  };

  const addMembersToTeam = async () => {
    if (selectedMembersForTeam.length === 0) {
      showToast.error("Please select at least one member");
      return;
    }

    setIsAddingMembers(true);
    try {
      // Loop through each selected member and add them individually
      for (const memberId of selectedMembersForTeam) {
        const memberData = {
          company_team_id: selectedTeam?.company_team_id,
          user_id: memberId
        };

        console.log("Adding member to team:", memberData);

        let data = await Post(company_teams_members, memberData);
        if (data?.member_id) {
          getCompanyTeamMembers()
          getCompanyTeamMembersGraph()
        }

        // Optional: Add a small delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      showToast.success(`${selectedMembersForTeam.length} member(s) added to team successfully!`);
      setSelectedMembersForTeam([]);
      setMemberSearchQuery("");
      setAddteamMember(false);

      // Refresh team data
      // await getTeams();
    } catch (error) {
      console.error("Error adding members to team:", error);
      showToast.error("Failed to add members to team");
    } finally {
      setIsAddingMembers(false);
    }
  };

  const toggleMemberSelection = (memberId: number) => {
    setSelectedMembersForTeam(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const teamMemberIds = teamMembers?.map((m: any) => m?.user?.user_id) || [];
  const filteredAvailableMembers = availableMembers?.length
    ? availableMembers
      .filter(member => !teamMemberIds.includes(member?.user_id))
      .filter(member =>
        ((member.first_name?.toLowerCase() || '') + ' ' + (member.last_name?.toLowerCase() || '')).includes(memberSearchQuery.toLowerCase()) ||
        (member.email?.toLowerCase() || '').includes(memberSearchQuery.toLowerCase()) ||
        (member.company?.toLowerCase() || '').includes(memberSearchQuery.toLowerCase())
      )
    : []

  console.log(filteredAvailableMembers, "filteredAvailableMembers")


  console.log(selectedTeam, "selectedTeam__")

  const getTeamsById = async () => {
    try {
      let data = await Get(`${company_teams}sales-company/${selectedTeam?.sales_company_id}`);
      if (data?.length) {
        setCompaniesData(data)
      }
    } catch (error) {
      console.log(error, "_error_")
      showToast.error("Failed to fetch companies. Please try again.");
    }
  }

  const createTeam = async () => {
    if (!newTeamData.name || !newTeamData.company_id) {
      showToast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const teamData = {
        name: newTeamData.name,
        sales_company_id: newTeamData.company_id,
        // members: selectedUsers,
        manager_id: user?.user_id
      };

      const response = await Post(company_teams, teamData);

      if (response) {
        // Reset form
        setNewTeamData({
          name: "",
          company_id: "",
          members: []
        });
        setSelectedUsers([]);
        setSearchQuery("");
        setIsCreateDialogOpen(false);

        // Refresh teams list
        await getTeams();

        showToast.success("Team created successfully!");
      }
    } catch (error) {
      console.error("Error creating team:", error);
    } finally {
      setIsCreating(false);
    }
  }

  const openEditDialog = (team: any) => {
    console.log(team, "_team____")
    setEditTeamData({
      id: team.company_team_id,
      name: team.name,
      company_id: team.sales_company_id,
      members: team.members?.map((m: any) => m.id || m.user_id) || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleEditTeam = async () => {
    if (!editTeamData.name || !editTeamData.company_id) {
      showToast.error("Please fill in all required fields");
      return;
    }
    console.log(editTeamData, "editTeamData")
    setIsEditing(true);
    try {
      const teamData = {
        name: editTeamData.name,
        sales_company_id: editTeamData.company_id,
        // members: editTeamData.members, // Uncomment if API supports
        manager_id: user?.user_id,
      };
      const response = await Put(`${company_teams}${editTeamData.id}`, teamData);
      if (response) {
        setIsEditDialogOpen(false);
        setEditTeamData(null);
        await getTeams();
        showToast.success("Team updated successfully!");
      }
    } catch (error) {
      console.error("Error editing team:", error);
      showToast.error("Failed to update team");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!deletingTeam) return;
    try {
      const response = await Delete(`${company_teams}${deletingTeam.company_team_id}`);
      // if (response) {
      showToast.success("Team deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeletingTeam(null);
      await getTeams();
      // }
    } catch (error) {
      console.error("Error deleting team:", error);
      showToast.error("Failed to delete team");
    }
  };

  const deleteTeamMember = async (member_id) => {
    try {
      let data = await Delete(`${company_teams_members}${member_id}`)
      getCompanyTeamMembers()
      getCompanyTeamMembersGraph()
    } catch (error) {
      console.log(error, "_error_")
    }
  }

  useEffect(() => {
    if (user?.user_id) {
      getTeams()
      getCompaniesById()
    }
  }, [user?.user_id])

  useEffect(() => {
    if (selectedTeam?.sales_company_id) {
      getTeamsById()
      getAvailableMembers()
      // getCompanyMembers()
    }
  }, [selectedTeam?.sales_company_id])

  useEffect(() => {
    if (selectedTeam?.company_team_id) {
      getCompanyTeamMembers()
      getCompanyTeamMembersGraph()
    }
  }, [selectedTeam?.company_team_id])

  useEffect(() => {
    let isCancelled = false;
    async function fetchAllPerformances() {
      if (!teams || teams.length === 0) {
        setData([]);
        return;
      }
      setLoading(true);
      try {
        const seenCompanyIds = new Set<any>();
        const aggregated: any[] = [];
        for (let i = 0; i < teams.length; i++) {
          const companyId = (teams[i] as any)?.sales_company_id;
          if (!companyId || seenCompanyIds.has(companyId)) continue;
          seenCompanyIds.add(companyId);
          const res = await Get(`${apis.company_teams}sales-company/${companyId}/performance`);
          if (!res) continue;
          if (Array.isArray(res)) {
            for (let j = 0; j < res.length; j++) {
              aggregated.push(res[j]);
            }
          } else {
            aggregated.push(res);
          }
        }
        if (!isCancelled) {
          setData(aggregated);
        }
      } catch (error) {
        console.log(error, "_error_");
        showToast.error("Failed to fetch performance data. Please try again.");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    fetchAllPerformances();
    return () => {
      isCancelled = true;
    };
  }, [teams?.length]);



  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Prepare growthData for all modes
  const growthData = (teamMembersGraph?.monthly_trends || []).map((trend: any) => {
    const closingRaw = trend.modes?.closing?.average_score;
    const prospectingRaw = trend.modes?.prospecting?.average_score;
    const discoveringRaw = trend.modes?.discovering?.average_score;
    const scores = [closingRaw, prospectingRaw, discoveringRaw].filter((v) => typeof v === 'number') as number[];
    const overall = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return {
      month: moment(trend.month).format("MMM"),
      prospecting: typeof prospectingRaw === 'number' ? prospectingRaw : 0,
      discovering: typeof discoveringRaw === 'number' ? discoveringRaw : 0,
      closing: typeof closingRaw === 'number' ? closingRaw : 0,
      overall,
    };
  });

  console.log(growthData, "growthData")

  // Calculate total sessions per team and overall using for-loops
  const teamSessionsMap: Record<string, number> = {};
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const team: any = data[i];
      let teamSessions = 0;
      if (team && Array.isArray(team.members)) {
        for (let m = 0; m < team.members.length; m++) {
          const member: any = team.members[m];
          if (member && Array.isArray(member.performance_by_mode)) {
            for (let k = 0; k < member.performance_by_mode.length; k++) {
              const modeItem: any = member.performance_by_mode[k];
              const count = Number(modeItem?.session_count);
              if (!Number.isNaN(count)) {
                teamSessions += count;
              }
            }
          }
        }
      }
      const key = String(team?.company_team_id ?? 'unknown');
      const previous = typeof teamSessionsMap[key] === 'number' ? teamSessionsMap[key] : 0;
      teamSessionsMap[key] = previous + teamSessions;
    }
  }
  let overallTotalSessions = 0;
  const teamKeys = Object.keys(teamSessionsMap);
  for (let i = 0; i < teamKeys.length; i++) {
    const key = teamKeys[i];
    overallTotalSessions += teamSessionsMap[key] || 0;
  }

  // Calculate average performance per team and overall using for-loops
  const teamAverageScoreMap: Record<string, number> = {};
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const team: any = data[i];
      const teamId = String(team?.company_team_id ?? 'unknown');
      const score = typeof team?.team_average_score === 'number' ? team.team_average_score : null;
      if (typeof score === 'number') {
        teamAverageScoreMap[teamId] = score;
      }
    }
  }
  let overallAverageScore = 0;
  {
    let sum = 0;
    let count = 0;
    const keys = Object.keys(teamAverageScoreMap);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const val = teamAverageScoreMap[k];
      if (typeof val === 'number') {
        sum += val;
        count += 1;
      }
    }
    overallAverageScore = count > 0 ? sum / count : 0;
  }

  if (loading) {
    return <div className="p-6">Loading Teams Data...</div>;
  }

  if (selectMember === "") {
    if (viewMode === "detail" && selectedTeam) {
      return (
        <div className="p-6 space-y-6">
          {/* Header with back button */}
          <div className="flex items-center justify-between gap-4 relative">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToOverview}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Teams
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{selectedTeam?.name}</h1>
                <p className="text-muted-foreground">{selectedTeam?.company}</p>
              </div>
            </div>
            <Button className="flex items-center gap-2" onClick={() => { setAddteamMember(!addteamMember) }}>
              Add Team Members
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${addteamMember ? "rotate-180" : "rotate-0"}`} />
            </Button>

            {addteamMember && (
              <div className="absolute w-96 bg-white shadow-lg top-[105%] right-0 border border-gray-200 rounded-lg flex flex-col z-10 max-h-96 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Add Team Members</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAddteamMember(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search members..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                  {filteredAvailableMembers.length > 0 ? (
                    <div className="space-y-1">
                      {filteredAvailableMembers.map((member) => (
                        <div
                          key={member?.user_id}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedMembersForTeam.includes(member?.user_id)
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-gray-50 border border-transparent"
                            }`}
                          onClick={() => toggleMemberSelection(member?.user_id)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedMembersForTeam.includes(member?.user_id)
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-600"
                              }`}>
                              {selectedMembersForTeam.includes(member?.user_id) ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <User className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{`${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unknown Name'}</div>
                              <div className="text-sm text-gray-500 truncate">{member.email || 'No email'}</div>
                              <div className="text-xs text-gray-400">{member.company || 'Unknown Company'}</div>
                            </div>
                          </div>
                          {/* {selectedMembersForTeam.includes(member?.user_id) && (
                          <Badge variant="secondary" className="text-xs">
                            Selected
                          </Badge>
                        )} */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No members found</p>
                      <p className="text-sm">Try adjusting your search</p>
                    </div>
                  )}
                </div>

                {selectedMembersForTeam.length > 0 && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">
                        {selectedMembersForTeam.length} member(s) selected
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMembersForTeam([])}
                        className="text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                    <Button
                      className="w-full"
                      onClick={addMembersToTeam}
                      disabled={isAddingMembers}
                    >
                      {isAddingMembers ? "Adding..." : `Add ${selectedMembersForTeam.length} Member(s)`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Team Details Layout */}
          <Card>
            {Array.isArray(data) && data.map((team, teamIdx) => (
              team?.company_team_id === selectedTeam?.company_team_id ?
                <div key={`team-${teamIdx}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {/* Team Performance - {team?.name} */}
                      Team Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="shadow-none border-none">
                      <div className="space-y-4 p-0">
                        {/* Team Overall Score */}
                        {typeof team?.team_average_score === 'number' && (
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Team Average Score</span>
                              <span className="text-sm text-black font-bold">{team?.team_average_score ? team?.team_average_score.toFixed(1) : 0}/100</span>
                            </div>
                            <Progress value={team?.team_average_score} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
                : null))
            }
          </Card >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members ({teamMembers?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamMembers?.length ? teamMembers.map((member: any) => (
                  <div
                    key={member?.user?.company_id}
                    className="w-full flex items-center justify-between gap-4 p-4 border rounded-lg"
                  >
                    <div
                      className="w-full flex items-center justify-between cursor-pointer"
                      onClick={() => setSelectMember(member?.member_id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{member?.user?.first_name}&nbsp;{member?.user?.last_name}</div>
                          <div className="text-sm text-muted-foreground">{member?.user?.email}</div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-center">
                        <div className="font-bold text-lg text-primary">
                          {Array.isArray(data) && data.map((team, teamIdx) => (
                            team?.company_team_id === selectedTeam?.company_team_id ?
                              <div key={`team-${teamIdx}`}>
                                {(() => {
                                  const targetMember = team?.members?.find((val) => val?.member_id === member?.member_id);
                                  const totalSessions = Array.isArray(targetMember?.performance_by_mode)
                                    ? targetMember.performance_by_mode.reduce((sum, itm) => sum + (Number(itm?.session_count) || 0), 0)
                                    : 0;
                                  return totalSessions;
                                })()}
                              </div>
                              : null))}
                        </div>
                        <div className="text-sm text-muted-foreground">{member?.user?.sessions} sessions</div>
                      </div>
                    </div>
                    <Button
                      title="Delete"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => { setDeletingMemberId(member?.member_id); setIsDeleteMemberDialogOpen(true); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )) : null}
              </CardContent>
            </Card>

            {/* Right Side - Growth Chart */}
            <Card>
              <CardHeader className="">
                <CardTitle className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Team Performance Growth
                  </div>
                  <Badge className="!rounded-sm">
                    <p className="text-sm">{moment().format("MMM Do YY")}</p>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis domain={[0, 100]} className="text-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="prospecting" name="Prospecting" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }} isAnimationActive={false} animationBegin={0} animationDuration={8000} animationEasing="linear" />
                      <Line type="monotone" dataKey="discovering" name="Discovering" stroke="#fe4444" strokeWidth={3} dot={{ fill: '#fe4444', strokeWidth: 2, r: 6 }} activeDot={{ r: 8, stroke: '#fe4444', strokeWidth: 2 }} isAnimationActive={false} animationBegin={0} animationDuration={8000} animationEasing="linear" />
                      <Line type="monotone" dataKey="closing" name="Closing" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', strokeWidth: 2, r: 6 }} activeDot={{ r: 8, stroke: '#22c55e', strokeWidth: 2 }} isAnimationActive={false} animationBegin={0} animationDuration={8000} animationEasing="linear" />
                      <Line type="monotone" dataKey="overall" name="Overall" stroke="#FFD600" strokeWidth={3} dot={{ r: 5, fill: '#FFD600' }} activeDot={{ r: 8, stroke: '#FFD600', strokeWidth: 2 }} isAnimationActive={false} animationBegin={0} animationDuration={8000} animationEasing="linear" />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Performance Summary */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{teamMembersGraph?.monthly_trends?.length ? (teamMembersGraph.monthly_trends[teamMembersGraph.monthly_trends.length - 1]?.modes?.closing?.average_score ?? 0) : 0}</div>
                    <div className="text-sm text-muted-foreground">Current Avg</div>
                  </div>
                  <div className="text-center flex flex-col items-center">
                    <div className="text-2xl font-bold text-success">{teamMembersGraph?.monthly_trends?.length ? `+${((teamMembersGraph.monthly_trends[teamMembersGraph.monthly_trends.length - 1]?.modes?.closing?.average_score ?? 0) - (teamMembersGraph.monthly_trends[0]?.modes?.closing?.average_score ?? 0)).toFixed(1)}` : 0}</div>
                    <div className="text-sm text-muted-foreground">Growth</div>
                  </div>
                  <div className="text-center">
                    {/* <div className="text-2xl font-bold text-warning">{growthData.reduce((acc, cur) => acc + (cur.closing || 0), 0)}</div> */}
                    <div className="text-2xl font-bold text-warning">{teamMembersGraph?.total_sessions_analyzed || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Sessions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Place the AlertDialog here so it only renders in detail view */}
          <AlertDialog open={isDeleteMemberDialogOpen} onOpenChange={(open) => {
            setIsDeleteMemberDialogOpen(open);
            if (!open) setDeletingMemberId(null);
          }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Team Member?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove this member from the team? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setIsDeleteMemberDialogOpen(false);
                  setDeletingMemberId(null);
                }}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="text-[#ef4343]"
                  onClick={async () => {
                    if (deletingMemberId !== null) {
                      await deleteTeamMember(deletingMemberId);
                      setDeletingMemberId(null);
                      setIsDeleteMemberDialogOpen(false);
                      // Refresh the member list
                      getCompanyTeamMembers();
                      getCompanyTeamMembersGraph()
                    }
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div >
      );
    }

  } else {
    // meber details
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 relative">
          <div className="w-full flex items-center justify-between gap-4">
            <div>
              {/* <h1 className="text-3xl font-bold tracking-tight">{selectedTeam?.name}</h1>
              <p className="text-muted-foreground">{selectedTeam?.company}</p> */}
              {Array.isArray(data) && data.map((team, teamIdx) => (
                team?.company_team_id === selectedTeam?.company_team_id ?
                  <div key={`team-${teamIdx}`}>
                    <span className="text-3xl font-bold tracking-tight">Team {team?.name}</span>
                  </div> : null))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectMember("")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Team Members
            </Button>
          </div>

        </div>
        <Card className="grid gap-6 lg:grid-cols-1">
          {/* Skill Breakdown by Modes as Accordion */}
          <div className="w-full">
            {Array.isArray(data) && data.map((team, teamIdx) => (
              team?.company_team_id === selectedTeam?.company_team_id ?
                <div key={`team-${teamIdx}`}>
                  <CardHeader>
                    {/* <span className="font-semibold">Team Performance - {team?.name}</span> */}
                    {team.members.map((member, memberIdx) => (
                      member?.member_id === selectMember ?
                        <div key={memberIdx}>
                          <div className="flex flex-col items-start w-full">
                            <span className="font-semibold text-xl text-gray-700">{member?.user?.first_name} {member?.user?.last_name}</span>
                            <span className="text-base text-gray-500">{member?.user?.email}</span>
                          </div>
                        </div> : null))}
                  </CardHeader>
                  <CardContent>
                    <div className="shadow-none border-none">
                      <div className="space-y-4 p-0">

                        {/* Members Performance */}
                        {Array.isArray(team?.members) && (
                          <div className="">
                            {team.members.map((member, memberIdx) => (
                              member?.member_id === selectMember ?
                                <div key={memberIdx}>
                                  {/* <div>
                                    <div className="flex flex-col items-start w-full">
                                      <span className="font-medium text-base text-gray-700">{member?.user?.first_name} {member?.user?.last_name}</span>
                                      <span className="text-bse text-gray-500">{member?.user?.email}</span>
                                    </div>
                                  </div> */}
                                  <div>
                                    {/* Member Overall Score */}
                                    {typeof member?.overall_average_score === 'number' && (
                                      <div className="space-y-2 mb-3">
                                        <div className="flex justify-between items-center">
                                          <span className="text-base font-medium">Overall Score</span>
                                          <span className="text-bse text-black font-bold">{member?.overall_average_score ? member?.overall_average_score.toFixed(1) : 0}/100</span>
                                        </div>
                                        <Progress value={member?.overall_average_score} className="h-2.5" />
                                      </div>
                                    )}
                                    {/* Performance by Mode (already accordionized) */}
                                    {Array.isArray(member?.performance_by_mode) && (
                                      <div className="ml-4 mb-3">
                                        {member.performance_by_mode.map((mode, modeIdx) => (
                                          <div key={modeIdx}>
                                            <div>
                                              <div className="flex justify-between items-center w-full">
                                                <span className="text-base font-medium capitalize">{mode?.mode_name}</span>
                                                <span className="text-bse text-gray-600">{mode?.session_count} sessions</span>
                                              </div>
                                            </div>
                                            <div>
                                              {/* Mode Overall Score */}
                                              {typeof mode?.average_overall_score === 'number' && (
                                                <div className="space-y-1 mb-2">
                                                  <div className="flex justify-between items-center">
                                                    <span className="text-bse">Overall</span>
                                                    <span className="text-bse text-black font-bold">{mode?.average_overall_score ? mode?.average_overall_score.toFixed(1) : 0}/100</span>
                                                  </div>
                                                  <Progress value={mode?.average_overall_score} className="h-2" />
                                                </div>
                                              )}
                                              {/* Individual Skills */}
                                              <div className="space-y-1 ml-2">
                                                {mode?.average_engagement_level !== null && (
                                                  <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                      <span className="text-bse">Engagement</span>
                                                      <span className="text-bse text-black">{mode?.average_engagement_level ? mode?.average_engagement_level.toFixed(1) : 0}/100</span>
                                                    </div>
                                                    <Progress value={mode?.average_engagement_level} className="h-2" />
                                                  </div>
                                                )}
                                                {mode?.average_communication_level !== null && (
                                                  <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                      <span className="text-bse">Communication</span>
                                                      <span className="text-bse text-black">{mode?.average_communication_level ? mode?.average_communication_level.toFixed(1) : 0}/100</span>
                                                    </div>
                                                    <Progress value={mode?.average_communication_level} className="h-2" />
                                                  </div>
                                                )}
                                                {mode?.average_objection_handling !== null && (
                                                  <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                      <span className="text-bse">Objection Handling</span>
                                                      <span className="text-bse text-black">{mode?.average_objection_handling ? mode?.average_objection_handling.toFixed(1) : 0}/100</span>
                                                    </div>
                                                    <Progress value={mode?.average_objection_handling} className="h-2" />
                                                  </div>
                                                )}
                                                {mode?.average_adaptability !== null && (
                                                  <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                      <span className="text-bse">Adaptability</span>
                                                      <span className="text-bse text-black">{mode?.average_adaptability ? mode?.average_adaptability.toFixed(1) : 0}/100</span>
                                                    </div>
                                                    <Progress value={mode?.average_adaptability} className="h-2" />
                                                  </div>
                                                )}
                                                {mode?.average_persuasiveness !== null && (
                                                  <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                      <span className="text-bse">Persuasiveness</span>
                                                      <span className="text-bse text-black">{mode?.average_persuasiveness ? mode?.average_persuasiveness.toFixed(1) : 0}/100</span>
                                                    </div>
                                                    <Progress value={mode?.average_persuasiveness} className="h-2" />
                                                  </div>
                                                )}
                                                {mode?.average_create_interest !== null && (
                                                  <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                      <span className="text-bse">Create Interest</span>
                                                      <span className="text-bse text-black">{mode?.average_create_interest ? mode?.average_create_interest.toFixed(1) : 0}/100</span>
                                                    </div>
                                                    <Progress value={mode?.average_create_interest} className="h-2" />
                                                  </div>
                                                )}
                                                {mode?.average_sale_closing !== null && (
                                                  <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                      <span className="text-bse">Sale Closing</span>
                                                      <span className="text-bse text-black">{mode?.average_sale_closing ? mode?.average_sale_closing.toFixed(1) : 0}/100</span>
                                                    </div>
                                                    <Progress value={mode?.average_sale_closing} className="h-2" />
                                                  </div>
                                                )}
                                                {mode?.average_discovery !== null && (
                                                  <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                      <span className="text-bse">Discovery</span>
                                                      <span className="text-bse text-black">{mode?.average_discovery ? mode?.average_discovery.toFixed(1) : 0}/100</span>
                                                    </div>
                                                    <Progress value={mode?.average_discovery} className="h-2" />
                                                  </div>
                                                )}
                                                {mode?.average_cross_selling !== null && (
                                                  <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                      <span className="text-bse">Cross Selling</span>
                                                      <span className="text-bse text-black">{mode?.average_cross_selling ? mode?.average_cross_selling.toFixed(1) : 0}/100</span>
                                                    </div>
                                                    <Progress value={mode?.average_cross_selling} className="h-2" />
                                                  </div>
                                                )}
                                                {mode?.average_solution_fit !== null && (
                                                  <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                      <span className="text-bse">Solution Fit</span>
                                                      <span className="text-bse text-black">{mode?.average_solution_fit ? mode?.average_solution_fit.toFixed(1) : 0}/100</span>
                                                    </div>
                                                    <Progress value={mode?.average_solution_fit} className="h-2" />
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div> : null
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div> : null
            ))}
          </div>
        </Card>
      </div>)
  }


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Create teams, assign members, and track performance</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            // Reset form when dialog is closed
            setNewTeamData({
              name: "",
              company_id: "",
              members: []
            });
            setSelectedUsers([]);
            setSearchQuery("");
          }
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Create New Team</DialogTitle>
                {/* <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button> */}
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  placeholder="Enter team name"
                  value={newTeamData.name}
                  onChange={(e) => setNewTeamData(prev => ({ ...prev, name: e.target.value }))}
                  className={!newTeamData.name ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Select
                  value={newTeamData.company_id}
                  onValueChange={(value) => setNewTeamData(prev => ({ ...prev, company_id: value }))}
                >
                  <SelectTrigger className={!newTeamData.company_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companiesData.map((company) => (
                      <SelectItem key={company?.sales_company_id} value={company?.sales_company_id.toString()}>
                        {company?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* <div className="space-y-2">
                <Label>Search & Add Members</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                        />
                        <label htmlFor={`user-${user.id}`} className="text-sm cursor-pointer">
                          {user.name}
                        </label>
                      </div>
                      <Badge variant="outline" className="text-xs">{user.company}</Badge>
                    </div>
                  ))}
                </div>
                {selectedUsers.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {selectedUsers.length} user(s) selected
                  </div>
                )}
              </div> */}
              <Button
                className="w-full"
                onClick={createTeam}
                disabled={isCreating || !newTeamData.name || !newTeamData.company_id}
              >
                {isCreating ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={open => {
        setIsEditDialogOpen(open);
        if (!open) setEditTeamData(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Edit Team</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTeamName">Team Name *</Label>
              <Input
                id="editTeamName"
                placeholder="Enter team name"
                value={editTeamData?.name || ''}
                onChange={e => setEditTeamData((prev: any) => ({ ...prev, name: e.target.value }))}
                className={!editTeamData?.name ? "border-red-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCompany">Company *</Label>
              <Select
                value={editTeamData?.company_id || ''}
                onValueChange={value => setEditTeamData((prev: any) => ({ ...prev, company_id: value }))}
              >
                <SelectTrigger className={!editTeamData?.company_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companiesData.map((company) => (
                    <SelectItem key={company?.sales_company_id} value={company?.sales_company_id.toString()}>
                      {company?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleEditTeam}
              disabled={isEditing || !editTeamData?.name || !editTeamData?.company_id}
            >
              {isEditing ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={open => {
        setIsDeleteDialogOpen(open);
        if (!open) setDeletingTeam(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete the team <span className="font-bold">{deletingTeam?.name}</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="text-destructive" onClick={handleDeleteTeam}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{teams?.length}</div>
                <div className="text-sm text-muted-foreground">Total Teams</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-success" />
              <div>
                <div className="text-2xl font-bold">{totalMembers || 0}</div>
                <div className="text-sm text-muted-foreground">Team Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-info" />
              <div>
                <div className="text-2xl font-bold">{(Math.round(overallAverageScore * 10) / 10).toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Avg Performance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-warning" />
              <div>
                <div className="text-2xl font-bold">{overallTotalSessions || 0}</div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams?.length ? teams?.map((team: any) => {
          const teamIdKey = String(team?.company_team_id ?? 'unknown');
          const teamAvgScoreRaw = typeof teamAverageScoreMap[teamIdKey] === 'number' ? teamAverageScoreMap[teamIdKey] : 0;
          const teamAvgScore = Math.round(teamAvgScoreRaw * 10) / 10;
          const teamSessions = typeof teamSessionsMap[teamIdKey] === 'number' ? teamSessionsMap[teamIdKey] : 0;
          return (
            <Card key={team?.id} className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleTeamClick(team)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{team?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{companiesData?.length ? companiesData.filter((v) => v?.sales_company_id === team?.sales_company_id).map((val) => val?.name) : null}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{team?.members?.length}</div>
                    <div className="text-xs text-muted-foreground">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{teamAvgScore.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-info">{teamSessions}</div>
                    <div className="text-xs text-muted-foreground">Sessions</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Team Performance</span>
                    <span>{teamAvgScore.toFixed(1)}/100</span>
                  </div>
                  <Progress value={teamAvgScoreRaw} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Created {team?.created}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      title="Edit"
                      variant="outline"
                      size="sm"
                      onClick={e => { e.stopPropagation(); openEditDialog(team); }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      title="Delete"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={e => {
                        e.stopPropagation();
                        setDeletingTeam(team);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          );
        }) : null}
      </div>
    </div>
  );
}