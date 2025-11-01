import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Profile } from "@/components/dashboard/Profile";
import Overview from "./Overview";
import { Sessions } from "@/components/dashboard/Sessions";
import { Performance } from "@/components/dashboard/Performance";
import { ModesUsed } from "@/components/dashboard/ModesUsed";
import { Personas } from "@/components/dashboard/Personas";
import { ManagerProfile } from "@/components/dashboard/ManagerProfile";
import { Company } from "@/components/dashboard/Company";
import { Teams } from "@/components/dashboard/Teams";
import Subscription from "@/components/dashboard/Subscription";
import { SubscriptionGuard } from "@/components/SubscriptionGuard";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/header";

export default function Dashboard() {
  const [userRole, setUserRole] = useState<"sales-rep" | "sales-manager">("sales-rep");

  return (
    <SidebarProvider>
      {/* Dashboard background: only dotted frame, covers entire viewport */}
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Dotted frame as full-page background */}
        <div className="fixed inset-0 -z-20 bg-cover bg-center w-screen h-screen" style={{ backgroundImage: 'url("/AISALES-DOTTED-BG-FRAME.png")', opacity: 0.4 }} />
        <div className="flex w-full">
            <div className="fixed w-full top-0 z-50">
              <Header />
            </div>
          <DashboardSidebar userRole={userRole} onRoleChange={setUserRole} />
          
          <div className="flex-1 flex flex-col">
            {/* Header: sticky, shadow, improved spacing, user avatar */}
            {/* <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/90 shadow-sm">
              <div className="flex h-16 items-center px-8">
                <SidebarTrigger />
                <div className="flex items-center gap-4 ml-auto">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  </Button>
                  <a href={userRole === 'sales-rep' ? '/profile' : '/manager/profile'}>
                    <Button variant="default" size="sm" className="flex items-center gap-2 bg-primary text-black hover:bg-primary/90">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
                      <span className="hidden md:inline">Home</span>
                    </Button>
                  </a>
                </div>
              </div>
            </header> */}

            {/* Main Content */}
            <main className="flex-1 overflow-auto mt-16">
              <Routes>
                {/* Overview Landing Page */}
                <Route path="/overview" element={<Overview />} />
                {/* Sales Representative Routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/sessions" element={<Sessions />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/modes" element={<ModesUsed />} />
                <Route path="/personas" element={<Personas />} />
                {/* Sales Manager Routes */}
                <Route path="/manager/profile" element={<ManagerProfile />} />
                <Route path="/manager/company" element={
                  <SubscriptionGuard requiredPlan="manager" feature="Company management">
                    <Company />
                  </SubscriptionGuard>
                } />
                <Route path="/manager/teams" element={
                  <SubscriptionGuard requiredPlan="manager" feature="Team management">
                    <Teams />
                  </SubscriptionGuard>
                } />
                {/* Subscription Route */}
                <Route path="/subscription" element={<Subscription />} />
                {/* Default Route */}
                <Route 
                  path="/" 
                  element={<Navigate to="/overview" replace />} 
                />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}