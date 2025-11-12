import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Users, Plus, ChevronDown, Building2, TrendingUp, Calendar, User, BarChart3, Search, X, ArrowLeft, Check, Edit, Trash2, FileText, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { apis } from "@/utils/apis";
import { useApi } from "@/hooks/useApi";
import { useSelector } from "react-redux";
import { showToast } from "@/lib/toastConfig";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [selectedMemberForScenario, setSelectedMemberForScenario] = useState<any>(null);
  const [scenarioData, setScenarioData] = useState({
    mode: "",
    persona: ""
  });
  const [modesData, setModesData] = useState<any[]>([]);
  const [personasData, setPersonasData] = useState<any[]>([]);
  const [isAssigningScenario, setIsAssigningScenario] = useState(false);
  const [isPersonaDetailsOpen, setIsPersonaDetailsOpen] = useState(false);
  const [selectedPersonaDetails, setSelectedPersonaDetails] = useState<any>(null);
  const [loadingPersonaDetails, setLoadingPersonaDetails] = useState(false);

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
    } catch (error) {
      console.log(error, "_error_")
      showToast.error("Failed to delete team member");
    }
  }

  const handleGiveScenario = async (member: any) => {
    setSelectedMemberForScenario(member);
    setIsAssignScenarioDialogOpen(true);
    // Fetch modes and personas when dialog opens
    await fetchModesAndPersonas();
  }

  const fetchModesAndPersonas = async () => {
    try {
      // Fetch modes
      const modes = await Get(apis.interaction_modes);
      if (Array.isArray(modes)) {
        setModesData(modes);
      }

      // Fetch personas
      const personas = await Get(apis.ai_personas);
      if (Array.isArray(personas)) {
        setPersonasData(personas);
      }
    } catch (error) {
      console.error("Error fetching modes and personas:", error);
      showToast.error("Failed to load modes and personas");
    }
  }

  const handleAssignScenario = async () => {
    if (!scenarioData.mode || !scenarioData.persona) {
      showToast.error("Please select both mode and persona");
      return;
    }

    setIsAssigningScenario(true);
    try {
      // TODO: Implement the actual API call for assigning scenario
      // This will depend on your backend endpoint
      console.log("Assigning scenario:", {
        member: selectedMemberForScenario,
        mode: scenarioData.mode,
        persona: scenarioData.persona
      });

      showToast.success(`Scenario assigned to ${selectedMemberForScenario?.user?.first_name} ${selectedMemberForScenario?.user?.last_name}`);
      
      // Reset and close dialog
      setScenarioData({ mode: "", persona: "" });
      setIsAssignScenarioDialogOpen(false);
      setSelectedMemberForScenario(null);
    } catch (error) {
      console.error("Error assigning scenario:", error);
      showToast.error("Failed to assign scenario");
    } finally {
      setIsAssigningScenario(false);
    }
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
    fetchInteractionModes();
  }, [])

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
        
        // Handle different scenarios:
        // 1. If average_overall_score is a number (including 0), use it
        // 2. If average_overall_score is null/undefined but session_count exists and is 0, use 0
        // 3. If no monthly score entry exists for this month, use null
        if (monthlyScore) {
          if (typeof monthlyScore.average_overall_score === 'number') {
            // Use the actual score value (including 0)
            dataPoint[memberKey] = monthlyScore.average_overall_score;
          } else if (monthlyScore.session_count !== undefined && monthlyScore.session_count === 0) {
            // If session_count is 0, show 0 on the graph so line connects
            dataPoint[memberKey] = 0;
          } else {
            // If no score data available, use null (line will not connect)
            dataPoint[memberKey] = null;
          }
        } else {
          // No data point for this month - use null
          dataPoint[memberKey] = null;
        }
      });

      return dataPoint;
    });

    return chartData;
  };

  const growthData = prepareGrowthData();

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
                {teamMembers?.length ? teamMembers.map((member: any, index: number) => {
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
                    <div className="flex items-center gap-2">
                      <Button
                        title="Assign Scenario"
                        variant="outline"
                        size="sm"
                        className="text-black hover:text-black"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleGiveScenario(member); 
                        }}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
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
                }) : null}
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
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis domain={[0, 100]} className="text-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
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
                            
                            return (
                              <Line
                                key={member.member_id}
                                type="monotone"
                                dataKey={memberKey}
                                name={memberKey}
                                stroke={color}
                                strokeWidth={isSelected ? 4 : 3}
                                strokeOpacity={opacity}
                                dot={{ fill: color, strokeWidth: 2, r: isSelected ? 7 : 6, fillOpacity: opacity }}
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
              setScenarioData({ mode: "", persona: "" });
            }
          }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Scenario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedMemberForScenario && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Assigning scenario to:</p>
                    <p className="font-semibold text-lg">
                      {selectedMemberForScenario?.user?.first_name} {selectedMemberForScenario?.user?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedMemberForScenario?.user?.email}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="scenario-mode">Mode *</Label>
                  <Select
                    value={scenarioData.mode}
                    onValueChange={(value) => setScenarioData(prev => ({ ...prev, mode: value }))}
                  >
                    <SelectTrigger id="scenario-mode" className={!scenarioData.mode ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {modesData.map((mode) => (
                        <SelectItem key={mode?.mode_id || mode?.id} value={(mode?.mode_id || mode?.id).toString()}>
                          {mode?.name || mode?.mode_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scenario-persona">Persona *</Label>
                  <Select
                    value={scenarioData.persona}
                    onValueChange={(value) => setScenarioData(prev => ({ ...prev, persona: value }))}
                  >
                    <SelectTrigger id="scenario-persona" className={!scenarioData.persona ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select persona" />
                    </SelectTrigger>
                    <SelectContent>
                      {personasData.map((persona) => (
                        <div key={persona?.persona_id || persona?.id} className="relative group">
                          <SelectItem 
                            value={(persona?.persona_id || persona?.id).toString()}
                            className="pr-10"
                          >
                            {persona?.name || persona?.persona_name}
                          </SelectItem>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-black hover:text-black"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              fetchPersonaDetails(persona?.persona_id || persona?.id);
                            }}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleAssignScenario}
                  disabled={isAssigningScenario || !scenarioData.mode || !scenarioData.persona}
                >
                  {isAssigningScenario ? "Assigning..." : "Assign Scenario"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Persona Details Dialog */}
          <Dialog open={isPersonaDetailsOpen} onOpenChange={setIsPersonaDetailsOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Persona Details</DialogTitle>
              </DialogHeader>
              {loadingPersonaDetails ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading persona details...</div>
                </div>
              ) : selectedPersonaDetails ? (
                <div className="space-y-6">
                  {/* Profile Section */}
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={selectedPersonaDetails?.profile_pic} alt={selectedPersonaDetails?.name} />
                      <AvatarFallback className="text-xl">
                        {selectedPersonaDetails?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-bold">{selectedPersonaDetails?.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {selectedPersonaDetails?.gender}
                      </Badge>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Industry */}
                    {selectedPersonaDetails?.industry && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Industry</p>
                        <p className="font-semibold">{selectedPersonaDetails?.industry?.name}</p>
                      </div>
                    )}

                    {/* AI Role */}
                    {selectedPersonaDetails?.ai_role && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Role</p>
                        <p className="font-semibold">{selectedPersonaDetails?.ai_role?.name}</p>
                      </div>
                    )}

                    {/* Geography */}
                    {selectedPersonaDetails?.geography && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Geography</p>
                        <p className="font-semibold uppercase">{selectedPersonaDetails?.geography}</p>
                      </div>
                    )}

                    {/* Plant Size Impact */}
                    {selectedPersonaDetails?.plant_size_impact && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Plant Size</p>
                        <p className="font-semibold">{selectedPersonaDetails?.plant_size_impact?.name}</p>
                      </div>
                    )}

                    {/* Manufacturing Model */}
                    {selectedPersonaDetails?.manufacturing_model && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Manufacturing Model</p>
                        <p className="font-semibold">{selectedPersonaDetails?.manufacturing_model?.name}</p>
                      </div>
                    )}

                    {/* Company Size */}
                    {selectedPersonaDetails?.company_size_new && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Company Size</p>
                        <p className="font-semibold">{selectedPersonaDetails?.company_size_new?.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Products */}
                  {selectedPersonaDetails?.persona_products && selectedPersonaDetails?.persona_products?.length > 0 && (
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Products</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPersonaDetails?.persona_products?.map((personaProduct: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-sm">
                            {personaProduct?.product?.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No persona details available
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div >
      );
    }

  } else {
    // meber details
    return (
      <div className="p-6 space-y-8">
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
                  <CardHeader className="pb-4">
                    {/* <span className="font-semibold">Team Performance - {team?.name}</span> */}
                    {team.members.map((member, memberIdx) => (
                      member?.member_id === selectMember ?
                        <div key={memberIdx} className="space-y-2">
                          <div className="flex flex-col items-start w-full">
                            <span className="font-semibold text-xl text-gray-700">{member?.user?.first_name} {member?.user?.last_name}</span>
                            <span className="text-base text-gray-500">{member?.user?.email}</span>
                          </div>
                        </div> : null))}
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
                                                              <AccordionTrigger className="hover:no-underline">
                                                                <div className="flex justify-between items-center w-full pr-4">
                                                  <span className="text-base font-medium capitalize">{mode?.mode_name}</span>
                                                                  <span className="text-sm text-gray-600">{sessionCount} sessions</span>
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
                                                    {/* Mode Overall Score */}
                                                    <div className="space-y-2 mb-4">
                                                      <div className="flex justify-between items-center">
                                                                          <span className="text-sm font-medium">Overall Score</span>
                                                                          <span className="text-sm text-black font-bold">{overallScore.toFixed(1)}/100</span>
                                                      </div>
                                                      <Progress value={overallScore} className="h-2" />
                                                    </div>
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