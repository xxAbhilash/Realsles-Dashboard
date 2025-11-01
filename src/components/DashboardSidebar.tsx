import { NavLink, useLocation } from "react-router-dom";
import {
  User,
  BarChart3,
  MessageSquare,
  Target,
  Users,
  Building2,
  LayoutDashboard,
  CreditCard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useDispatch } from "react-redux";
import { AddUser } from "@/redux/AuthReducer";
import { apis } from "@/utils/apis";
import { RootState, UserData } from "../types";

const salesRepItems = [
  { title: "Overview", url: "/overview", icon: LayoutDashboard },
  { title: "Subscription", url: "/subscription", icon: CreditCard },
  // { title: "Profile", url: "/profile", icon: User },
  { title: "Sessions", url: "/sessions", icon: MessageSquare },
  { title: "Performance", url: "/performance", icon: BarChart3 },
  { title: "Modes Used", url: "/modes", icon: Target },
  { title: "Personas Used", url: "/personas", icon: Users },
];

const getSalesManagerItems = (user: UserData) => {
  const baseItems = [
    { title: "Overview", url: "/overview", icon: LayoutDashboard },
    { title: "Subscription", url: "/subscription", icon: CreditCard },
    // { title: "Profile", url: "/manager/profile", icon: User },
    { title: "Sessions", url: "/sessions", icon: MessageSquare },
    { title: "Performance", url: "/performance", icon: BarChart3 },
    { title: "Modes Used", url: "/modes", icon: Target },
    { title: "Personas Used", url: "/personas", icon: Users },
    { title: "Company", url: "/manager/company", icon: Building2 },
    { title: "Teams", url: "/manager/teams", icon: Users }
  ];

  return baseItems;
};

interface DashboardSidebarProps {
  userRole: "sales-rep" | "sales-manager";
  onRoleChange: (role: "sales-rep" | "sales-manager") => void;
}

export function DashboardSidebar({ userRole, onRoleChange }: DashboardSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const { auth_me } = apis;
  const { Get } = useApi();
  const dispatch = useDispatch();

  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-base ${isActive
      ? "bg-primary/90 text-black font-semibold shadow border-l-4 border-primary"
      : "text-muted-foreground hover:bg-primary/20 hover:text-black"
    }`;

  const getInitialUser = (): UserData => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : {} as UserData;
    } catch {
      return {} as UserData;
    }
  };
  const [user, setUser] = useState<UserData>(getInitialUser());
  const [openProfile, setOpenProfile]: any = useState<Boolean>(false)

  // Calculate items based on user role and subscription
  const items = userRole === "sales-rep" ? salesRepItems : getSalesManagerItems(user || {} as UserData);

  useEffect(() => {
    if (user?.role?.name === "sales_person") {
      onRoleChange("sales-rep")
    } else {
      onRoleChange("sales-manager")
    }
  }, [user?.user_id])

  useEffect(() => {
    const getMe = async () => {
      let data = await Get(auth_me);
      if (data?.user_id) {
        setUser(data);
        // console.log(data, "__user____")
        dispatch(AddUser(data))
        localStorage.setItem("user", JSON.stringify(data));
      }
    };
    getMe();
  }, [])

  console.log(user, "user")

  return (
    <Sidebar className={`transition-all duration-300 ${collapsed ? "w-16" : "w-64"} bg-white border-r border-border shadow-sm`} collapsible="icon">
      <SidebarContent>
        {/* Logo and Role Switcher */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-6">
            {/* <img src="/Color logo - no background.png" alt="SalesAI Logo" className="w-10 h-10 object-contain" />
            {!collapsed && (
              <div>
                <h2 className="font-extrabold text-xl text-black tracking-tight">RealSales</h2>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            )} */}
            {/* <div className="w-10 h-10" /> */}
          </div>

          {/* {!collapsed && (
            <div className="space-y-2 mb-4">
              {user?.role?.name === "sales_person" ?
                <Button
                  variant={"default"}
                  size="sm"
                  className={`w-full justify-start cursor-default ring-2 ring-primary`}
                // onClick={() => onRoleChange("sales-rep")}
                >
                  Sales Rep
                </Button>
                :
                <Button
                  variant={"default"}
                  size="sm"
                  className={`w-full justify-start cursor-default ring-2 ring-primary`}
                // onClick={() => onRoleChange("sales-manager")}
                >
                  Sales Manager
                </Button>}
            </div>
          )} */}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 mb-2 text-lg font-medium text-[#060606]">
            {userRole === "sales-rep" ? "Sales Representative" : "Sales Manager"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.filter((v) => v?.title !== "Profile").map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.title === "Company" ? <hr className="mt-2 mb-3 border-b-[1px]" /> : null}
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-3 h-4 w-4 text-black" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <SidebarMenu className="flex flex-col justify-end mt-14">
              <SidebarMenuItem className="relative border border-solid shadow-md rounded-[10px] p-4 flex flex-col items-start gap-2">
                <div>
                  <p className="text-lg font-medium">Upgrade</p>
                  <p className="text-base leading-[100%]">Get Access upto 3 Personas</p>
                </div>
                <NavLink to={"https://www.real-sales.com/pricing"} className="border-b-[2px] border-dolid flex items-center justify-center gap-2 rounded hover:bg-[#FFDE5A] !border-[#FFDE5A] !bg-[#060606] !text-[#FFDE5A] !text-base !px-5 !py-2 h-fit" >upgrade your plan<svg width="19" height="15" fill="none" stroke="#FFDE5A">
                  <path stroke="#FFDE5A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m17.833 7.5-6.25-6.25m6.25 6.25-6.25 6.25m6.25-6.25H6.896m-5.73 0h2.605"></path>
                </svg>
                </NavLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        {!collapsed && (
          <div className="mt-auto p-4 border-t">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setOpenProfile(!openProfile)}>
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-black group-hover:underline">{user?.first_name}&nbsp;{user?.last_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {userRole === "sales-rep" ? "Sales Representative" : "Sales Manager"}
                  </p>
                </div>
                {/* Dropdown icon (chevron) */}
                <svg className={`${openProfile ? `rotate-180` : ``} w-4 h-4 text-muted-foreground group-hover:text-black`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {openProfile ? <>
                {items.filter((v) => v?.title === "Profile").map((item) => (
                  <div key={item.title} className="w-full">
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-3 h-4 w-4 text-black" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </div>
                ))}
              </> : null}
            </div>
            {/* TODO: Add dropdown menu for profile/settings/logout if needed */}
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}