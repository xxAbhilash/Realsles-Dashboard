import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Users, Plus, Minus, ChevronDown, Building2, TrendingUp, Calendar, User, BarChart3, Search, X, ArrowLeft, Check, Edit, Trash2, Info, Briefcase, MapPin, Factory, Building, Package, Sparkles, Target, CheckCircle, Clock, Percent, AlertCircle, UserCircle, FileText, MessageSquare, Lightbulb, Upload, Loader2, Share2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { apis } from "@/utils/apis";
import { useApi } from "@/hooks/useApi";
import { useSelector } from "react-redux";
import { showToast } from "@/lib/toastConfig";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

// Skill descriptions for info tooltips
const skillDescriptions: Record<string, { title: string; description: string; keyAreas: string[] }> = {
  relationship_building: {
    title: "Relationship Building",
    description: "What it measures: Ability to establish rapport, build trust and credibility, and create personal connection with the prospect. Includes professional presence, finding common ground, demonstrating genuine interest, and adapting communication style to match the prospect's preferences.",
    keyAreas: [
      "Rapport establishment and trust building",
      "Professional presence and credibility demonstration",
      "Finding common ground and shared experiences",
      "Genuine interest in prospect's business and challenges",
      "Communication style adaptation to match prospect preferences"
    ]
  },
  communication_excellence: {
    title: "Communication Excellence",
    description: "What it measures: Overall communication effectiveness including clarity of message delivery, active listening skills, appropriate questioning techniques, professional tone, and ability to adapt communication style based on prospect feedback and cues.",
    keyAreas: [
      "Message clarity and articulation",
      "Active listening demonstration through responses",
      "Strategic questioning techniques and follow-up",
      "Professional tone and appropriate language use",
      "Responsiveness to prospect cues and feedback"
    ]
  },
  needs_discovery: {
    title: "Needs Discovery",
    description: "What it measures: Ability to uncover prospect's business challenges, pain points, goals, and priorities through strategic questioning. Includes identifying both explicit and implicit needs, understanding impact of current situation, and exploring consequences of inaction.",
    keyAreas: [
      "Strategic questioning to uncover business challenges",
      "Identification of explicit and implicit needs",
      "Understanding of current situation impact",
      "Exploration of consequences of maintaining status quo",
      "Prioritization of prospect's goals and objectives"
    ]
  },
  solution_matching: {
    title: "Solution Matching",
    description: "What it measures: Ability to connect identified customer needs to appropriate company solutions, demonstrate relevant features and benefits, present compelling use cases, and translate technical capabilities into business outcomes that matter to the prospect.",
    keyAreas: [
      "Accurate matching of solutions to identified needs",
      "Relevant feature and benefit demonstration",
      "Compelling use case presentation",
      "Translation of technical capabilities to business outcomes",
      "Relevance and impact of proposed solutions"
    ]
  },
  objection_handling_and_value_selling: {
    title: "Objection Handling & Value Selling",
    description: "What it measures: Ability to address prospect concerns and resistance by reinforcing value proposition, providing evidence and proof points, calculating ROI/business impact, and reframing objections as opportunities to demonstrate additional value.",
    keyAreas: [
      "Effective addressing of prospect concerns and resistance",
      "Value proposition reinforcement and evidence presentation",
      "ROI and business impact calculation and presentation",
      "Reframing objections as value demonstration opportunities",
      "Proof point relevance and credibility"
    ]
  },
  negotiation: {
    title: "Negotiation",
    description: "What it measures: Ability to create appropriate urgency, handle pricing discussions, negotiate terms and conditions, find win-win solutions, and maintain deal profitability while addressing prospect requirements and timeline constraints.",
    keyAreas: [
      "Creation of appropriate urgency without pressure",
      "Effective handling of pricing discussions",
      "Terms and conditions negotiation effectiveness",
      "Win-win solution identification and presentation",
      "Balance between prospect satisfaction and deal profitability"
    ]
  },
  cross_selling: {
    title: "Cross Selling",
    description: "What it measures: Ability to identify additional opportunities beyond the primary need, spot complementary products/services, uncover broader business challenges, and expand deal scope while maintaining relevance to customer priorities.",
    keyAreas: [
      "Identification of additional opportunities beyond primary need",
      "Recognition of complementary product/service opportunities",
      "Uncovering of broader business challenges and implications",
      "Deal scope expansion while maintaining relevance",
      "Alignment of additional opportunities with customer priorities"
    ]
  },
  qualifying_lead: {
    title: "Qualifying Lead",
    description: "What it measures: Ability to generate initial interest, assess prospect fit, and determine if they meet ideal customer criteria. Includes asking qualifying questions, gauging budget/authority/need/timeline, and identifying decision-making process.",
    keyAreas: [
      "Initial interest generation effectiveness",
      "Qualifying question quality and relevance",
      "Assessment of prospect fit against ideal customer profile",
      "Understanding of decision-making authority and process",
      "Identification of budget parameters and timeline"
    ]
  },
  sales_closing: {
    title: "Sales Closing",
    description: "What it measures: Ability to secure commitment and advance the sale through effective closing techniques, asking for the business confidently, addressing final hesitations, establishing clear next steps, and converting interest into actionable commitment.",
    keyAreas: [
      "Effective closing technique application",
      "Confident request for business commitment",
      "Addressing of final hesitations and concerns",
      "Clear next steps establishment and timeline setting",
      "Conversion of interest into actionable commitment"
    ]
  }
};

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
  const [allTeamMembers, setAllTeamMembers] = useState<any[]>([]);
  const [isLoadingAllMembers, setIsLoadingAllMembers] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'closing' | 'discovering' | 'prospecting'>('closing');
  const [modeIds, setModeIds] = useState<Record<string, string>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTeamData, setEditTeamData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState<any>(null);
  const [isDeleteMemberDialogOpen, setIsDeleteMemberDialogOpen] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectMember, setSelectMember] = useState("")
  const [selectedGraphMember, setSelectedGraphMember] = useState<string | null>(null);
  const [isRefreshingMembers, setIsRefreshingMembers] = useState(false);
  const [data, setData]: any = useState([]);
  const [isAssignScenarioDialogOpen, setIsAssignScenarioDialogOpen] = useState(false);
  const [isLoadingShareScenario, setIsLoadingShareScenario] = useState(false);
  const [sharingSessionIdState, setSharingSessionIdState] = useState<string | number | null>(null);
  const [selectedMemberForScenario, setSelectedMemberForScenario] = useState<any>(null);
  const [scenarioData, setScenarioData] = useState({
    mode: "",
    persona: "",
    description: "",
    timeLimit: 7,
    message: "",
    title: ""
  });
  const [titleTouched, setTitleTouched] = useState(false);
  const [scenarioStep, setScenarioStep] = useState<1 | 2>(1);
  const [selectedAdditionalMembers, setSelectedAdditionalMembers] = useState<number[]>([]);
  const [modesData, setModesData] = useState<any[]>([]);
  const [personasData, setPersonasData] = useState<any[]>([]);
  const [isAssigningScenario, setIsAssigningScenario] = useState(false);
  const [sharingSessionId, setSharingSessionId] = useState<string | number | null>(null);
  const [isPersonaDetailsOpen, setIsPersonaDetailsOpen] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [documentSummary, setDocumentSummary] = useState<string>("");
  const [selectedPersonaDetails, setSelectedPersonaDetails] = useState<any>(null);
  const [loadingPersonaDetails, setLoadingPersonaDetails] = useState(false);
  const [scenarioDashboardData, setScenarioDashboardData] = useState<any>(null);
  const [loadingScenarioDashboard, setLoadingScenarioDashboard] = useState(false);
  const [scenarioDashboardError, setScenarioDashboardError] = useState<string | null>(null);
  const [isUserScenariosDialogOpen, setIsUserScenariosDialogOpen] = useState(false);
  const [selectedUserScenarios, setSelectedUserScenarios] = useState<any[]>([]);
  const [selectedUserInfo, setSelectedUserInfo] = useState<{ name: string; email: string; userId: string } | null>(null);
  const [isPendingOverdueScenariosOpen, setIsPendingOverdueScenariosOpen] = useState(false);
  const [isCompletedScenariosOpen, setIsCompletedScenariosOpen] = useState(false);
  const [isDeleteScenarioDialogOpen, setIsDeleteScenarioDialogOpen] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | number | null>(null);
  const [isPerformanceDialogOpen, setIsPerformanceDialogOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | number | null>(null);
  const [userModePerformanceData, setUserModePerformanceData] = useState<Record<string, any>>({});
  const [isLoadingUserGraph, setIsLoadingUserGraph] = useState(false);
  const [scenariosViewMode, setScenariosViewMode] = useState<'by-users' | 'by-scenarios'>('by-users');
  const [scenariosByScenarioData, setScenariosByScenarioData] = useState<any[]>([]);
  const [loadingScenariosByScenario, setLoadingScenariosByScenario] = useState(false);
  const [isScenarioUsersDialogOpen, setIsScenarioUsersDialogOpen] = useState(false);
  const [selectedScenarioDetails, setSelectedScenarioDetails] = useState<any>(null);
  const [isScenarioPendingOverdueOpen, setIsScenarioPendingOverdueOpen] = useState(true);
  const [isScenarioCompletedOpen, setIsScenarioCompletedOpen] = useState(false);

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
    setTeamMembers([]);
    setScenarioDashboardData(null);
    setScenarioDashboardError(null);
    // Refresh teams and companies data when going back to overview
    getTeams();
  };

  const getTeams = async () => {
    setLoading(true)
    try {
      let data = await Get(`${company_teams}manager/${user?.user_id}`)
      if (data?.length) {
        setTeams(data)
        // Refresh companies data to ensure company names are available
        await getCompaniesById();
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
      } else {
        // Ensure we set empty array if no data, don't clear existing data unnecessarily
        setCompaniesData([])
      }
    } catch (error) {
      console.log(error, "_error_")
      showToast.error("Failed to fetch companies. Please try again.");
    }
  }

  const getCompanyTeamMembers = async () => {
    // Prevent concurrent calls
    if (isRefreshingMembers) return;
    
    setIsRefreshingMembers(true);
    try {
      let data = await Get(`${company_teams_members}team/${selectedTeam?.company_team_id}`);
      if (data?.length) {
        // Deduplicate members by member_id and user_id to prevent duplicates
        const uniqueMembers = [];
        const seenMemberIds = new Set();
        const seenUserIds = new Set();
        const seenEmails = new Set();
        
        for (const member of data) {
          const memberId = member.member_id;
          const userId = member.user?.user_id || member.user_id;
          const email = member.user?.email || member.email;
          
          // Check if we've seen this member by member_id, user_id, or email
          const isDuplicate = 
            (memberId && seenMemberIds.has(memberId)) ||
            (userId && seenUserIds.has(userId)) ||
            (email && seenEmails.has(email));
          
          if (!isDuplicate) {
            if (memberId) seenMemberIds.add(memberId);
            if (userId) seenUserIds.add(userId);
            if (email) seenEmails.add(email);
            uniqueMembers.push(member);
          }
        }
        
        // Set unique members (deduplication already handled above)
        setTeamMembers(uniqueMembers);
      } else {
        setTeamMembers([])
      }
    } catch (error) {
      console.log(error, "_error_")
      showToast.error("Failed to fetch team members. Please try again.");
    } finally {
      setIsRefreshingMembers(false);
    }
  }

  const getCompanyTeamMembersGraph = async () => {
    if (!selectedTeam?.company_team_id || !modeIds[selectedMode]) {
      setTeamMembersGraph({});
      return;
    }
    try {
      let data = await Get(`${company_teams}${selectedTeam?.company_team_id}/mode/${modeIds[selectedMode]}/members-performance?months_back=6`);
      if (data?.company_team_id) {
        // Deduplicate members by member_id and user_id to prevent duplicates
        if (Array.isArray(data.members)) {
          const uniqueMembers = [];
          const seenMemberIds = new Set();
          const seenUserIds = new Set();
          const seenEmails = new Set();
          
          for (const member of data.members) {
            const memberId = member.member_id;
            const userId = member.user_id;
            const email = member.user_name; // user_name might be unique identifier
            
            // Check if we've seen this member by member_id, user_id, or name
            const isDuplicate = 
              (memberId && seenMemberIds.has(memberId)) ||
              (userId && seenUserIds.has(userId)) ||
              (email && seenEmails.has(email));
            
            if (!isDuplicate) {
              if (memberId) seenMemberIds.add(memberId);
              if (userId) seenUserIds.add(userId);
              if (email) seenEmails.add(email);
              uniqueMembers.push(member);
            }
          }
          
          data.members = uniqueMembers;
        }
        setTeamMembersGraph(data)
      } else {
        setTeamMembersGraph({})
      }
    } catch (error) {
      console.log(error, "_error_")
      showToast.error("Failed to fetch team performance data. Please try again.");
    }
  }

  const fetchInteractionModes = async () => {
    try {
      const modes = await Get(apis.interaction_modes);
      if (Array.isArray(modes)) {
        const modeMap: Record<string, string> = {};
        modes.forEach((mode: any) => {
          const modeName = (mode.name || mode.mode_name || '').toLowerCase();
          if (modeName.includes('closing')) {
            modeMap['closing'] = mode.mode_id || mode.id;
          } else if (modeName.includes('discovering') || modeName.includes('discovery')) {
            modeMap['discovering'] = mode.mode_id || mode.id;
          } else if (modeName.includes('prospecting') || modeName.includes('prospect')) {
            modeMap['prospecting'] = mode.mode_id || mode.id;
          }
        });
        setModeIds(modeMap);
      }
    } catch (error) {
      console.log(error, "_error_fetching_modes")
    }
  }

  // Fetch user performance data across all modes for the individual user graph
  const fetchUserModePerformance = async () => {
    if (!selectedTeam?.company_team_id || !selectMember || Object.keys(modeIds).length === 0) {
      setUserModePerformanceData({});
      return;
    }
    
    setIsLoadingUserGraph(true);
    try {
      const modePromises = Object.entries(modeIds).map(async ([modeName, modeId]) => {
        const data = await Get(`${company_teams}${selectedTeam?.company_team_id}/mode/${modeId}/members-performance?months_back=6`);
        return { modeName, data };
      });
      
      const results = await Promise.all(modePromises);
      
      const userDataByMode: Record<string, any> = {};
      results.forEach(({ modeName, data }) => {
        if (data?.members && Array.isArray(data.members)) {
          // Find the selected user's data in this mode
          const userMemberData = data.members.find((member: any) => 
            member.member_id === selectMember || 
            String(member.member_id) === String(selectMember)
          );
          if (userMemberData) {
            userDataByMode[modeName] = userMemberData;
          }
        }
      });
      
      setUserModePerformanceData(userDataByMode);
    } catch (error) {
      console.log(error, "_error_fetching_user_mode_performance");
    } finally {
      setIsLoadingUserGraph(false);
    }
  };

  console.log(teamMembersGraph, "teamMembersGraph")

  const getAvailableMembers = async () => {
    try {
      // This would be your API call to get available members
      // For now, using mock data
      let data = await Get(`${sales_companies}${selectedTeam?.sales_company_id}`);
      console.log(data?.users, "data_users")
      
      const allMembers = [];
      
      // Add manager first if exists
      if (data?.manager) {
        allMembers.push({
          ...data.manager,
          company: data?.name,
          isManager: true
        });
      }
      
      // Add regular users
      if (data?.users?.length) {
        allMembers.push(...data.users.map((v) => ({ 
          ...v, 
          company: data?.name,
          isManager: false 
        })));
      }
      
      setAvailableMembers(allMembers);
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
        if (!data?.member_id) {
          console.error("Failed to add member:", memberId);
        }

        // Optional: Add a small delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Refresh team members and graph data only once after all members are added
      await getCompanyTeamMembers();
      await getCompanyTeamMembersGraph();
      
      // Refresh available members to update the filtered list
      await getAvailableMembers();

      // Refresh scenario dashboard to reflect updated team member count
      await getScenarioDashboard();

      showToast.success(`${selectedMembersForTeam.length} member(s) added to team successfully!`);
      setSelectedMembersForTeam([]);
      setMemberSearchQuery("");
      setAddteamMember(false);
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
        // Don't overwrite companiesData, it should be fetched separately
        // This function is for getting teams by company, not companies data
      }
    } catch (error) {
      console.log(error, "_error_")
      showToast.error("Failed to fetch teams. Please try again.");
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

        // Refresh teams list and companies data
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
        // Refresh teams and companies data
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
      // Refresh teams and companies data
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
      // Refresh team members and graph data after deletion
      await getCompanyTeamMembers()
      await getCompanyTeamMembersGraph()
      // Refresh available members to update the filtered list
      await getAvailableMembers()
      // Refresh scenario dashboard to reflect updated team member count
      await getScenarioDashboard()
    } catch (error) {
      console.log(error, "_error_")
      showToast.error("Failed to delete team member");
    }
  }

  const handleGiveScenario = async (member: any) => {
    setSelectedMemberForScenario(member);
    setSharingSessionId(null); // Reset sharing session ID when assigning new scenario
    setIsAssignScenarioDialogOpen(true);
    // Fetch modes and personas when dialog opens
    await fetchModesAndPersonas();
  }

  const getAllTeamMembers = async () => {
    setIsLoadingAllMembers(true);
    try {
      // Get all teams for the manager
      const teamsData = await Get(`${company_teams}manager/${user?.user_id}`);
      if (!teamsData || !Array.isArray(teamsData)) {
        setAllTeamMembers([]);
        return;
      }

      // Fetch members from all teams - include all members even if they appear in multiple teams
      const allMembers: any[] = [];

      for (const team of teamsData) {
        try {
          const teamMembersData = await Get(`${company_teams_members}team/${team.company_team_id}`);
          if (Array.isArray(teamMembersData)) {
            for (const member of teamMembersData) {
              // Add all members with their team info (no deduplication)
              allMembers.push({
                ...member,
                team_name: team.name,
                team_id: team.company_team_id,
                company_name: team.sales_company?.name || team.company_name
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching members for team ${team.company_team_id}:`, error);
          // Continue with other teams even if one fails
        }
      }

      setAllTeamMembers(allMembers);
    } catch (error) {
      console.error("Error fetching all team members:", error);
      showToast.error("Failed to fetch all team members");
      setAllTeamMembers([]);
    } finally {
      setIsLoadingAllMembers(false);
    }
  }

  const handleShareScenario = async (scenario: any) => {
    // Set loading state for this specific scenario
    setIsLoadingShareScenario(true);
    setSharingSessionIdState(scenario.session_id);
    
    // Store the session_id to use when creating the new scenario
    setSharingSessionId(scenario.session_id);
    
    // Set a dummy member (we'll need to select a member in step 2)
    setSelectedMemberForScenario(null);
    setSelectedAdditionalMembers([]);
    setScenarioStep(1);
    setDocumentFile(null);
    setDocumentSummary("");
    
    try {
      // Fetch modes and personas FIRST so we can look up IDs by name if needed
      // Get the returned data directly to avoid React state timing issues
      const { modes: fetchedModes, personas: fetchedPersonas } = await fetchModesAndPersonas();
      // Fetch all team members when sharing
      await getAllTeamMembers();
      
      // Now extract mode and persona IDs with proper fallback to name lookup
      // Try direct ID extraction first
      let modeId = scenario.mode?.mode_id || scenario.mode?.id || scenario.mode_id || "";
      let personaId = scenario.persona?.persona_id || scenario.persona?.id || scenario.persona_id || "";
      
      // If mode ID is empty or not a valid ID, try to find it by name
      if (!modeId) {
        const modeName = scenario.mode?.name || scenario.mode_name || (typeof scenario.mode === 'string' ? scenario.mode : "");
        if (modeName) {
          // Look up mode by name in the freshly fetched modes data
          const foundMode = fetchedModes.find((m: any) => 
            m?.name?.toLowerCase() === modeName.toLowerCase() || 
            m?.mode_name?.toLowerCase() === modeName.toLowerCase()
          );
          if (foundMode) {
            modeId = foundMode?.mode_id || foundMode?.id || "";
          }
        }
      }
      
      // If persona ID is empty or not a valid ID, try to find it by name
      if (!personaId) {
        const personaName = scenario.persona?.name || scenario.persona_name || (typeof scenario.persona === 'string' ? scenario.persona : "");
        if (personaName) {
          // Look up persona by name in the freshly fetched personas data
          const foundPersona = fetchedPersonas.find((p: any) => 
            p?.name?.toLowerCase() === personaName.toLowerCase() || 
            p?.persona_name?.toLowerCase() === personaName.toLowerCase()
          );
          if (foundPersona) {
            personaId = foundPersona?.persona_id || foundPersona?.id || "";
          }
        }
      }
      
      // Pre-fill scenario data from the existing scenario
      // Try multiple fields for description and provide a default if empty
      // Priority: scenario_text (for By Scenarios view) > scenario > description > scenario_description > details
      const scenarioDescription = 
        scenario.scenario_text ||
        scenario.scenario || 
        scenario.description || 
        scenario.scenario_description ||
        scenario.details ||
        `Shared scenario from session ${scenario.session_id}`;
      
      // Extract title with fallback - for completed scenarios, title might be missing
      const scenarioTitle = 
        scenario.title || 
        scenario.scenario_title ||
        scenario.name ||
        `Shared Scenario - ${new Date().toLocaleDateString()}`;
      
      // Extract message (manager message) - for By Scenarios view
      const managerMessage = scenario.message || "";
      
      // Set all scenario data before opening dialog
      setScenarioData({
        mode: modeId.toString(),
        persona: personaId.toString(),
        description: scenarioDescription,
        timeLimit: scenario.time_limit_days || 7,
        message: managerMessage,
        title: scenarioTitle
      });
      
      // Now open the dialog with all data ready
      setIsAssignScenarioDialogOpen(true);
    } catch (error) {
      console.error("Error loading share scenario data:", error);
      showToast.error("Failed to load scenario data. Please try again.");
      setSharingSessionIdState(null);
    } finally {
      setIsLoadingShareScenario(false);
    }
  }

  const fetchModesAndPersonas = async (): Promise<{ modes: any[], personas: any[] }> => {
    try {
      // Fetch modes
      const modes = await Get(apis.interaction_modes);
      const modesResult = Array.isArray(modes) ? modes : [];
      setModesData(modesResult);

      // Fetch personas
      const personas = await Get(apis.ai_personas);
      const personasResult = Array.isArray(personas) ? personas : [];
      setPersonasData(personasResult);
      
      return { modes: modesResult, personas: personasResult };
    } catch (error) {
      console.error("Error fetching modes and personas:", error);
      showToast.error("Failed to load modes and personas");
      return { modes: [], personas: [] };
    }
  }

  const handleProceed = () => {
    if (!scenarioData.title.trim()) {
      setTitleTouched(true);
    }
    
    // When sharing an existing scenario (sharingSessionId is set), be more lenient with validation
    const isSharing = !!sharingSessionId;
    
    // Basic validation - mode, persona, and title are always required
    if (!scenarioData.mode || !scenarioData.persona || !scenarioData.title.trim()) {
      showToast.error("Please select mode, persona, and provide a title");
      return;
    }
    
    // Time limit validation
    if (!scenarioData.timeLimit || scenarioData.timeLimit < 1) {
      showToast.error("Please set a valid deadline (at least 1 day)");
      return;
    }
    
    // Description validation - always required
    if (!scenarioData.description.trim()) {
      showToast.error("Please provide a scenario description");
      return;
    }
    
    setScenarioStep(2);
  }

  const handleDocumentUpload = async (file: File) => {
    setIsUploadingDocument(true);
    setDocumentFile(file);
    setDocumentSummary("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await Post(apis.documents_upload, formData);
      
      if (response?.success && response?.summary) {
        setDocumentSummary(response.summary);
        showToast.success("Document uploaded and processed successfully");
      } else {
        throw new Error(response?.error || "Failed to process document");
      }
    } catch (error: any) {
      console.error("Error uploading document:", error);
      setDocumentFile(null);
      setDocumentSummary("");
      showToast.error(error?.response?.data?.detail || "Failed to upload document");
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleDocumentUpload(file);
    }
  };

  const handleRemoveDocument = () => {
    setDocumentFile(null);
    setDocumentSummary("");
  };

  const handleAssignScenario = async () => {
    if (!scenarioData.mode || !scenarioData.persona || !scenarioData.description.trim() || !scenarioData.timeLimit || scenarioData.timeLimit < 1 || !scenarioData.title.trim()) {
      showToast.error("Please fill in all required fields including title and deadline");
      return;
    }

    if (!user?.user_id) {
      showToast.error("Manager information not found");
      return;
    }

    // Get all members to assign to (original + additional)
    // Use allTeamMembers when sharing, otherwise use teamMembers
    const membersSource = sharingSessionId ? allTeamMembers : teamMembers;
    
    // Get members from selected user IDs
    const additionalMembers = selectedAdditionalMembers.map(userId => {
      return membersSource.find((m: any) => (m?.user?.user_id || m?.user_id) === userId);
    }).filter(Boolean);

    // Combine with originally selected member (if any)
    const allMembersRaw = [
      selectedMemberForScenario,
      ...additionalMembers
    ].filter(Boolean);

    // Deduplicate by user_id (same user might appear in multiple teams)
    const seenUserIds = new Set<number>();
    const allMembers = allMembersRaw.filter((member: any) => {
      const userId = member?.user?.user_id || member?.user_id;
      if (userId && !seenUserIds.has(userId)) {
        seenUserIds.add(userId);
        return true;
      }
      return false;
    });

    if (allMembers.length === 0) {
      showToast.error("Please select at least one member");
      return;
    }

    setIsAssigningScenario(true);
    const successMembers: string[] = [];
    const failedMembers: string[] = [];

    try {
      // Process each member sequentially
      for (const member of allMembers) {
        try {
          const userId = member?.user?.user_id || member?.user_id;
          if (!userId) {
            failedMembers.push(member?.user?.first_name || "Unknown");
            continue;
          }

          // Always create a new session for each member (even when sharing)
          // This ensures the scenario is associated with the correct user/team
          const sessionPayload: any = {
            user_id: userId.toString(),
            persona_id: scenarioData.persona,
            mode_id: scenarioData.mode,
            scenario: scenarioData.description.trim()
          };

          // Add document_content if document summary exists
          if (documentSummary && documentSummary.trim()) {
            sessionPayload.document_content = documentSummary.trim();
          }

          const sessionResponse = await Post(apis.sessions_manager_create, sessionPayload);
          
          if (!sessionResponse?.session_id) {
            throw new Error("Session creation failed - no session_id returned");
          }

          const sessionIdToUse = sessionResponse.session_id;

          // Step 2: Create scenario
          const scenarioPayload = {
            session_id: sessionIdToUse,
            manager_id: user.user_id.toString(),
            title: scenarioData.title.trim(),
            time_limit_days: scenarioData.timeLimit,
            message: scenarioData.message?.trim() || ""
          };

          await Post(apis.scenarios, scenarioPayload);

          // Track success
          const memberName = `${member?.user?.first_name || ""} ${member?.user?.last_name || ""}`.trim() || "Unknown";
          successMembers.push(memberName);

        } catch (error: any) {
          console.error("Error assigning scenario to member:", error);
          const memberName = `${member?.user?.first_name || ""} ${member?.user?.last_name || ""}`.trim() || "Unknown";
          failedMembers.push(memberName);
        }
      }

      // Show results
      if (successMembers.length > 0) {
        showToast.success(`Scenario assigned to ${successMembers.join(", ")}`);
      }
      
      if (failedMembers.length > 0) {
        showToast.error(`Failed to assign scenario to ${failedMembers.join(", ")}`);
      }

      // Refresh scenario dashboard data after any assignment attempt
      // This ensures the dashboard reflects the current state even if some assignments failed
      if (selectedTeam?.company_team_id && successMembers.length > 0) {
        await getScenarioDashboard();
        // Also refresh scenarios by scenario view if currently in that mode
        if (scenariosViewMode === 'by-scenarios') {
          await getScenariosByScenario();
        }
      }

      // Reset and close dialog only if all succeeded
      if (failedMembers.length === 0) {
        setScenarioData({ mode: "", persona: "", description: "", timeLimit: 7, message: "", title: "" });
        setTitleTouched(false);
        setScenarioStep(1);
        setSelectedAdditionalMembers([]);
        setDocumentFile(null);
        setDocumentSummary("");
        setIsUploadingDocument(false);
        setIsAssignScenarioDialogOpen(false);
        setSelectedMemberForScenario(null);
        setSharingSessionId(null); // Reset sharing session ID
        setSharingSessionIdState(null); // Reset sharing session ID state
      }
    } catch (error) {
      console.error("Error assigning scenario:", error);
      showToast.error("Failed to assign scenario");
    } finally {
      setIsAssigningScenario(false);
    }
  }

  const toggleAdditionalMember = (userId: number) => {
    // Use user_id for selection to sync across teams (same user in multiple teams)
    setSelectedAdditionalMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }

  const capitalizeFirstLetter = (text: string) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
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

  const formatText = (text: string | undefined): string => {
    if (!text) return "";
    return text
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  }

  const fetchPersonaDetails = async (personaId: string) => {
    setLoadingPersonaDetails(true);
    try {
      const details = await Get(`${apis.ai_persona_by_id}${personaId}`);
      setSelectedPersonaDetails(details);
      setIsPersonaDetailsOpen(true);
    } catch (error) {
      console.error("Error fetching persona details:", error);
      showToast.error("Failed to load persona details");
    } finally {
      setLoadingPersonaDetails(false);
    }
  }

  const getPersonaIdFromScenario = (scenario: any): string | null => {
    // Try direct ID extraction first
    let personaId = scenario.persona?.persona_id || scenario.persona?.id || scenario.persona_id || null;
    
    // If persona ID is empty or not a valid ID, try to find it by name
    if (!personaId && personasData.length > 0) {
      const personaName = scenario.persona?.name || scenario.persona_name || (typeof scenario.persona === 'string' ? scenario.persona : "");
      if (personaName) {
        // Look up persona by name in the personas data
        const foundPersona = personasData.find((p: any) => 
          p?.name?.toLowerCase() === personaName.toLowerCase() || 
          p?.persona_name?.toLowerCase() === personaName.toLowerCase()
        );
        if (foundPersona) {
          personaId = foundPersona?.persona_id || foundPersona?.id || null;
        }
      }
    }
    
    return personaId;
  }

  const handlePersonaInfoClick = async (scenario: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const personaId = getPersonaIdFromScenario(scenario);
    if (personaId) {
      await fetchPersonaDetails(personaId);
    } else {
      showToast.error("Persona ID not found");
    }
  }

  const getScenarioDashboard = async () => {
    if (!selectedTeam?.company_team_id) {
      setScenarioDashboardData(null);
      setScenarioDashboardError(null);
      return;
    }

    // Prevent concurrent calls
    if (loadingScenarioDashboard) return;

    setLoadingScenarioDashboard(true);
    setScenarioDashboardError(null);
    
    try {
      // Load personas if not already loaded (needed for persona info button)
      if (personasData.length === 0) {
        try {
          const personas = await Get(apis.ai_personas);
          const personasResult = Array.isArray(personas) ? personas : [];
          setPersonasData(personasResult);
        } catch (personaError) {
          console.error("Error fetching personas:", personaError);
          // Don't fail the whole operation if personas fail to load
        }
      }

      // GET request with team_id as query parameter
      const response = await Get(`${apis.scenarios_dashboard_manager}?team_id=${selectedTeam.company_team_id}`);
      
      if (response) {
        setScenarioDashboardData(response);
      } else {
        setScenarioDashboardData(null);
        setScenarioDashboardError("No data received");
      }
    } catch (error: any) {
      console.error("Error fetching scenario dashboard:", error);
      setScenarioDashboardData(null);
      setScenarioDashboardError(error?.response?.data?.detail || "Failed to fetch scenario data");
      // Don't show toast on every error to avoid spam, only show on user-initiated retries
    } finally {
      setLoadingScenarioDashboard(false);
    }
  }

  // Fetch scenarios grouped by scenario (not by user)
  const getScenariosByScenario = async () => {
    if (!selectedTeam?.company_team_id) {
      setScenariosByScenarioData([]);
      return;
    }
    
    setLoadingScenariosByScenario(true);
    try {
      // Load personas if not already loaded (needed for persona info button)
      if (personasData.length === 0) {
        try {
          const personas = await Get(apis.ai_personas);
          const personasResult = Array.isArray(personas) ? personas : [];
          setPersonasData(personasResult);
        } catch (personaError) {
          console.error("Error fetching personas:", personaError);
          // Don't fail the whole operation if personas fail to load
        }
      }

      const response = await Get(`${apis.scenarios_by_team}${selectedTeam.company_team_id}/scenarios`);
      
      if (response && Array.isArray(response)) {
        setScenariosByScenarioData(response);
      } else if (response) {
        // If response is an object with a scenarios array
        setScenariosByScenarioData(response.scenarios || []);
      } else {
        setScenariosByScenarioData([]);
      }
    } catch (error: any) {
      console.error("Error fetching scenarios by scenario:", error);
      setScenariosByScenarioData([]);
    } finally {
      setLoadingScenariosByScenario(false);
    }
  }

  const handleDeleteScenario = async () => {
    if (!deletingSessionId) return;
    try {
      await Delete(`/v1/sessions/${deletingSessionId}`, { session_id: deletingSessionId });
      showToast.success("Scenario deleted successfully!");
      // Refresh scenario dashboard and user scenarios
      await getScenarioDashboard();
      // Refresh scenarios by scenario view if currently in that mode
      if (scenariosViewMode === 'by-scenarios' && selectedTeam?.company_team_id) {
        await getScenariosByScenario();
      }
      // Update selected user scenarios if dialog is open
      if (isUserScenariosDialogOpen && selectedUserScenarios) {
        const updatedScenarios = selectedUserScenarios.filter((s: any) => s.session_id !== deletingSessionId);
        setSelectedUserScenarios(updatedScenarios);
      }
      // Update selected scenario details if dialog is open
      if (isScenarioUsersDialogOpen && selectedScenarioDetails) {
        // Check if the deleted session belongs to this scenario
        const usersCompleted = selectedScenarioDetails.users_completed || [];
        const usersPending = selectedScenarioDetails.users_pending || [];
        const usersOverdue = selectedScenarioDetails.users_overdue || [];
        const allUsers = [...usersCompleted, ...usersPending, ...usersOverdue];
        const hasDeletedSession = allUsers.some((u: any) => u.session_id === deletingSessionId);
        
        if (hasDeletedSession) {
          // Refetch the scenario details
          if (selectedTeam?.company_team_id) {
            await getScenariosByScenario();
            // Find the updated scenario and update selectedScenarioDetails
            const response = await Get(`${apis.scenarios_by_team}${selectedTeam.company_team_id}/scenarios`);
            const scenarios = response?.scenarios || response || [];
            const updatedScenario = scenarios.find((s: any) => s.scenario_id === selectedScenarioDetails.scenario_id);
            if (updatedScenario) {
              setSelectedScenarioDetails(updatedScenario);
            }
          }
        }
      }
      setIsDeleteScenarioDialogOpen(false);
      setDeletingSessionId(null);
    } catch (error) {
      console.error("Error deleting scenario:", error);
      showToast.error("Failed to delete scenario");
    }
  }

  const openDeleteScenarioDialog = (session_id: string | number) => {
    setDeletingSessionId(session_id);
    setIsDeleteScenarioDialogOpen(true);
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

  // Ensure companies data is loaded when in overview mode
  useEffect(() => {
    if (viewMode === "overview" && user?.user_id) {
      // Always refresh companies data when returning to overview to ensure it's up to date
      getCompaniesById();
    }
  }, [viewMode, user?.user_id])

  useEffect(() => {
    if (selectedTeam?.company_team_id && modeIds[selectedMode]) {
      getCompanyTeamMembers()
      getCompanyTeamMembersGraph()
      // Reset graph selection when team or mode changes
      setSelectedGraphMember(null);
    }
  }, [selectedTeam?.company_team_id, selectedMode, modeIds[selectedMode]])

  useEffect(() => {
    if (selectedTeam?.company_team_id) {
      getScenarioDashboard();
    } else {
      setScenarioDashboardData(null);
      setScenarioDashboardError(null);
    }
  }, [selectedTeam?.company_team_id])

  // Fetch scenarios by scenario when toggle is switched or team changes
  useEffect(() => {
    if (selectedTeam?.company_team_id && scenariosViewMode === 'by-scenarios') {
      getScenariosByScenario();
    }
  }, [selectedTeam?.company_team_id, scenariosViewMode])

  useEffect(() => {
    fetchInteractionModes();
  }, [])

  // Fetch user mode performance data when a member is selected
  useEffect(() => {
    if (selectMember && Object.keys(modeIds).length > 0) {
      fetchUserModePerformance();
    } else {
      setUserModePerformanceData({});
    }
  }, [selectMember, selectedTeam?.company_team_id, modeIds])

  // Open pending/overdue scenarios by default when there are pending or overdue scenarios
  useEffect(() => {
    if (selectedUserScenarios && selectedUserScenarios.length > 0) {
      const pendingScenarios = selectedUserScenarios.filter((s: any) => !s.is_completed && (s.days_remaining ?? 0) > 0);
      const lapsedScenarios = selectedUserScenarios.filter((s: any) => !s.is_completed && (s.days_remaining ?? 0) === 0);
      if (pendingScenarios.length > 0 || lapsedScenarios.length > 0) {
        setIsPendingOverdueScenariosOpen(true);
      }
    }
  }, [selectedUserScenarios])

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

  // Prepare growthData for members performance by mode
  const prepareGrowthData = () => {
    if (!teamMembersGraph?.members || !Array.isArray(teamMembersGraph.members)) {
      return [];
    }

    // Get all unique months from all members
    const allMonths = new Set<string>();
    teamMembersGraph.members.forEach((member: any) => {
      if (Array.isArray(member.monthly_scores)) {
        member.monthly_scores.forEach((score: any) => {
          if (score.month) {
            allMonths.add(score.month);
          }
        });
      }
    });

    // Sort months chronologically
    const sortedMonths = Array.from(allMonths).sort((a, b) => {
      const dateA = new Date(a + '-01');
      const dateB = new Date(b + '-01');
      return dateA.getTime() - dateB.getTime();
    });

    // Create data structure for chart
    const chartData: any[] = sortedMonths.map(month => {
      const dataPoint: any = {
        month: moment(month + '-01').format("MMM"),
        monthKey: month,
      };

      // Add each member's score for this month
      teamMembersGraph.members.forEach((member: any) => {
        const memberKey = member.user_name || `Member ${member.member_id}`;
        const monthlyScore = member.monthly_scores?.find((s: any) => s.month === month);
        
        // Helper to validate and parse score values
        const getValidScore = (monthData: any): number | null => {
          if (!monthData) return null;
          
          const score = monthData.average_overall_score;
          const sessionCount = monthData.session_count;
          
          // If session_count is 0 or null/undefined, there's no real score data
          // Even if average_overall_score is 0, it's meaningless without sessions
          if (sessionCount === 0 || sessionCount === null || sessionCount === undefined) {
            return null;
          }
          
          if (score === null || score === undefined) return null;
          
          // Handle string numbers from API
          const numScore = typeof score === 'string' ? parseFloat(score) : score;
          
          // Validate it's a finite number (excludes NaN, Infinity, -Infinity)
          if (typeof numScore === 'number' && Number.isFinite(numScore)) {
            return numScore;
          }
          return null;
        };
        
        dataPoint[memberKey] = getValidScore(monthlyScore);
        // Store session count with a special key
        dataPoint[`${memberKey}_sessions`] = monthlyScore?.session_count || 0;
      });

      return dataPoint;
    });

    // Handle null values for each member's data:
    // 1. Find if member has any valid scores
    // 2. If they have at least one score:
    //    - Nulls BEFORE first score → Set to 0 (shows growth from bottom)
    //    - Nulls AFTER first score → Carry forward last valid score
    // 3. If all nulls (no scores ever) → Keep as null (no line rendered)
    teamMembersGraph.members.forEach((member: any) => {
      const memberKey = member.user_name || `Member ${member.member_id}`;
      
      // First, check if this member has any valid scores at all
      const hasAnyScore = chartData.some((dp: any) => 
        dp[memberKey] !== null && dp[memberKey] !== undefined
      );
      
      // If no scores at all, leave everything as null (line won't render)
      if (!hasAnyScore) {
        return;
      }
      
      // Find the index of the first valid score
      const firstScoreIndex = chartData.findIndex((dp: any) => 
        dp[memberKey] !== null && dp[memberKey] !== undefined
      );
      
      // Set all nulls BEFORE first score to 0 (shows growth from bottom)
      for (let i = 0; i < firstScoreIndex; i++) {
        if (chartData[i][memberKey] === null || chartData[i][memberKey] === undefined) {
          chartData[i][memberKey] = 0;
        }
      }
      
      // Forward-fill nulls AFTER first score with last valid score
      let lastValidScore: number | null = null;
      for (let i = firstScoreIndex; i < chartData.length; i++) {
        const currentValue = chartData[i][memberKey];
        
        if (currentValue !== null && currentValue !== undefined) {
          lastValidScore = currentValue;
        } else if (lastValidScore !== null) {
          // Gap after growth started - carry forward previous score
          chartData[i][memberKey] = lastValidScore;
        }
      }
    });

    console.log("Chart data after processing:", chartData);
    return chartData;
  };

  const growthData = prepareGrowthData();

  // Prepare user growth data across all modes for the individual user graph
  const prepareUserGrowthData = () => {
    if (Object.keys(userModePerformanceData).length === 0) {
      return [];
    }

    // Get all unique months from all modes
    const allMonths = new Set<string>();
    Object.values(userModePerformanceData).forEach((modeData: any) => {
      if (Array.isArray(modeData?.monthly_scores)) {
        modeData.monthly_scores.forEach((score: any) => {
          if (score.month) {
            allMonths.add(score.month);
          }
        });
      }
    });

    // Sort months chronologically
    const sortedMonths = Array.from(allMonths).sort((a, b) => {
      const dateA = new Date(a + '-01');
      const dateB = new Date(b + '-01');
      return dateA.getTime() - dateB.getTime();
    });

    // Helper to validate and parse score values
    const getValidScore = (monthData: any): number | null => {
      if (!monthData) return null;
      
      const score = monthData.average_overall_score;
      const sessionCount = monthData.session_count;
      
      // If session_count is 0 or null/undefined, there's no real score data
      if (sessionCount === 0 || sessionCount === null || sessionCount === undefined) {
        return null;
      }
      
      if (score === null || score === undefined) return null;
      
      // Handle string numbers from API
      const numScore = typeof score === 'string' ? parseFloat(score) : score;
      
      // Validate it's a finite number (excludes NaN, Infinity, -Infinity)
      if (typeof numScore === 'number' && Number.isFinite(numScore)) {
        return numScore;
      }
      return null;
    };

    // Create data structure for chart
    const chartData: any[] = sortedMonths.map(month => {
      const dataPoint: any = {
        month: moment(month + '-01').format("MMM"),
        monthKey: month,
      };

      // Add each mode's score for this month
      ['prospecting', 'discovering', 'closing'].forEach((modeName) => {
        const modeData = userModePerformanceData[modeName];
        if (modeData?.monthly_scores) {
          const monthlyScore = modeData.monthly_scores.find((s: any) => s.month === month);
          dataPoint[modeName] = getValidScore(monthlyScore);
          // Store session count with a special key
          dataPoint[`${modeName}_sessions`] = monthlyScore?.session_count || 0;
        } else {
          dataPoint[modeName] = null;
          dataPoint[`${modeName}_sessions`] = 0;
        }
      });

      return dataPoint;
    });

    // Handle null values for each mode:
    // 1. Find if mode has any valid scores
    // 2. If it has at least one score:
    //    - Nulls BEFORE first score → Set to 0 (shows growth from bottom)
    //    - Nulls AFTER first score → Carry forward last valid score
    // 3. If all nulls (no scores ever) → Keep as null (no line rendered)
    ['prospecting', 'discovering', 'closing'].forEach((modeName) => {
      // First, check if this mode has any valid scores at all
      const hasAnyScore = chartData.some((dp: any) => 
        dp[modeName] !== null && dp[modeName] !== undefined
      );
      
      // If no scores at all, leave everything as null (line won't render)
      if (!hasAnyScore) {
        return;
      }
      
      // Find the index of the first valid score
      const firstScoreIndex = chartData.findIndex((dp: any) => 
        dp[modeName] !== null && dp[modeName] !== undefined
      );
      
      // Set all nulls BEFORE first score to 0 (shows growth from bottom)
      for (let i = 0; i < firstScoreIndex; i++) {
        if (chartData[i][modeName] === null || chartData[i][modeName] === undefined) {
          chartData[i][modeName] = 0;
        }
      }
      
      // Forward-fill nulls AFTER first score with last valid score
      let lastValidScore: number | null = null;
      for (let i = firstScoreIndex; i < chartData.length; i++) {
        const currentValue = chartData[i][modeName];
        
        if (currentValue !== null && currentValue !== undefined) {
          lastValidScore = currentValue;
        } else if (lastValidScore !== null) {
          // Gap after growth started - carry forward previous score
          chartData[i][modeName] = lastValidScore;
        }
      }
    });

    console.log("User chart data after processing:", chartData);
    return chartData;
  };

  const userGrowthData = prepareUserGrowthData();

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
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-gray-900 truncate">{`${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unknown Name'}</div>
                                {member.isManager && (
                                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">
                                    Manager
                                  </Badge>
                                )}
                              </div>
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
                {teamMembers?.length ? (() => {
                  // Sort team members by overall score (descending), then by sessions (descending) as tiebreaker
                  const sortedMembers = [...teamMembers].sort((a: any, b: any) => {
                    const team = Array.isArray(data) ? data.find((t) => t?.company_team_id === selectedTeam?.company_team_id) : null;
                    
                    // Helper function to calculate overall score and sessions for a member
                    const calculateMemberStats = (member: any) => {
                      const targetMember = team?.members?.find((val) => val?.member_id === member?.member_id);
                      let totalWeightedScore = 0;
                      let totalSessions = 0;
                      let sessionsWithScore = 0;
                      
                      if (targetMember && Array.isArray(targetMember?.performance_by_mode)) {
                        targetMember.performance_by_mode.forEach((mode: any) => {
                          const sessionCount = Number(mode?.session_count) || 0;
                          const avgScore = typeof mode?.average_overall_score === 'number' ? mode.average_overall_score : null;
                          
                          totalSessions += sessionCount;
                          
                          if (sessionCount > 0 && avgScore !== null) {
                            totalWeightedScore += avgScore * sessionCount;
                            sessionsWithScore += sessionCount;
                          }
                        });
                      }
                      
                      const overallScore = sessionsWithScore > 0 ? totalWeightedScore / sessionsWithScore : 0;
                      return { overallScore, totalSessions };
                    };
                    
                    const statsA = calculateMemberStats(a);
                    const statsB = calculateMemberStats(b);
                    
                    // Sort by overall score (descending)
                    if (statsA.overallScore !== statsB.overallScore) {
                      return statsB.overallScore - statsA.overallScore;
                    }
                    
                    // If scores are equal, sort by sessions (descending)
                    return statsB.totalSessions - statsA.totalSessions;
                  });
                  
                  return sortedMembers.map((member: any, index: number) => {
                    // Use member_id as primary key, fallback to index if not available
                    const uniqueKey = member?.member_id || member?.user?.user_id || `member-${index}`;
                    return (
                  <div
                      key={uniqueKey}
                    className="w-full flex items-center justify-between gap-4 p-4 border rounded-lg"
                  >
                    <div
                      className="w-full flex items-center justify-between cursor-pointer"
                      onClick={() => setSelectMember(member?.member_id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{member?.user?.first_name}&nbsp;{member?.user?.last_name}</div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-xs text-muted-foreground truncate cursor-help">
                                  {member?.user?.email}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{member?.user?.email}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-center gap-2 shrink-0">
                        <div className="flex items-center gap-4">
                          {(() => {
                            const team = Array.isArray(data) ? data.find((t) => t?.company_team_id === selectedTeam?.company_team_id) : null;
                            const targetMember = team?.members?.find((val) => val?.member_id === member?.member_id);
                            
                            // Calculate overall score (weighted average) and total sessions
                            let totalWeightedScore = 0;
                            let totalSessions = 0;
                            let sessionsWithScore = 0;
                            
                            if (targetMember && Array.isArray(targetMember?.performance_by_mode)) {
                              targetMember.performance_by_mode.forEach((mode: any) => {
                                const sessionCount = Number(mode?.session_count) || 0;
                                const avgScore = typeof mode?.average_overall_score === 'number' ? mode.average_overall_score : null;
                                
                                // Always count sessions
                                totalSessions += sessionCount;
                                
                                // Only include in score calculation if score exists (including 0)
                                if (sessionCount > 0 && avgScore !== null) {
                                  totalWeightedScore += avgScore * sessionCount;
                                  sessionsWithScore += sessionCount;
                                }
                              });
                            }
                            
                            const overallScore = sessionsWithScore > 0 ? totalWeightedScore / sessionsWithScore : 0;
                            
                            return (
                              <>
                                {/* Overall Score */}
                                <div className="flex flex-col items-center">
                                  <div className="font-bold text-lg text-primary">
                                    {overallScore.toFixed(1)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Overall Score</div>
                                </div>
                                
                                {/* Sessions */}
                                <div className="flex flex-col items-center">
                                  <div className="font-bold text-lg text-primary">
                                    {totalSessions}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Sessions</div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                    <Button
                      title="Delete"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setDeletingMemberId(member?.member_id); 
                          setIsDeleteMemberDialogOpen(true); 
                        }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    </div>
                  </div>
                  );
                  });
                })() : null}
              </CardContent>
            </Card>

            {/* Right Side - Growth Chart */}
            <Card>
              <CardHeader className="">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Team Performance Growth
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={selectedMode} onValueChange={(value: 'closing' | 'discovering' | 'prospecting') => setSelectedMode(value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="closing">Closing</SelectItem>
                        <SelectItem value="discovering">Discovering</SelectItem>
                        <SelectItem value="prospecting">Prospecting</SelectItem>
                      </SelectContent>
                    </Select>
                  <Badge className="!rounded-sm">
                    <p className="text-sm">{moment().format("MMM Do YY")}</p>
                  </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {growthData.length > 0 && teamMembersGraph?.members?.length > 0 ? (
                  <>
                    <div className="h-80" onClick={() => setSelectedGraphMember(null)}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData} margin={{ right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis domain={[0, 100]} className="text-muted-foreground" width={40} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-semibold mb-2">{label}</p>
                                {payload.map((entry: any, index: number) => {
                                  const memberName = entry.name;
                                  const score = entry.value;
                                  const sessionCount = entry.payload[`${memberName}_sessions`] || 0;
                                  
                                  return (
                                    <div key={index} className="flex items-center gap-2 mb-1">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: entry.color }}
                                      />
                                      <span className="text-sm">
                                        {memberName}: <span className="font-semibold">{score?.toFixed(1)}%</span>
                                        <span className="text-muted-foreground ml-1">({sessionCount} session{sessionCount !== 1 ? 's' : ''})</span>
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine 
                        y={70} 
                        stroke="#f59e0b" 
                        strokeDasharray="5 5" 
                        strokeWidth={2}
                        label={{ 
                          value: '70', 
                          position: 'left', 
                          fill: '#f59e0b', 
                          fontSize: 12, 
                          fontWeight: 600
                        }}
                      />
                      <ReferenceLine 
                        y={85} 
                        stroke="#22c55e" 
                        strokeDasharray="5 5" 
                        strokeWidth={2}
                        label={{ 
                          value: '85', 
                          position: 'left', 
                          fill: '#22c55e', 
                          fontSize: 12, 
                          fontWeight: 600
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        content={() => (
                          <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-0.5 border-t-2 border-dashed" style={{ borderColor: '#f59e0b' }}></div>
                              <span className="text-sm font-medium" style={{ color: '#f59e0b' }}>Sufficiency</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-0.5 border-t-2 border-dashed" style={{ borderColor: '#22c55e' }}></div>
                              <span className="text-sm font-medium" style={{ color: '#22c55e' }}>Proficiency</span>
                            </div>
                          </div>
                        )}
                      />
                          {teamMembersGraph.members.map((member: any, index: number) => {
                            const memberKey = member.user_name || `Member ${member.member_id}`;
                            // Generate colors for each member - using a diverse color palette
                            const colors = [
                              '#3b82f6', // Blue
                              '#22c55e', // Green
                              '#ef4444', // Red
                              '#f59e0b', // Amber
                              '#8b5cf6', // Purple
                              '#ec4899', // Pink
                              '#06b6d4', // Cyan
                              '#84cc16', // Lime
                              '#f97316', // Orange
                              '#6366f1'  // Indigo
                            ];
                            const color = colors[index % colors.length];
                            const isSelected = selectedGraphMember === memberKey;
                            const opacity = isSelected ? 1 : selectedGraphMember ? 0.3 : 1;
                            
                            // Custom dot renderer that hides dots for null/undefined values
                            const renderDot = (props: any) => {
                              const { cx, cy, payload } = props;
                              const value = payload[memberKey];
                              // Don't render dot if value is null/undefined
                              if (value === null || value === undefined) {
                                return null;
                              }
                              return (
                                <circle
                                  key={`dot-${member.member_id}-${payload.month}`}
                                  cx={cx}
                                  cy={cy}
                                  r={isSelected ? 7 : 6}
                                  fill={color}
                                  stroke={color}
                                  strokeWidth={2}
                                  fillOpacity={opacity}
                                />
                              );
                            };
                            
                            return (
                              <Line
                                key={member.member_id}
                                type="monotone"
                                dataKey={memberKey}
                                name={memberKey}
                                stroke={color}
                                strokeWidth={isSelected ? 4 : 3}
                                strokeOpacity={opacity}
                                dot={renderDot}
                                activeDot={{ r: 8, stroke: color, strokeWidth: 2 }}
                                isAnimationActive={false}
                                animationBegin={0}
                                animationDuration={8000}
                                animationEasing="linear"
                                connectNulls={true}
                              />
                            );
                          })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                    {/* Performance Summary - Commented out */}
                    {/* <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
                  <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {(() => {
                            const allScores: number[] = [];
                            teamMembersGraph.members.forEach((member: any) => {
                              if (Array.isArray(member.monthly_scores) && member.monthly_scores.length > 0) {
                                const lastScore = member.monthly_scores[member.monthly_scores.length - 1]?.average_overall_score;
                                if (typeof lastScore === 'number') {
                                  allScores.push(lastScore);
                                }
                              }
                            });
                            const avg = allScores.length > 0 
                              ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
                              : '0';
                            return avg;
                          })()}
                        </div>
                    <div className="text-sm text-muted-foreground">Current Avg</div>
                  </div>
                  <div className="text-center flex flex-col items-center">
                        <div className="text-2xl font-bold text-success">
                          {(() => {
                            const firstScores: number[] = [];
                            const lastScores: number[] = [];
                            teamMembersGraph.members.forEach((member: any) => {
                              if (Array.isArray(member.monthly_scores) && member.monthly_scores.length > 0) {
                                const firstScore = member.monthly_scores.find((s: any) => typeof s.average_overall_score === 'number')?.average_overall_score;
                                const lastScore = member.monthly_scores[member.monthly_scores.length - 1]?.average_overall_score;
                                if (typeof firstScore === 'number') firstScores.push(firstScore);
                                if (typeof lastScore === 'number') lastScores.push(lastScore);
                              }
                            });
                            const firstAvg = firstScores.length > 0 ? firstScores.reduce((a, b) => a + b, 0) / firstScores.length : 0;
                            const lastAvg = lastScores.length > 0 ? lastScores.reduce((a, b) => a + b, 0) / lastScores.length : 0;
                            const growth = lastAvg - firstAvg;
                            return growth >= 0 ? `+${growth.toFixed(1)}` : growth.toFixed(1);
                          })()}
                        </div>
                    <div className="text-sm text-muted-foreground">Growth</div>
                  </div>
                  <div className="text-center">
                        <div className="text-2xl font-bold text-warning">
                          {(() => {
                            let totalSessions = 0;
                            teamMembersGraph.members.forEach((member: any) => {
                              if (Array.isArray(member.monthly_scores)) {
                                member.monthly_scores.forEach((score: any) => {
                                  totalSessions += Number(score.session_count) || 0;
                                });
                              }
                            });
                            return totalSessions;
                          })()}
                        </div>
                    <div className="text-sm text-muted-foreground">Total Sessions</div>
                  </div>
                    </div> */}

                    {/* Members Legend - Shows all users with their graph colors */}
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex flex-wrap gap-3 justify-center items-center">
                        {teamMembersGraph.members.map((member: any, index: number) => {
                          const memberKey = member.user_name || `Member ${member.member_id}`;
                          const colors = [
                            '#3b82f6', // Blue
                            '#22c55e', // Green
                            '#ef4444', // Red
                            '#f59e0b', // Amber
                            '#8b5cf6', // Purple
                            '#ec4899', // Pink
                            '#06b6d4', // Cyan
                            '#84cc16', // Lime
                            '#f97316', // Orange
                            '#6366f1'  // Indigo
                          ];
                          const color = colors[index % colors.length];
                          const isSelected = selectedGraphMember === memberKey;
                          
                          return (
                            <div 
                              key={member.member_id} 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGraphMember(isSelected ? null : memberKey);
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-primary/10 border-primary shadow-md scale-105' 
                                  : 'bg-muted/50 border-border hover:bg-muted'
                              }`}
                            >
                              <div 
                                className={`w-3 h-3 rounded-full flex-shrink-0 transition-all ${
                                  isSelected ? 'ring-2 ring-primary ring-offset-1' : ''
                                }`}
                                style={{ backgroundColor: color }}
                              />
                              <span className={`text-sm font-medium whitespace-nowrap ${
                                isSelected ? 'text-primary font-semibold' : 'text-foreground'
                              }`}>
                                {memberKey}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No performance data available</p>
                      <p className="text-sm">Select a mode to view member trends</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Scenario Dashboard */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Scenarios
                </CardTitle>
                {/* Toggle View Mode */}
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                  <Button
                    variant={scenariosViewMode === 'by-users' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setScenariosViewMode('by-users')}
                    className={`text-sm ${scenariosViewMode === 'by-users' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'hover:bg-muted-foreground/10'}`}
                  >
                    <Users className="w-4 h-4 mr-1.5" />
                    By Users
                  </Button>
                  <Button
                    variant={scenariosViewMode === 'by-scenarios' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setScenariosViewMode('by-scenarios')}
                    className={`text-sm ${scenariosViewMode === 'by-scenarios' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'hover:bg-muted-foreground/10'}`}
                  >
                    <FileText className="w-4 h-4 mr-1.5" />
                    By Scenarios
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingScenarioDashboard ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Loading scenario data...</p>
                  </div>
                </div>
              ) : scenarioDashboardError ? (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="text-sm text-destructive font-medium">{scenarioDashboardError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={getScenarioDashboard}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              ) : scenarioDashboardData ? (
                <>
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Assigned */}
                    <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-black/70">Total Assigned</p>
                        <Target className="h-4 w-4 text-black/60" />
                      </div>
                      <p className="text-2xl font-bold text-black">{scenarioDashboardData?.total_assigned || 0}</p>
                    </div>

                    {/* Completed Count */}
                    <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-black/70">Completed</p>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-black">{scenarioDashboardData?.completed_count || 0}</p>
                    </div>

                    {/* Pending Count */}
                    <div className="p-4 rounded-lg border bg-orange-50 border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-black/70">Pending/Overdue</p>
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      <p className="text-2xl font-bold text-black">{scenarioDashboardData?.pending_count || 0}</p>
                    </div>

                    {/* Completion Rate */}
                    <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-black/70">Completion Rate</p>
                        <Percent className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-black">{scenarioDashboardData?.completion_rate || 0}%</p>
                    </div>
                  </div>

                  {/* Assigned Scenarios Listing - By Users View */}
                  {scenariosViewMode === 'by-users' && (
                    scenarioDashboardData?.assigned_scenarios && scenarioDashboardData.assigned_scenarios.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <h3 className="text-lg font-semibold text-black">Assigned Scenarios</h3>
                          <Badge variant="secondary" className="bg-yellow-100 text-black border-yellow-200">
                            {scenarioDashboardData.assigned_scenarios.length} {scenarioDashboardData.assigned_scenarios.length === 1 ? 'scenario' : 'scenarios'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          {(() => {
                            // Group scenarios by user_id
                            const scenariosByUser: Record<string, any[]> = {};
                            scenarioDashboardData.assigned_scenarios.forEach((scenario: any) => {
                              const userId = scenario.user_id;
                              if (!scenariosByUser[userId]) {
                                scenariosByUser[userId] = [];
                              }
                              scenariosByUser[userId].push(scenario);
                            });

                            // Get unique users
                            const uniqueUsers = Object.keys(scenariosByUser).map(userId => {
                              const userScenarios = scenariosByUser[userId];
                              const firstScenario = userScenarios[0];
                              
                              // Calculate completed and pending/overdue counts
                              const completedScenarios = userScenarios.filter((s: any) => s.is_completed);
                              const pendingScenarios = userScenarios.filter((s: any) => !s.is_completed && (s.days_remaining ?? 0) > 0);
                              const lapsedScenarios = userScenarios.filter((s: any) => !s.is_completed && (s.days_remaining ?? 0) === 0);
                              const pendingOverdueCount = pendingScenarios.length + lapsedScenarios.length;
                              
                              return {
                                userId,
                                user_name: firstScenario.user_name,
                                user_email: firstScenario.user_email,
                                scenarioCount: userScenarios.length,
                                completedCount: completedScenarios.length,
                                pendingOverdueCount: pendingOverdueCount,
                                scenarios: userScenarios
                              };
                            });

                            return uniqueUsers.map((user, index) => {
                              const handleUserClick = () => {
                                setSelectedUserScenarios(user.scenarios);
                                setSelectedUserInfo({
                                  name: user.user_name || "Unknown User",
                                  email: user.user_email || "",
                                  userId: user.userId
                                });
                                setIsUserScenariosDialogOpen(true);
                              };

                              return (
                                <div
                                  key={user.userId || index}
                                  onClick={handleUserClick}
                                  className="p-4 rounded-lg border border-border bg-card hover:border-yellow-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    {/* Left Side - User Info */}
                                    <div className="flex items-start gap-4 flex-1">
                                      <div className="p-2 rounded-lg bg-yellow-100 flex-shrink-0">
                                        <UserCircle className="h-5 w-5 text-black" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="font-semibold text-base text-black">{user.user_name || "Unknown User"}</p>
                                        </div>
                                        <p className="text-sm text-black/60">{user.user_email || ""}</p>
                                      </div>
                                    </div>

                                    {/* Right Side - Completed and Pending/Overdue Counts */}
                                    <div className="flex flex-row items-center gap-4 sm:flex-shrink-0">
                                      {/* Completed Scenarios */}
                                      <div className="flex items-center gap-1.5">
                                        {/* <CheckCircle className="h-4 w-4 text-green-600" /> */}
                                        <Badge 
                                          variant="outline" 
                                          className="text-sm font-semibold border-green-300 bg-green-50 text-green-700 px-3 py-1 whitespace-nowrap"
                                        >
                                          {user.completedCount} Completed
                                        </Badge>
                                      </div>
                                      
                                      {/* Pending/Overdue Scenarios */}
                                      <div className="flex items-center gap-1.5">
                                        {/* <Clock className="h-4 w-4 text-orange-600" /> */}
                                        <Badge 
                                          variant="outline" 
                                          className="text-sm font-semibold border-orange-300 bg-orange-50 text-orange-700 px-3 py-1 whitespace-nowrap"
                                        >
                                          {user.pendingOverdueCount} Pending/Overdue
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 border-t border-border">
                        <div className="flex flex-col items-center gap-2">
                          <Target className="h-8 w-8 text-muted-foreground opacity-50" />
                          <p className="text-sm text-muted-foreground">No scenarios assigned yet</p>
                        </div>
                      </div>
                    )
                  )}

                  {/* Assigned Scenarios Listing - By Scenarios View */}
                  {scenariosViewMode === 'by-scenarios' && (
                    loadingScenariosByScenario ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                          <p className="text-sm text-muted-foreground">Loading scenarios...</p>
                        </div>
                      </div>
                    ) : scenariosByScenarioData && scenariosByScenarioData.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <h3 className="text-lg font-semibold text-black">Scenarios</h3>
                          <Badge variant="secondary" className="bg-yellow-100 text-black border-yellow-200">
                            {scenariosByScenarioData.length} {scenariosByScenarioData.length === 1 ? 'scenario' : 'scenarios'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          {scenariosByScenarioData.map((scenario: any, index: number) => {
                            const usersCompleted = scenario.users_completed || [];
                            const usersPending = scenario.users_pending || [];
                            const usersOverdue = scenario.users_overdue || [];
                            const totalUsers = usersCompleted.length + usersPending.length + usersOverdue.length;
                            const completedCount = scenario.completed_count ?? usersCompleted.length;
                            const pendingOverdueCount = scenario.pending_overdue_count ?? (usersPending.length + usersOverdue.length);

                            // Get first available session_id (prefer completed, then pending, then overdue)
                            const firstSessionId = usersCompleted.length > 0 
                              ? usersCompleted[0]?.session_id 
                              : usersPending.length > 0 
                                ? usersPending[0]?.session_id 
                                : usersOverdue.length > 0 
                                  ? usersOverdue[0]?.session_id 
                                  : null;

                            const handleScenarioClick = () => {
                              setSelectedScenarioDetails(scenario);
                              setIsScenarioUsersDialogOpen(true);
                            };

                            const handleDeleteClick = (e: React.MouseEvent) => {
                              e.stopPropagation();
                              if (firstSessionId) {
                                openDeleteScenarioDialog(firstSessionId);
                              }
                            };

                            return (
                              <div
                                key={scenario.scenario_id || index}
                                onClick={handleScenarioClick}
                                className="p-4 rounded-lg border border-border bg-card hover:border-yellow-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                  {/* Left Side - Scenario Info */}
                                  <div className="flex items-start gap-4 flex-1">
                                    <div className="p-2 rounded-lg bg-yellow-100 flex-shrink-0">
                                      <FileText className="h-5 w-5 text-black" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-base text-black">{scenario.title || `Scenario ${index + 1}`}</p>
                                      </div>
                                      <p className="text-sm text-black/60">{scenario.mode?.name ? scenario.mode.name.charAt(0).toUpperCase() + scenario.mode.name.slice(1) : ''}</p>
                                    </div>
                                  </div>

                                  {/* Right Side - Counts and Actions */}
                                  <div className="flex flex-row items-center gap-4 sm:flex-shrink-0">
                                    <Badge 
                                      variant="outline" 
                                      className="text-sm font-semibold border-gray-300 bg-gray-50 text-gray-700 px-3 py-1 whitespace-nowrap"
                                    >
                                      {totalUsers} {totalUsers === 1 ? 'User' : 'Users'}
                                    </Badge>
                                    <Badge 
                                      variant="outline" 
                                      className="text-sm font-semibold border-green-300 bg-green-50 text-green-700 px-3 py-1 whitespace-nowrap"
                                    >
                                      {completedCount} Completed
                                    </Badge>
                                    <Badge 
                                      variant="outline" 
                                      className="text-sm font-semibold border-orange-300 bg-orange-50 text-orange-700 px-3 py-1 whitespace-nowrap"
                                    >
                                      {pendingOverdueCount} Pending/Overdue
                                    </Badge>
                                    {/* Delete scenario button removed in scenarios section */}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 border-t border-border">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-8 w-8 text-muted-foreground opacity-50" />
                          <p className="text-sm text-muted-foreground">No scenarios found</p>
                        </div>
                      </div>
                    )
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No scenario data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Scenarios Details Dialog */}
          <Dialog open={isUserScenariosDialogOpen} onOpenChange={setIsUserScenariosDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  <span>Scenarios for {selectedUserInfo?.name || "User"}</span>
                </DialogTitle>
              </DialogHeader>
              
              {selectedUserInfo && (
                <div className="space-y-4">
                  {/* User Info */}
                  <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-100">
                        <UserCircle className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <p className="font-semibold text-base text-black">{selectedUserInfo.name}</p>
                        <p className="text-sm text-black/60">{selectedUserInfo.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Scenarios List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-black">
                      All Scenarios ({selectedUserScenarios.length})
                    </h3>
                    
                    {(() => {
                      const pendingScenarios = selectedUserScenarios.filter((s: any) => !s.is_completed && (s.days_remaining ?? 0) > 0);
                      const lapsedScenarios = selectedUserScenarios.filter((s: any) => !s.is_completed && (s.days_remaining ?? 0) === 0);
                      const completedScenarios = selectedUserScenarios.filter((s: any) => s.is_completed);
                      const pendingOverdueScenarios = [...pendingScenarios, ...lapsedScenarios];
                      
                      return (
                        <>
                          {/* Pending/Overdue Scenarios */}
                          {(pendingScenarios.length > 0 || lapsedScenarios.length > 0) && (
                            <div className="space-y-4">
                              <Button
                                variant="outline"
                                onClick={() => setIsPendingOverdueScenariosOpen(!isPendingOverdueScenariosOpen)}
                                className="w-full flex items-center justify-between p-4 h-auto border-2 border-border bg-card hover:bg-muted"
                              >
                                <div className="flex items-center gap-3">
                                  <Clock className="h-5 w-5 text-black" />
                                  <span className="text-lg font-semibold text-black">Pending/Overdue</span>
                                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                                    {pendingScenarios.length} {pendingScenarios.length === 1 ? 'pending' : 'pending'}
                                  </Badge>
                                  {lapsedScenarios.length > 0 && (
                                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                                      {lapsedScenarios.length} {lapsedScenarios.length === 1 ? 'overdue' : 'overdue'}
                                    </Badge>
                                  )}
                                </div>
                                <div className="w-6 h-6 rounded bg-[#FFDE5A] flex items-center justify-center shrink-0">
                                  <Plus className={`h-4 w-4 text-black ${isPendingOverdueScenariosOpen ? 'hidden' : ''}`} />
                                  <Minus className={`h-4 w-4 text-black ${isPendingOverdueScenariosOpen ? '' : 'hidden'}`} />
                                </div>
                              </Button>

                              {isPendingOverdueScenariosOpen && (
                                <div className="grid gap-4">
                                  {pendingOverdueScenarios.length > 0 ? (
                                    [...pendingOverdueScenarios]
                                      .sort((a: any, b: any) => {
                                        // Sort pending first (by days remaining), then overdue (by date)
                                        const aIsPending = (a.days_remaining ?? 0) > 0;
                                        const bIsPending = (b.days_remaining ?? 0) > 0;
                                        
                                        if (aIsPending && !bIsPending) return -1;
                                        if (!aIsPending && bIsPending) return 1;
                                        
                                        if (aIsPending && bIsPending) {
                                          const daysA = a.days_remaining ?? Infinity;
                                          const daysB = b.days_remaining ?? Infinity;
                                          return daysA - daysB;
                                        } else {
                                          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                                          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                                          return dateB - dateA;
                                        }
                                      })
                                      .map((scenario: any, index: number) => {
                                        const isPending = (scenario.days_remaining ?? 0) > 0;
                                        return (
                                          <Card
                                            key={scenario.scenario_id || index}
                                            className="border-border hover:border-yellow-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                          >
                                            <CardContent className="p-6">
                                              <div className="flex items-start justify-between gap-6">
                                                <div className="flex-1 space-y-4">
                                                  {/* Title Heading with Badge and Share/Delete Buttons */}
                                                  <div className={`pb-3 border-b border-border/50 flex items-center justify-between gap-3`}>
                                                    <div className="flex items-center gap-3">
                                                      {scenario.title ? (
                                                        <h3 className="text-xl font-bold text-black">{scenario.title}</h3>
                                                      ) : null}
                                                      <Badge 
                                                        variant="outline"
                                                        className={`text-xs font-medium px-3 py-1.5 shrink-0 ${
                                                          isPending 
                                                            ? 'border-red-300 bg-red-50 text-red-700'
                                                            : 'border-orange-400 bg-orange-100 text-orange-700'
                                                        }`}
                                                      >
                                                        {isPending ? (
                                                          <>
                                                            <Clock className="h-3 w-3 mr-1.5" />
                                                            Pending
                                                          </>
                                                        ) : (
                                                          <>
                                                            <AlertCircle className="h-3 w-3 mr-1.5" />
                                                            Overdue
                                                          </>
                                                        )}
                                                      </Badge>
                                                    </div>
                                                    {/* Delete scenario button removed in scenarios section */}
                                                  </div>

                                                  {/* Information Section */}
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
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
                                                        <Target className="h-4 w-4 text-black/60" />
                                                      </div>
                                                      <div>
                                                        <p className="text-xs font-medium text-black/50 mb-1">Deadline</p>
                                                        <p className="text-sm font-semibold text-black">{scenario.time_limit_days || 0} days</p>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                      <div className="p-2 rounded-lg bg-yellow-50/30 border border-border/50">
                                                        <Target className="h-4 w-4 text-black/60" />
                                                      </div>
                                                      <div>
                                                        <p className="text-xs font-medium text-black/50 mb-1">Mode</p>
                                                        <p className="text-sm font-semibold text-black">
                                                          {formatText(scenario.mode?.name || scenario.mode_name || scenario.mode || "N/A")}
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                      <div className="p-2 rounded-lg bg-yellow-50/30 border border-border/50">
                                                        <UserCircle className="h-4 w-4 text-black/60" />
                                                      </div>
                                                      <div className="flex-1">
                                                        <div className="flex items-center gap-1 mb-1">
                                                          <p className="text-xs font-medium text-black/50">Persona</p>
                                                          {getPersonaIdFromScenario(scenario) && (
                                                            <Button
                                                              variant="ghost"
                                                              size="sm"
                                                              onClick={(e) => handlePersonaInfoClick(scenario, e)}
                                                              className="h-2 w-2 p-0 pt-[2px] pl-2 text-black/50 hover:text-black/80 hover:bg-transparent min-w-0"
                                                              title="View persona details"
                                                            >
                                                              <Info className="h-1.5 w-1.5" />
                                                            </Button>
                                                          )}
                                                        </div>
                                                        <p className="text-sm font-semibold text-black">
                                                          {scenario.persona?.name || scenario.persona_name || scenario.persona || "N/A"}
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                      <div className="p-2 rounded-lg bg-yellow-50/30 border border-border/50">
                                                        {isPending ? (
                                                          <Clock className="h-4 w-4 text-black/60" />
                                                        ) : (
                                                          <AlertCircle className="h-4 w-4 text-black/60" />
                                                        )}
                                                      </div>
                                                      <div>
                                                        <p className="text-xs font-medium text-black/50 mb-1">Days Remaining</p>
                                                        <p className="text-sm font-semibold text-black">
                                                          {isPending 
                                                            ? `${scenario.days_remaining || 0} ${scenario.days_remaining === 1 ? 'day' : 'days'}`
                                                            : '0 days (Time lapsed)'}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  {/* Scenario Message */}
                                                  {scenario.scenario && (
                                                    <div className="pt-3 border-t border-border/50">
                                                      <div className="flex items-start gap-2">
                                                        <FileText className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1">
                                                          <p className="text-xs font-medium text-black/60 mb-1">Scenario Message</p>
                                                          <p className="text-sm text-black leading-relaxed">{scenario.scenario}</p>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )}

                                                  {/* Manager Message */}
                                                  {scenario.message && (
                                                    <div className="pt-2">
                                                      <div className="flex items-start gap-2">
                                                        <Info className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1">
                                                          <p className="text-xs font-medium text-black/60 mb-1">Message</p>
                                                          <p className="text-sm text-black leading-relaxed italic">"{scenario.message}"</p>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        );
                                      })
                                  ) : (
                                    <Card>
                                      <CardContent className="p-8">
                                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                                          <Clock className="h-8 w-8 text-red-300" />
                                          <p className="text-sm text-muted-foreground">No pending or overdue scenarios</p>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
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
                                        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                                        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                                        return dateB - dateA;
                                      })
                                      .map((scenario: any, index: number) => (
                                        <Card
                                          key={scenario.scenario_id || index}
                                          className="border-border hover:border-yellow-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                        >
                                          <CardContent className="p-6">
                                            <div className="flex items-start justify-between gap-6">
                                              <div className="flex-1 space-y-4">
                                                {/* Title Heading with Badge and Share/Delete Buttons */}
                                                <div className={`pb-3 border-b border-border/50 flex items-center justify-between gap-3`}>
                                                  <div className="flex items-center gap-3">
                                                    {scenario.title ? (
                                                      <h3 className="text-xl font-bold text-black">{scenario.title}</h3>
                                                    ) : null}
                                                    <Badge 
                                                      variant="outline"
                                                      className="text-xs font-medium px-3 py-1.5 shrink-0 border-green-300 bg-green-50 text-green-700"
                                                    >
                                                      <CheckCircle className="h-3 w-3 mr-1.5" />
                                                      Completed
                                                    </Badge>
                                                  </div>
                                                  {/* Delete scenario button removed in scenarios section */}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
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
                                                      <Target className="h-4 w-4 text-black/60" />
                                                    </div>
                                                    <div>
                                                      <p className="text-xs font-medium text-black/50 mb-1">Deadline</p>
                                                      <p className="text-sm font-semibold text-black">{scenario.time_limit_days || 0} days</p>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-lg bg-yellow-50/30 border border-border/50">
                                                      <Target className="h-4 w-4 text-black/60" />
                                                    </div>
                                                    <div>
                                                      <p className="text-xs font-medium text-black/50 mb-1">Mode</p>
                                                      <p className="text-sm font-semibold text-black">
                                                        {formatText(scenario.mode?.name || scenario.mode_name || scenario.mode || "N/A")}
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-lg bg-yellow-50/30 border border-border/50">
                                                      <UserCircle className="h-4 w-4 text-black/60" />
                                                    </div>
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-1 mb-1">
                                                        <p className="text-xs font-medium text-black/50">Persona</p>
                                                        {getPersonaIdFromScenario(scenario) && (
                                                          <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => handlePersonaInfoClick(scenario, e)}
                                                            className="h-2 w-2 p-0 text-black hover:text-black/80 hover:bg-transparent min-w-0"
                                                            title="View persona details"
                                                          >
                                                            <Info className="h-1.5 w-1.5" />
                                                          </Button>
                                                        )}
                                                      </div>
                                                      <p className="text-sm font-semibold text-black">
                                                        {scenario.persona?.name || scenario.persona_name || scenario.persona || "N/A"}
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-lg bg-green-50/30 border border-green-200/50">
                                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                      <p className="text-xs font-medium text-black/50 mb-1">Completed On</p>
                                                      <p className="text-sm font-semibold text-black">
                                                        {scenario.end_time 
                                                          ? new Date(scenario.end_time).toLocaleDateString('en-US', { 
                                                              weekday: 'short',
                                                              month: 'short', 
                                                              day: 'numeric',
                                                              year: 'numeric'
                                                            })
                                                          : "N/A"}
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Scenario Message */}
                                                {scenario.scenario && (
                                                  <div className="pt-3 border-t border-border/50">
                                                    <div className="flex items-start gap-2">
                                                      <FileText className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                                                      <div className="flex-1">
                                                        <p className="text-xs font-medium text-black/60 mb-1">Scenario Message</p>
                                                        <p className="text-sm text-black leading-relaxed">{scenario.scenario}</p>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Manager Message */}
                                                {scenario.message && (
                                                  <div className="pt-2">
                                                    <div className="flex items-start gap-2">
                                                      <Info className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                                                      <div className="flex-1">
                                                        <p className="text-xs font-medium text-black/60 mb-1">Message</p>
                                                        <p className="text-sm text-black leading-relaxed italic">"{scenario.message}"</p>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Performance Button */}
                                                {scenario.session_id && (
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
                                                )}
                                              </div>
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
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Scenario Users Details Dialog - For "By Scenarios" View */}
          <Dialog open={isScenarioUsersDialogOpen} onOpenChange={setIsScenarioUsersDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span>Users for {selectedScenarioDetails?.title || "Scenario"}</span>
                </DialogTitle>
              </DialogHeader>
              
              {selectedScenarioDetails && (
                <div className="space-y-4">
                  {/* Scenario Details Card - Shown Once at Top */}
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Information Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-yellow-50/30 border border-border/50">
                              <Calendar className="h-4 w-4 text-black/60" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-black/50 mb-1">Created On</p>
                              <p className="text-sm font-semibold text-black">
                                {selectedScenarioDetails.created_at 
                                  ? new Date(selectedScenarioDetails.created_at).toLocaleDateString('en-US', { 
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
                              <Target className="h-4 w-4 text-black/60" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-black/50 mb-1">Deadline</p>
                              <p className="text-sm font-semibold text-black">{selectedScenarioDetails.time_limit_days || 0} days</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-yellow-50/30 border border-border/50">
                              <Target className="h-4 w-4 text-black/60" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-black/50 mb-1">Mode</p>
                              <p className="text-sm font-semibold text-black">
                                {formatText(selectedScenarioDetails.mode?.name || "N/A")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-yellow-50/30 border border-border/50">
                              <UserCircle className="h-4 w-4 text-black/60" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-1 mb-1">
                                <p className="text-xs font-medium text-black/50">Persona</p>
                                {getPersonaIdFromScenario(selectedScenarioDetails) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handlePersonaInfoClick(selectedScenarioDetails, e)}
                                    className="h-2 w-2 p-0 pt-[2px] pl-2 text-black/50 hover:text-black/80 hover:bg-transparent min-w-0"
                                    title="View persona details"
                                  >
                                    <Info className="h-1.5 w-1.5" />
                                  </Button>
                                )}
                              </div>
                              <p className="text-sm font-semibold text-black">
                                {selectedScenarioDetails.persona?.name || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Scenario Message */}
                        {selectedScenarioDetails.scenario_text && (
                          <div className="pt-3 border-t border-border/50">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-black/60 mb-1">Scenario Message</p>
                                <p className="text-sm text-black leading-relaxed">{selectedScenarioDetails.scenario_text}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Manager Message */}
                        {selectedScenarioDetails.message && (
                          <div className="pt-2">
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-black/60 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-black/60 mb-1">Message</p>
                                <p className="text-sm text-black leading-relaxed italic">"{selectedScenarioDetails.message}"</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Users List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-black">
                      All Users ({(selectedScenarioDetails.users_completed?.length || 0) + (selectedScenarioDetails.users_pending?.length || 0) + (selectedScenarioDetails.users_overdue?.length || 0)})
                    </h3>
                    
                    {(() => {
                      const usersCompleted = selectedScenarioDetails.users_completed || [];
                      const usersPending = selectedScenarioDetails.users_pending || [];
                      const usersOverdue = selectedScenarioDetails.users_overdue || [];
                      const pendingOverdueUsers = [...usersPending, ...usersOverdue];
                      const hasUsers = usersCompleted.length > 0 || usersPending.length > 0 || usersOverdue.length > 0;
                      
                      if (!hasUsers) {
                        return (
                          <div className="text-center py-8">
                            <UserCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground">No users assigned to this scenario</p>
                          </div>
                        );
                      }
                      
                      return (
                        <>
                          {/* Pending/Overdue Users Section */}
                          {(usersPending.length > 0 || usersOverdue.length > 0) && (
                            <div className="space-y-4">
                              <Button
                                variant="outline"
                                onClick={() => setIsScenarioPendingOverdueOpen(!isScenarioPendingOverdueOpen)}
                                className="w-full flex items-center justify-between p-4 h-auto border-2 border-border bg-card hover:bg-muted"
                              >
                                <div className="flex items-center gap-3">
                                  <Clock className="h-5 w-5 text-black" />
                                  <span className="text-lg font-semibold text-black">Pending/Overdue</span>
                                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                                    {usersPending.length} pending
                                  </Badge>
                                  {usersOverdue.length > 0 && (
                                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                                      {usersOverdue.length} overdue
                                    </Badge>
                                  )}
                                </div>
                                <div className="w-6 h-6 rounded bg-[#FFDE5A] flex items-center justify-center shrink-0">
                                  <Plus className={`h-4 w-4 text-black ${isScenarioPendingOverdueOpen ? 'hidden' : ''}`} />
                                  <Minus className={`h-4 w-4 text-black ${isScenarioPendingOverdueOpen ? '' : 'hidden'}`} />
                                </div>
                              </Button>

                              {isScenarioPendingOverdueOpen && (
                                <div className="grid gap-4">
                                  {pendingOverdueUsers.length > 0 ? (
                                    pendingOverdueUsers.map((user: any, userIndex: number) => {
                                      const isPending = (user.days_remaining ?? 0) > 0;
                                      return (
                                        <Card
                                          key={user.user_id || userIndex}
                                          className="border-border hover:border-yellow-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                        >
                                          <CardContent className="p-4">
                                            <div className="flex items-center justify-between gap-4">
                                              <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${isPending ? 'bg-red-50' : 'bg-orange-50'}`}>
                                                  <UserCircle className={`h-5 w-5 ${isPending ? 'text-red-600' : 'text-orange-600'}`} />
                                                </div>
                                                <div>
                                                  <p className="font-semibold text-black">{user.name || 'Unknown User'}</p>
                                                  {user.email && (
                                                    <p className="text-sm text-black/60">{user.email}</p>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                  <p className="text-xs font-medium text-black/50">Days Remaining</p>
                                                  <p className={`text-sm font-semibold ${isPending ? 'text-red-600' : 'text-orange-600'}`}>
                                                    {isPending 
                                                      ? `${user.days_remaining || 0} ${user.days_remaining === 1 ? 'day' : 'days'}`
                                                      : '0 days (Time lapsed)'}
                                                  </p>
                                                </div>
                                                <Badge 
                                                  variant="outline"
                                                  className={`text-xs font-medium px-3 py-1.5 shrink-0 ${
                                                    isPending 
                                                      ? 'border-red-300 bg-red-50 text-red-700'
                                                      : 'border-orange-400 bg-orange-100 text-orange-700'
                                                  }`}
                                                >
                                                  {isPending ? (
                                                    <>
                                                      <Clock className="h-3 w-3 mr-1.5" />
                                                      Pending
                                                    </>
                                                  ) : (
                                                    <>
                                                      <AlertCircle className="h-3 w-3 mr-1.5" />
                                                      Overdue
                                                    </>
                                                  )}
                                                </Badge>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      );
                                    })
                                  ) : (
                                    <Card>
                                      <CardContent className="p-8">
                                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                                          <Clock className="h-8 w-8 text-red-300" />
                                          <p className="text-sm text-muted-foreground">No pending or overdue users</p>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Completed Users Section */}
                          {usersCompleted.length > 0 && (
                            <div className="space-y-4">
                              <Button
                                variant="outline"
                                onClick={() => setIsScenarioCompletedOpen(!isScenarioCompletedOpen)}
                                className="w-full flex items-center justify-between p-4 h-auto border-2 border-border bg-card hover:bg-muted"
                              >
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="h-5 w-5 text-black" />
                                  <span className="text-lg font-semibold text-black">Completed</span>
                                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                    {usersCompleted.length} {usersCompleted.length === 1 ? 'user' : 'users'}
                                  </Badge>
                                </div>
                                <div className="w-6 h-6 rounded bg-[#FFDE5A] flex items-center justify-center shrink-0">
                                  <Plus className={`h-4 w-4 text-black ${isScenarioCompletedOpen ? 'hidden' : ''}`} />
                                  <Minus className={`h-4 w-4 text-black ${isScenarioCompletedOpen ? '' : 'hidden'}`} />
                                </div>
                              </Button>

                              {isScenarioCompletedOpen && (
                                <div className="grid gap-4">
                                  {usersCompleted.map((user: any, userIndex: number) => (
                                    <Card
                                      key={user.user_id || userIndex}
                                      className="border-border hover:border-yellow-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                    >
                                      <CardContent className="p-4">
                                        <div className="space-y-4">
                                          {/* User Info and Status */}
                                          <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                              <div className="p-2 rounded-lg bg-green-50">
                                                <UserCircle className="h-5 w-5 text-green-600" />
                                              </div>
                                              <div>
                                                <p className="font-semibold text-black">{user.name || 'Unknown User'}</p>
                                                {user.email && (
                                                  <p className="text-sm text-black/60">{user.email}</p>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <div className="text-right">
                                                <p className="text-xs font-medium text-black/50">Completed On</p>
                                                <p className="text-sm font-semibold text-green-600">
                                                  {user.end_time 
                                                    ? new Date(user.end_time).toLocaleDateString('en-US', { 
                                                        weekday: 'short',
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                      })
                                                    : "N/A"}
                                                </p>
                                              </div>
                                              <Badge 
                                                variant="outline"
                                                className="text-xs font-medium px-3 py-1.5 shrink-0 border-green-300 bg-green-50 text-green-700"
                                              >
                                                <CheckCircle className="h-3 w-3 mr-1.5" />
                                                Completed
                                              </Badge>
                                            </div>
                                          </div>

                                          {/* Performance Button */}
                                          {user.session_id && (
                                            <div className="pt-3 border-t border-border/50">
                                              <Button
                                                variant="outline"
                                                onClick={(e) => handleViewPerformance(user.session_id, e)}
                                                className="w-full bg-yellow-50 hover:bg-yellow-100 border-border text-black"
                                              >
                                                <BarChart3 className="h-4 w-4 mr-2" />
                                                Performance
                                              </Button>
                                            </div>
                                          )}
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
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Scenario Confirmation Dialog */}
          <AlertDialog open={isDeleteScenarioDialogOpen} onOpenChange={(open) => {
            setIsDeleteScenarioDialogOpen(open);
            if (!open) setDeletingSessionId(null);
          }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Scenario?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this scenario? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setIsDeleteScenarioDialogOpen(false);
                  setDeletingSessionId(null);
                }}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="text-[#ef4343]"
                  onClick={handleDeleteScenario}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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
                    // Also skip evaluation fields (handled separately for managers only)
                    if (['overall_score', 'skills', 'mode_name', 'coaching_summary', 'coaching_notes', 'feedback', 'recommendations', 'areas_for_improvement', 'strengths', 'weaknesses', 'scenario_evaluation', 'evaluation', 'scenario_evaluation_summary', 'evaluation_summary'].includes(key)) return null;
                    
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

                  {/* Scenario Evaluation Section - Only visible to sales managers */}
                  {user?.role?.name !== "sales_person" && 
                    (performanceData.scenario_evaluation || 
                     performanceData.evaluation || 
                     performanceData.scenario_evaluation_summary || 
                     performanceData.evaluation_summary) && (
                    <Card className="border-border bg-blue-50/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <FileText className="h-5 w-5 text-black" />
                          Scenario Evaluation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Scenario Evaluation */}
                        {(performanceData.scenario_evaluation || performanceData.evaluation) && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-black/70">Evaluation</p>
                            <div className="bg-white p-6 rounded-lg border border-border/50">
                              {typeof (performanceData.scenario_evaluation || performanceData.evaluation) === 'string' 
                                ? formatCoachingText(performanceData.scenario_evaluation || performanceData.evaluation)
                                : <p className="text-sm text-black leading-relaxed">{JSON.stringify(performanceData.scenario_evaluation || performanceData.evaluation)}</p>}
                            </div>
                          </div>
                        )}

                        {/* Scenario Evaluation Summary */}
                        {(performanceData.scenario_evaluation_summary || performanceData.evaluation_summary) && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-black/70">Evaluation Summary</p>
                            <div className="bg-white p-6 rounded-lg border border-border/50">
                              {typeof (performanceData.scenario_evaluation_summary || performanceData.evaluation_summary) === 'string' 
                                ? formatCoachingText(performanceData.scenario_evaluation_summary || performanceData.evaluation_summary)
                                : <p className="text-sm text-black leading-relaxed">{JSON.stringify(performanceData.scenario_evaluation_summary || performanceData.evaluation_summary)}</p>}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

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
                      // Note: deleteTeamMember already refreshes the data, no need to call again
                    }
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Assign Scenario Dialog */}
          <Dialog open={isAssignScenarioDialogOpen} onOpenChange={(open) => {
            setIsAssignScenarioDialogOpen(open);
            if (!open) {
              setSelectedMemberForScenario(null);
              setScenarioData({ mode: "", persona: "", description: "", timeLimit: 7, message: "", title: "" });
              setTitleTouched(false);
              setScenarioStep(1);
              setSelectedAdditionalMembers([]);
              setDocumentFile(null);
              setDocumentSummary("");
              setIsUploadingDocument(false);
              setSharingSessionId(null); // Reset sharing session ID when dialog closes
              setSharingSessionIdState(null); // Reset sharing session ID state when dialog closes
              setIsLoadingShareScenario(false); // Reset loading state
            }
          }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-2xl font-bold">
                  {sharingSessionId ? "Share Scenario" : "Assign Scenario"}
                </DialogTitle>
              </DialogHeader>
              
              {scenarioStep === 1 ? (
                // Step 1: Select mode, persona, and write scenario
                <div className="space-y-6 py-2">
                  <div className="space-y-3">
                    <Label htmlFor="scenario-title" className="text-base font-semibold">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="scenario-title"
                      placeholder="Enter scenario title..."
                      value={scenarioData.title}
                      onChange={(e) => setScenarioData(prev => ({ ...prev, title: e.target.value }))}
                      onBlur={() => setTitleTouched(true)}
                      className={`h-12 text-base ${!scenarioData.title.trim() && titleTouched ? "border-red-500" : ""}`}
                    />
                    {!scenarioData.title.trim() && titleTouched && (
                      <p className="text-sm text-destructive">Title is required</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="scenario-mode" className="text-base font-semibold">
                        Mode <span className="text-destructive">*</span>
                      </Label>
                  <Select
                    value={scenarioData.mode}
                        onValueChange={(value) => setScenarioData(prev => ({ ...prev, mode: value }))}
                  >
                        <SelectTrigger 
                          id="scenario-mode" 
                          className={`h-12 text-base ${!scenarioData.mode ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="Select a mode" />
                    </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {modesData.length > 0 ? (
                            modesData.map((mode) => (
                              <SelectItem 
                                key={mode?.mode_id || mode?.id} 
                                value={(mode?.mode_id || mode?.id).toString()}
                                className="text-base py-3"
                              >
                          {mode?.name || mode?.mode_name}
                        </SelectItem>
                            ))
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">No modes available</div>
                          )}
                    </SelectContent>
                  </Select>
                      {scenarioData.mode && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {modesData.find(m => (m?.mode_id || m?.id).toString() === scenarioData.mode)?.name || modesData.find(m => (m?.mode_id || m?.id).toString() === scenarioData.mode)?.mode_name}
                        </p>
                      )}
                </div>

                    <div className="space-y-3">
                      <Label htmlFor="scenario-persona" className="text-base font-semibold">
                        Persona <span className="text-destructive">*</span>
                      </Label>
                  <Select
                    value={scenarioData.persona}
                        onValueChange={(value) => setScenarioData(prev => ({ ...prev, persona: value }))}
                  >
                        <SelectTrigger 
                          id="scenario-persona" 
                          className={`h-12 text-base ${!scenarioData.persona ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="Select a persona" />
                    </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {personasData.length > 0 ? (
                            personasData.map((persona) => (
                        <div key={persona?.persona_id || persona?.id} className="relative group">
                          <SelectItem 
                            value={(persona?.persona_id || persona?.id).toString()}
                                  className="pr-10 text-base py-3"
                          >
                            {persona?.name || persona?.persona_name}
                          </SelectItem>
                          <Button
                            variant="ghost"
                            size="sm"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              fetchPersonaDetails(persona?.persona_id || persona?.id);
                            }}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">No personas available</div>
                          )}
                    </SelectContent>
                  </Select>
                      {scenarioData.persona && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {personasData.find(p => (p?.persona_id || p?.id).toString() === scenarioData.persona)?.name || personasData.find(p => (p?.persona_id || p?.id).toString() === scenarioData.persona)?.persona_name}
                        </p>
                      )}
                </div>

                    <div className="space-y-3">
                      <Label htmlFor="scenario-time-limit" className="text-base font-semibold">
                        Deadline (Days) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="scenario-time-limit"
                        type="number"
                        min="1"
                        value={scenarioData.timeLimit}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setScenarioData(prev => ({ ...prev, timeLimit: value > 0 ? value : 0 }));
                        }}
                        className={`h-12 text-base ${!scenarioData.timeLimit || scenarioData.timeLimit < 1 ? "border-red-500" : ""}`}
                      />
                      {scenarioData.timeLimit && scenarioData.timeLimit >= 1 ? (
                        <p className="text-sm text-muted-foreground">
                          Active for {scenarioData.timeLimit} {scenarioData.timeLimit === 1 ? 'day' : 'days'}
                        </p>
                      ) : (
                        <p className="text-sm text-destructive">Deadline is required (minimum 1 day)</p>
                      )}
                    </div>
                  </div>

                  {/* Document Upload Section */}
                  <div className="space-y-3">
                    <Label htmlFor="document-upload" className="text-base font-semibold">
                      Upload Document (Optional)
                    </Label>
                    <div className="border-2 border-dashed rounded-lg p-6">
                      {!documentFile ? (
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (Max 10MB)</p>
                          </div>
                          <label htmlFor="document-upload">
                            <Button
                              type="button"
                              variant="outline"
                              className="cursor-pointer"
                              disabled={isUploadingDocument}
                              asChild
                            >
                              <span>
                                {isUploadingDocument ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Select File
                                  </>
                                )}
                              </span>
                            </Button>
                          </label>
                          <input
                            id="document-upload"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isUploadingDocument}
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-3 flex-1">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">{documentFile.name}</p>
                                  {documentSummary && !isUploadingDocument && (
                                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Processed
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {(documentFile.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveDocument}
                              disabled={isUploadingDocument}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {isUploadingDocument && (
                            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Processing document...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="scenario-description" className="text-base font-semibold">
                      Scenario <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="scenario-description"
                      placeholder="Write your scenario description here..."
                      value={scenarioData.description}
                      onChange={(e) => setScenarioData(prev => ({ ...prev, description: e.target.value }))}
                      className={`min-h-[200px] text-base resize-none ${!scenarioData.description.trim() ? "border-red-500" : ""}`}
                    />
                    <p className="text-sm text-muted-foreground">
                      {scenarioData.description.length} characters
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                <Button
                      className="w-full h-12 text-base font-semibold"
                      onClick={handleProceed}
                      disabled={
                        !scenarioData.mode || 
                        !scenarioData.persona || 
                        !scenarioData.title.trim() ||
                        !scenarioData.timeLimit || 
                        scenarioData.timeLimit < 1 ||
                        !scenarioData.description.trim()
                      }
                    >
                      Proceed
                    </Button>
                  </div>
                </div>
              ) : (
                // Step 2: Assign to members
                <div className="space-y-6 py-2">
                  {selectedMemberForScenario && (
                    <div className="p-6 bg-muted/50 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-2 font-medium">Assigning scenario to:</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedMemberForScenario?.user?.avatar} />
                          <AvatarFallback>
                            {selectedMemberForScenario?.user?.first_name?.[0]}{selectedMemberForScenario?.user?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-xl">
                            {selectedMemberForScenario?.user?.first_name} {selectedMemberForScenario?.user?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{selectedMemberForScenario?.user?.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold mb-3 block">
                        {sharingSessionId 
                          ? "Select team members to assign this scenario (from all teams)"
                          : "Assign same scenario to other team members"}
                      </Label>
                      {isLoadingAllMembers && sharingSessionId ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span className="text-sm text-muted-foreground">Loading all team members...</span>
                        </div>
                      ) : (
                        <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto space-y-2">
                          {(() => {
                            // Use allTeamMembers when sharing, otherwise use teamMembers
                            const membersToShow = sharingSessionId ? allTeamMembers : teamMembers;
                            
                            if (!membersToShow || membersToShow.length === 0) {
                              return (
                                <div className="text-center py-8 text-muted-foreground">
                                  {sharingSessionId 
                                    ? "No team members found across all teams"
                                    : "No team members available"}
                                </div>
                              );
                            }

                            // Group members by team when sharing
                            if (sharingSessionId) {
                              const groupedByTeam: Record<string, any[]> = {};
                              membersToShow.forEach((member: any) => {
                                const teamKey = member.team_name || member.team_id || 'Unknown Team';
                                if (!groupedByTeam[teamKey]) {
                                  groupedByTeam[teamKey] = [];
                                }
                                groupedByTeam[teamKey].push(member);
                              });

                              return Object.entries(groupedByTeam).map(([teamName, teamMembersList]) => (
                                <div key={teamName} className="mb-4 last:mb-0">
                                  <div className="mb-2 px-2">
                                    <p className="text-sm font-semibold text-black/70">{teamName}</p>
                                    {teamMembersList[0]?.company_name && (
                                      <p className="text-xs text-muted-foreground">{teamMembersList[0].company_name}</p>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    {teamMembersList.map((member: any, index: number) => {
                                      // Use user_id for selection to sync across teams
                                      const userId = (member?.user?.user_id || member?.user_id) as number;
                                      const isSelected = selectedAdditionalMembers.includes(userId);
                                      const uniqueKey = `${teamName}-${userId}-${index}`;
                                      return (
                                        <div
                                          key={uniqueKey}
                                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                                            isSelected 
                                              ? "bg-primary/10 border-primary" 
                                              : "hover:bg-muted/50"
                                          }`}
                                          onClick={() => toggleAdditionalMember(userId)}
                                        >
                                          <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                              <AvatarImage src={member?.user?.avatar} />
                                              <AvatarFallback>
                                                {member?.user?.first_name?.[0]}{member?.user?.last_name?.[0]}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="font-medium">
                                                {member?.user?.first_name} {member?.user?.last_name}
                                              </p>
                                              <p className="text-sm text-muted-foreground">{member?.user?.email}</p>
                                            </div>
                                          </div>
                                          {isSelected && (
                                            <Check className="h-5 w-5 text-primary" />
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ));
                            }

                            // Regular flow (not sharing) - show team members
                            return membersToShow
                              .filter((member: any) => {
                                const userId = member?.user?.user_id || member?.user_id;
                                const selectedId = selectedMemberForScenario?.user?.user_id || selectedMemberForScenario?.user_id;
                                return userId !== selectedId;
                              })
                              .map((member: any, index: number) => {
                                // Use user_id for selection
                                const userId = (member?.user?.user_id || member?.user_id) as number;
                                const isSelected = selectedAdditionalMembers.includes(userId);
                                return (
                                  <div
                                    key={userId || `member-${index}`}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                                      isSelected 
                                        ? "bg-primary/10 border-primary" 
                                        : "hover:bg-muted/50"
                                    }`}
                                    onClick={() => toggleAdditionalMember(userId)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10">
                                        <AvatarImage src={member?.user?.avatar} />
                                        <AvatarFallback>
                                          {member?.user?.first_name?.[0]}{member?.user?.last_name?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">
                                          {member?.user?.first_name} {member?.user?.last_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{member?.user?.email}</p>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <Check className="h-5 w-5 text-primary" />
                                    )}
                                  </div>
                                );
                              });
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="scenario-message" className="text-base font-semibold">
                      Message (Optional)
                    </Label>
                    <Textarea
                      id="scenario-message"
                      placeholder="Add a message for the assigned members..."
                      value={scenarioData.message}
                      onChange={(e) => setScenarioData(prev => ({ ...prev, message: e.target.value }))}
                      className="min-h-[100px] text-base resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      {scenarioData.message.length} characters
                    </p>
                  </div>

                  <div className="pt-4 border-t flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 text-base font-semibold"
                      onClick={() => setScenarioStep(1)}
                      disabled={isAssigningScenario}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 h-12 text-base font-semibold"
                      onClick={handleAssignScenario}
                      disabled={isAssigningScenario || !scenarioData.title.trim()}
                    >
                      {isAssigningScenario ? "Assigning Scenario..." : "Assign Scenario"}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Persona Details Dialog */}
          <Dialog open={isPersonaDetailsOpen} onOpenChange={setIsPersonaDetailsOpen}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0 border border-border shadow-2xl bg-background">
              {/* Header */}
              <div className="sticky top-0 z-10 border-b border-border bg-background px-4 py-3">
                <DialogHeader className="pb-0">
                  <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-yellow-100">
                      <Sparkles className="h-3.5 w-3.5 text-black" />
                    </div>
                    <span className="text-black">Persona Profile</span>
                  </DialogTitle>
              </DialogHeader>
              </div>

              <div className="overflow-y-auto max-h-[calc(85vh-60px)] px-4 py-4 bg-background">
              {loadingPersonaDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-200"></div>
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-black absolute top-0 left-0"></div>
                      </div>
                      <div className="text-sm font-medium text-black/70 animate-pulse">Loading persona details...</div>
                    </div>
                </div>
              ) : selectedPersonaDetails ? (
                  <div className="space-y-4 animate-in fade-in-50 duration-500">
                    {/* Profile Header Section */}
                    <div className="relative group">
                      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-50 border border-yellow-200 shadow-sm p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="relative group/avatar flex-shrink-0">
                            <Avatar className="relative h-16 w-16 border-2 border-yellow-50 shadow-md ring-1 ring-yellow-200">
                              <AvatarImage 
                                src={selectedPersonaDetails?.profile_pic} 
                                alt={selectedPersonaDetails?.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-yellow-600 to-yellow-700 text-white">
                        {selectedPersonaDetails?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-black border-2 border-yellow-50 flex items-center justify-center shadow-md ring-1 ring-yellow-200">
                              <User className="h-2.5 w-2.5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 pt-0.5 min-w-0">
                            <h3 className="text-xl font-bold tracking-tight mb-2 text-black break-words">
                              {formatText(selectedPersonaDetails?.name)}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              {selectedPersonaDetails?.gender && (
                                <Badge 
                                  variant="secondary" 
                                  className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-black border-yellow-200"
                                >
                                  {formatText(selectedPersonaDetails?.gender)}
                      </Badge>
                              )}
                              {selectedPersonaDetails?.ai_role && (
                                <Badge 
                                  variant="outline" 
                                  className="px-2 py-0.5 text-xs font-medium border-yellow-300 bg-yellow-50"
                                >
                                  <Briefcase className="h-2.5 w-2.5 mr-1 text-black" />
                                  <span className="break-words text-black">{formatText(selectedPersonaDetails?.ai_role?.name)}</span>
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>

                    {/* Details Grid with modern cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {/* Industry */}
                    {selectedPersonaDetails?.industry && (
                        <Card className="group relative overflow-hidden border border-yellow-200 bg-yellow-50 hover:border-yellow-300 transition-all duration-200">
                          <CardContent className="relative p-3">
                            <div className="flex items-start gap-2.5">
                              <div className="p-1.5 rounded-lg bg-yellow-100 flex-shrink-0">
                                <Factory className="h-4 w-4 text-black" />
                      </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-[9px] font-semibold text-black/60 uppercase tracking-wider mb-1">Industry</p>
                                <p className="font-semibold text-sm leading-snug text-black break-words">{formatText(selectedPersonaDetails?.industry?.name)}</p>
                      </div>
                            </div>
                          </CardContent>
                        </Card>
                    )}

                    {/* Geography */}
                    {selectedPersonaDetails?.geography && (
                        <Card className="group relative overflow-hidden border border-yellow-200 bg-yellow-50 hover:border-yellow-300 transition-all duration-200">
                          <CardContent className="relative p-3">
                            <div className="flex items-start gap-2.5">
                              <div className="p-1.5 rounded-lg bg-yellow-100 flex-shrink-0">
                                <MapPin className="h-4 w-4 text-black" />
                      </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-[9px] font-semibold text-black/60 uppercase tracking-wider mb-1">Geography</p>
                                <p className="font-semibold text-sm leading-snug text-black break-words">{formatText(selectedPersonaDetails?.geography)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                    )}

                    {/* Plant Size Impact */}
                    {selectedPersonaDetails?.plant_size_impact && (
                        <Card className="group relative overflow-hidden border border-yellow-200 bg-yellow-50 hover:border-yellow-300 transition-all duration-200">
                          <CardContent className="relative p-3">
                            <div className="flex items-start gap-2.5">
                              <div className="p-1.5 rounded-lg bg-yellow-100 flex-shrink-0">
                                <Building2 className="h-4 w-4 text-black" />
                      </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-[9px] font-semibold text-black/60 uppercase tracking-wider mb-1">Plant Size</p>
                                <p className="font-semibold text-sm leading-snug text-black break-words">{formatText(selectedPersonaDetails?.plant_size_impact?.name)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                    )}

                    {/* Manufacturing Model */}
                    {selectedPersonaDetails?.manufacturing_model && (
                        <Card className="group relative overflow-hidden border border-yellow-200 bg-yellow-50 hover:border-yellow-300 transition-all duration-200">
                          <CardContent className="relative p-3">
                            <div className="flex items-start gap-2.5">
                              <div className="p-1.5 rounded-lg bg-yellow-100 flex-shrink-0">
                                <Factory className="h-4 w-4 text-black" />
                      </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-[9px] font-semibold text-black/60 uppercase tracking-wider mb-1">Manufacturing Model</p>
                                <p className="font-semibold text-sm leading-snug text-black break-words">{formatText(selectedPersonaDetails?.manufacturing_model?.name)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                    )}

                    {/* Company Size */}
                    {selectedPersonaDetails?.company_size_new && (
                        <Card className="group relative overflow-hidden border border-yellow-200 bg-yellow-50 hover:border-yellow-300 transition-all duration-200">
                          <CardContent className="relative p-3">
                            <div className="flex items-start gap-2.5">
                              <div className="p-1.5 rounded-lg bg-yellow-100 flex-shrink-0">
                                <Building className="h-4 w-4 text-black" />
                      </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-[9px] font-semibold text-black/60 uppercase tracking-wider mb-1">Company Size</p>
                                <p className="font-semibold text-sm leading-snug text-black break-words">{formatText(selectedPersonaDetails?.company_size_new?.name)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                    )}
                  </div>

                    {/* Products Section */}
                  {selectedPersonaDetails?.persona_products && selectedPersonaDetails?.persona_products?.length > 0 && (
                      <Card className="relative overflow-hidden border border-yellow-200 bg-yellow-50 shadow-sm">
                        <CardHeader className="relative pb-2 border-b border-yellow-200">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-yellow-100">
                              <Package className="h-4 w-4 text-black" />
                            </div>
                            <CardTitle className="text-sm font-semibold tracking-tight text-black">Associated Products</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="relative pt-3">
                          <div className="flex flex-wrap gap-2">
                        {selectedPersonaDetails?.persona_products?.map((personaProduct: any, index: number) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="px-2 py-1 text-xs font-medium bg-yellow-100 text-black border-yellow-200 cursor-default break-words"
                              >
                                {formatText(personaProduct?.product?.name)}
                          </Badge>
                        ))}
                      </div>
                        </CardContent>
                      </Card>
                  )}
                </div>
              ) : (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center gap-3 animate-in fade-in-50 duration-500">
                      <div className="p-3 rounded-lg bg-yellow-100">
                        <Info className="h-6 w-6 text-black/60" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black mb-1">No persona details available</p>
                        <p className="text-xs text-black/70">Please try again later</p>
                      </div>
                    </div>
                </div>
              )}
              </div>
            </DialogContent>
          </Dialog>
        </div >
      );
    }

  } else {
    // meber details
    // Find the selected member's data
    let selectedMemberData: any = null;
    if (Array.isArray(data)) {
      for (const team of data) {
        if (team?.company_team_id === selectedTeam?.company_team_id && Array.isArray(team.members)) {
          selectedMemberData = team.members.find((member: any) => 
            member?.member_id === selectMember || String(member?.member_id) === String(selectMember)
          );
          if (selectedMemberData) break;
        }
      }
    }

    return (
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between gap-4 relative">
          <div className="w-full flex items-center justify-between gap-4">
            <div className="flex-1">
              {Array.isArray(data) && data.map((team, teamIdx) => (
                team?.company_team_id === selectedTeam?.company_team_id ?
                  <div key={`team-${teamIdx}`} className="space-y-2">
                    <span className="text-3xl font-bold tracking-tight">Team {team?.name}</span>
                    {selectedMemberData && (
                      <div className="flex flex-col">
                        <span className="text-xl font-semibold text-gray-700">
                          {selectedMemberData?.user?.first_name} {selectedMemberData?.user?.last_name}
                        </span>
                        <span className="text-base text-gray-500">{selectedMemberData?.user?.email}</span>
                      </div>
                    )}
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

        {/* User Performance Growth Chart - Shows performance across all modes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                User Performance Growth
              </CardTitle>
              <Badge className="!rounded-sm">
                <p className="text-sm">{moment().format("MMM Do YY")}</p>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingUserGraph ? (
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : userGrowthData.length > 0 ? (
              <>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowthData} margin={{ right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis domain={[0, 100]} className="text-muted-foreground" width={40} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-semibold mb-2">{label}</p>
                                {payload.map((entry: any, index: number) => {
                                  const modeName = entry.name;
                                  const score = entry.value;
                                  const sessionCount = entry.payload[`${entry.dataKey}_sessions`] || 0;
                                  
                                  return (
                                    <div key={index} className="flex items-center gap-2 mb-1">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: entry.color }}
                                      />
                                      <span className="text-sm">
                                        {modeName}: <span className="font-semibold">{score?.toFixed(1)}%</span>
                                        <span className="text-muted-foreground ml-1">({sessionCount} session{sessionCount !== 1 ? 's' : ''})</span>
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine 
                        y={70} 
                        stroke="#f59e0b" 
                        strokeDasharray="5 5" 
                        strokeWidth={2}
                        label={{ 
                          value: '70', 
                          position: 'left', 
                          fill: '#f59e0b', 
                          fontSize: 12, 
                          fontWeight: 600
                        }}
                      />
                      <ReferenceLine 
                        y={85} 
                        stroke="#22c55e" 
                        strokeDasharray="5 5" 
                        strokeWidth={2}
                        label={{ 
                          value: '85', 
                          position: 'left', 
                          fill: '#22c55e', 
                          fontSize: 12, 
                          fontWeight: 600
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        content={() => (
                          <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-0.5 border-t-2 border-dashed" style={{ borderColor: '#f59e0b' }}></div>
                              <span className="text-sm font-medium" style={{ color: '#f59e0b' }}>Sufficiency</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-0.5 border-t-2 border-dashed" style={{ borderColor: '#22c55e' }}></div>
                              <span className="text-sm font-medium" style={{ color: '#22c55e' }}>Proficiency</span>
                            </div>
                          </div>
                        )}
                      />
                      <Line
                        type="monotone"
                        dataKey="prospecting"
                        name="Prospecting"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (payload.prospecting === null || payload.prospecting === undefined) return null;
                          return <circle key={`dot-prospecting-${payload.month}`} cx={cx} cy={cy} r={6} fill="#f59e0b" stroke="#f59e0b" strokeWidth={2} />;
                        }}
                        activeDot={{ r: 8, stroke: '#f59e0b', strokeWidth: 2 }}
                        connectNulls={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="discovering"
                        name="Discovering"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (payload.discovering === null || payload.discovering === undefined) return null;
                          return <circle key={`dot-discovering-${payload.month}`} cx={cx} cy={cy} r={6} fill="#22c55e" stroke="#22c55e" strokeWidth={2} />;
                        }}
                        activeDot={{ r: 8, stroke: '#22c55e', strokeWidth: 2 }}
                        connectNulls={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="closing"
                        name="Closing"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (payload.closing === null || payload.closing === undefined) return null;
                          return <circle key={`dot-closing-${payload.month}`} cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#ef4444" strokeWidth={2} />;
                        }}
                        activeDot={{ r: 8, stroke: '#ef4444', strokeWidth: 2 }}
                        connectNulls={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Mode Legend */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex flex-wrap gap-4 justify-center items-center">
                    <div className="flex items-center gap-2 cursor-pointer">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: '#f59e0b' }}
                      />
                      <span className="text-sm font-medium">Prospecting</span>
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: '#22c55e' }}
                      />
                      <span className="text-sm font-medium">Discovering</span>
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: '#ef4444' }}
                      />
                      <span className="text-sm font-medium">Closing</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No performance data available yet</p>
                  <p className="text-sm">Complete sessions across different modes to see growth</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="grid gap-6 lg:grid-cols-1">
          {/* Skill Breakdown by Modes as Accordion */}
          <div className="w-full">
            {Array.isArray(data) && data.map((team, teamIdx) => (
              team?.company_team_id === selectedTeam?.company_team_id ?
                <div key={`team-${teamIdx}`}>
                  <CardHeader className="pb-4">
                    <span className="font-semibold text-lg">Performance by Mode</span>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="shadow-none border-none">
                      <div className="space-y-6 p-0">

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
                                                    {/* Performance by Mode (Accordion) */}
                                    {Array.isArray(member?.performance_by_mode) && (
                                                      <Accordion type="single" collapsible defaultValue={`mode-0`} className="w-full">
                                        {member.performance_by_mode.map((mode, modeIdx) => {
                                          const sessionCount = mode?.session_count || 0;
                                          const overallScore = mode?.average_overall_score ?? 0;
                                          
                                                          return (
                                                            <AccordionItem key={modeIdx} value={`mode-${modeIdx}`}>
                                                              <AccordionTrigger className="hover:no-underline group [&>svg]:hidden">
                                                                <div className="flex justify-between items-center w-full pr-4">
                                                                  <div className="flex flex-col items-start">
                                                                    <span className="text-base font-medium capitalize">{mode?.mode_name}</span>
                                                                    <span className="text-sm font-semibold text-gray-700">
                                                                      Overall Score: {(overallScore).toFixed(1)}/100
                                                                    </span>
                                                                  </div>
                                                                  <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-gray-600">{sessionCount} sessions</span>
                                                                    <div className="w-6 h-6 rounded bg-[#FFDE5A] flex items-center justify-center shrink-0">
                                                                      <Plus className="h-4 w-4 text-black group-data-[state=open]:hidden" />
                                                                      <Minus className="h-4 w-4 text-black hidden group-data-[state=open]:block" />
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </AccordionTrigger>
                                                              <AccordionContent>
                                                                <div className="pt-2 pb-4">
                                                {sessionCount === 0 ? (
                                                  <div className="text-center py-6 text-muted-foreground">
                                                    <span className="text-base">No Sessions Completed</span>
                                                  </div>
                                                ) : (
                                                  <>
                                                                      {/* Individual Skills - Show in correct order based on mode */}
                                                    <div className="space-y-3 ml-2">
                                                                        {(() => {
                                                                          const modeName = mode?.mode_name?.toLowerCase() || '';
                                                                          const metrics: Array<{ key: string; label: string; value: number | null }> = [];

                                                                          // Define metrics based on mode
                                                                          if (modeName === 'prospecting') {
                                                                            // Prospecting order
                                                                            if (mode?.average_qualifying_lead !== null && mode?.average_qualifying_lead !== undefined) {
                                                                              metrics.push({ key: 'qualifying_lead', label: 'Qualifying Lead', value: mode.average_qualifying_lead });
                                                                            }
                                                                            if (mode?.average_relationship_building !== null && mode?.average_relationship_building !== undefined) {
                                                                              metrics.push({ key: 'relationship_building', label: 'Relationship Building', value: mode.average_relationship_building });
                                                                            }
                                                                            if (mode?.average_communication_excellence !== null && mode?.average_communication_excellence !== undefined) {
                                                                              metrics.push({ key: 'communication_excellence', label: 'Communication Excellence', value: mode.average_communication_excellence });
                                                                            }
                                                                            if (mode?.average_needs_discovery !== null && mode?.average_needs_discovery !== undefined) {
                                                                              metrics.push({ key: 'needs_discovery', label: 'Discovery', value: mode.average_needs_discovery });
                                                                            }
                                                                            if (mode?.average_solution_matching !== null && mode?.average_solution_matching !== undefined) {
                                                                              metrics.push({ key: 'solution_matching', label: 'Solution Matching', value: mode.average_solution_matching });
                                                                            }
                                                                            if (mode?.average_objection_handling_and_value_selling !== null && mode?.average_objection_handling_and_value_selling !== undefined) {
                                                                              metrics.push({ key: 'objection_handling_and_value_selling', label: 'Objection Handling & Value Selling', value: mode.average_objection_handling_and_value_selling });
                                                                            }
                                                                            if (mode?.average_negotiation !== null && mode?.average_negotiation !== undefined) {
                                                                              metrics.push({ key: 'negotiation', label: 'Negotiation', value: mode.average_negotiation });
                                                                            }
                                                                          } else if (modeName === 'discovering' || modeName === 'discovery') {
                                                                            // Discovering order
                                                                            // Always show cross_selling for discovering mode first (even if null, show as 0)
                                                                            metrics.push({ key: 'cross_selling', label: 'Cross Selling', value: mode?.average_cross_selling ?? 0 });
                                                                            if (mode?.average_relationship_building !== null && mode?.average_relationship_building !== undefined) {
                                                                              metrics.push({ key: 'relationship_building', label: 'Relationship Building', value: mode.average_relationship_building });
                                                                            }
                                                                            if (mode?.average_communication_excellence !== null && mode?.average_communication_excellence !== undefined) {
                                                                              metrics.push({ key: 'communication_excellence', label: 'Communication Excellence', value: mode.average_communication_excellence });
                                                                            }
                                                                            if (mode?.average_needs_discovery !== null && mode?.average_needs_discovery !== undefined) {
                                                                              metrics.push({ key: 'needs_discovery', label: 'Discovery', value: mode.average_needs_discovery });
                                                                            }
                                                                            if (mode?.average_solution_matching !== null && mode?.average_solution_matching !== undefined) {
                                                                              metrics.push({ key: 'solution_matching', label: 'Solution Matching', value: mode.average_solution_matching });
                                                                            }
                                                                            if (mode?.average_objection_handling_and_value_selling !== null && mode?.average_objection_handling_and_value_selling !== undefined) {
                                                                              metrics.push({ key: 'objection_handling_and_value_selling', label: 'Objection Handling & Value Selling', value: mode.average_objection_handling_and_value_selling });
                                                                            }
                                                                            if (mode?.average_negotiation !== null && mode?.average_negotiation !== undefined) {
                                                                              metrics.push({ key: 'negotiation', label: 'Negotiation', value: mode.average_negotiation });
                                                                            }
                                                                          } else if (modeName === 'closing') {
                                                                            // Closing order
                                                                            if (mode?.average_sales_closing !== null && mode?.average_sales_closing !== undefined) {
                                                                              metrics.push({ key: 'sales_closing', label: 'Sales Closing', value: mode.average_sales_closing });
                                                                            }
                                                                            if (mode?.average_relationship_building !== null && mode?.average_relationship_building !== undefined) {
                                                                              metrics.push({ key: 'relationship_building', label: 'Relationship Building', value: mode.average_relationship_building });
                                                                            }
                                                                            if (mode?.average_communication_excellence !== null && mode?.average_communication_excellence !== undefined) {
                                                                              metrics.push({ key: 'communication_excellence', label: 'Communication Excellence', value: mode.average_communication_excellence });
                                                                            }
                                                                            if (mode?.average_needs_discovery !== null && mode?.average_needs_discovery !== undefined) {
                                                                              metrics.push({ key: 'needs_discovery', label: 'Discovery', value: mode.average_needs_discovery });
                                                                            }
                                                                            if (mode?.average_solution_matching !== null && mode?.average_solution_matching !== undefined) {
                                                                              metrics.push({ key: 'solution_matching', label: 'Solution Matching', value: mode.average_solution_matching });
                                                                            }
                                                                            if (mode?.average_objection_handling_and_value_selling !== null && mode?.average_objection_handling_and_value_selling !== undefined) {
                                                                              metrics.push({ key: 'objection_handling_and_value_selling', label: 'Objection Handling & Value Selling', value: mode.average_objection_handling_and_value_selling });
                                                                            }
                                                                            if (mode?.average_negotiation !== null && mode?.average_negotiation !== undefined) {
                                                                              metrics.push({ key: 'negotiation', label: 'Negotiation', value: mode.average_negotiation });
                                                                            }
                                                                          }

                                                                          return metrics.map((metric) => {
                                                                            const skillInfo = skillDescriptions[metric.key];
                                                                            return (
                                                                              <div key={metric.key} className="space-y-2">
                                                                                <div className="flex justify-between items-center gap-2">
                                                                                  <div className="flex items-center gap-2 flex-1">
                                                                                    <span className="text-sm">{metric.label}</span>
                                                                                    {skillInfo && (
                                                                                      <Popover>
                                                                                        <PopoverTrigger asChild>
                                                                                          <button
                                                                                            type="button"
                                                                                            className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                          >
                                                                                            <Info className="w-3 h-3 text-gray-600" />
                                                                                          </button>
                                                                                        </PopoverTrigger>
                                                                                        <PopoverContent className="w-[500px] max-h-96 overflow-y-auto" align="start">
                                                                                          <div className="space-y-3">
                                                                                            <h4 className="font-semibold text-base">{skillInfo.title}</h4>
                                                                                            <p className="text-sm text-gray-700 leading-relaxed">{skillInfo.description}</p>
                                                                                            <div>
                                                                                              <h5 className="font-medium text-sm mb-2">Key Evaluation Areas:</h5>
                                                                                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                                                                                {skillInfo.keyAreas.map((area, idx) => (
                                                                                                  <li key={idx}>{area}</li>
                                                                                                ))}
                                                                                              </ul>
                                                        </div>
                                                      </div>
                                                                                        </PopoverContent>
                                                                                      </Popover>
                                                                                    )}
                                                        </div>
                                                                                  <span className="text-sm text-black flex-shrink-0">{(metric.value ?? 0).toFixed(1)}/100</span>
                                                      </div>
                                                                                <Progress value={metric.value ?? 0} className="h-2" />
                                                        </div>
                                                                            );
                                                                          });
                                                                        })()}
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                                              </AccordionContent>
                                                            </AccordionItem>
                                          );
                                        })}
                                                      </Accordion>
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
                      <p className="text-sm text-muted-foreground">
                        {(() => {
                          const company = companiesData?.find((v: any) => v?.sales_company_id === team?.sales_company_id);
                          return company?.name || '';
                        })()}
                      </p>
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