import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, MessageSquare, BarChart, Target, Brain, Zap, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState, UserData } from "@/types";
import { useApi } from "@/hooks/useApi";
import { apis } from "@/utils/apis";

export default function Overview() {
  const location = useLocation();
  const { Post, Get } = useApi();
  const user = useSelector((state: RootState) => state.auth.user) as UserData;
  const [isRequestingTrial, setIsRequestingTrial] = useState(false);
  const [trialRequests, setTrialRequests] = useState<any[]>([]);
  const [personasCount, setPersonasCount] = useState<number>(0);

  
  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token");
  }, [location.search]);
  
  useEffect(() => {
    if (token !== null) {
      localStorage.setItem("token", token);
    }
  }, [token]);
  
  // Check if user has an active subscription
  const hasActiveSubscription = useMemo(() => {
    if (!user || !user.user_subscriptions || user.user_subscriptions.length === 0) {
      return false;
    }
    return user.user_subscriptions.some(
      (subscription) => subscription.status_active === true
    );
  }, [user]);
  
  // Get active subscription with credits info
  const activeSubscription = useMemo(() => {
    if (!user || !user.user_subscriptions || user.user_subscriptions.length === 0) {
      return null;
    }
    return user.user_subscriptions.find(
      (subscription) => subscription.status_active === true
    );
  }, [user]);
  
  // Check if user has credits remaining
  const hasCreditsRemaining = useMemo(() => {
    if (!activeSubscription) return false;
    return activeSubscription.credits_remaining > 0;
  }, [activeSubscription]);
  
  // Get the latest trial request
  const latestTrialRequest = useMemo(() => {
    if (trialRequests.length === 0) return null;
    // Assuming the API returns requests sorted by most recent
    return trialRequests[0];
  }, [trialRequests]);
  
  // Fetch trial requests
  const fetchTrialRequests = async () => {
    try {
      const response = await Get(apis.my_trial_requests);
      if (response) {
        setTrialRequests(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error("Error fetching trial requests:", error);
    }
  };
  
  // Fetch trial requests on component mount if user doesn't have active subscription
  useEffect(() => {
    if (user && user.user_id && !hasActiveSubscription) {
      fetchTrialRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hasActiveSubscription]);

  // Fetch personas count
  const fetchPersonasCount = async () => {
    try {
      const response = await Get(apis.ai_personas);
      if (response) {
        // Handle both array and object responses
        if (Array.isArray(response)) {
          setPersonasCount(response.length);
        } else if (response.count !== undefined) {
          setPersonasCount(response.count);
        } else if (response.results && Array.isArray(response.results)) {
          setPersonasCount(response.results.length);
        }
      }
    } catch (error) {
      console.error("Error fetching personas count:", error);
    }
  };

  // Fetch personas count on component mount
  useEffect(() => {
    fetchPersonasCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleStartSession = () => {
    window.location.href = "https://www.real-sales.com/about";
  };
  
  const handleRequestTrial = async () => {
    if (isRequestingTrial) return;
    
    setIsRequestingTrial(true);
    try {
      const requestData = {
        user_id: user.user_id,
        company_id: user.company_id
      };
      
      const response = await Post(apis.free_trial_requests, requestData);
      if (response) {
        // Fetch updated trial request status
        await fetchTrialRequests();
      }
    } catch (error) {
      console.error("Error requesting trial:", error);
    } finally {
      setIsRequestingTrial(false);
    }
  };
  
  const stats = useMemo(() => [
    { label: "Sales Performance", value: "55%", description: "Average improvement", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Active Users", value: "20+", description: "Worldwide", icon: <Users className="w-5 h-5" /> },
    { label: "AI Sessions", value: "1k+", description: "Completed", icon: <MessageSquare className="w-5 h-5" /> },
    { label: "Presona Availabe", value: personasCount > 0 ? personasCount.toString() : "Loading...", description: "Across all modes", icon: <BarChart className="w-5 h-5" /> }
  ], [personasCount]);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Smart Acceleration",
      description: "AI-powered personalized learning paths that adapt to individual performance patterns"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Real Scenarios",
      description: "Practice with industry-specific simulations based on actual sales interactions"
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Deep Analytics",
      description: "Comprehensive performance tracking with actionable insights and recommendations"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Feedback",
      description: "Real-time coaching with evidence-based improvement strategies"
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 z-0 bg-repeat w-full h-full"
        style={{ 
          backgroundImage: 'url("/AISALES-DOTTED-BG-FRAME.png")',
          backgroundSize: '30px 30px',
          backgroundPosition: 'center',
          opacity: 0.15
        }}
      />
      
      <div className="relative max-w-7xl mx-auto p-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Realsales AI Platform
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Advanced AI-driven sales acceleration platform designed to elevate team performance through personalized coaching and real-time analytics.
          </p>
        </div>

        {/* Stats Overview */}
        <Card className="border border-slate-200 shadow-sm backdrop-blur-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-yellow-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold text-slate-900">
                  Platform Overview
                </CardTitle>
                <CardDescription className="text-slate-600 mt-1">
                  Key metrics and performance indicators
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                Live Data
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-700">
                    {stat.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-yellow-700 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="font-medium text-slate-900">{stat.label}</div>
                    <div className="text-sm text-slate-500">{stat.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Section */}
        <Card className="border border-yellow-200 shadow-lg bg-gradient-to-r from-yellow-400 to-yellow-500 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                  Ready to Begin Your Sales Acceleration?
                </h2>
                <p className="text-slate-700 text-lg">
                  {hasActiveSubscription && !hasCreditsRemaining
                    ? "You have no credits remaining. You can request a free trial to continue."
                    : hasActiveSubscription || latestTrialRequest?.status?.toLowerCase() === 'approved'
                    ? "Start a personalized AI coaching session tailored to your sales objectives."
                    : latestTrialRequest?.status?.toLowerCase() === 'pending'
                    ? "Your trial request is being reviewed. We'll notify you once approved."
                    : "Do not have any active subscription? Request for a Trial."
                  }
                </p>
              </div>
              <Button 
                size="lg" 
                className="bg-slate-900 text-white hover:bg-slate-800 font-semibold px-8 py-3 shadow-lg border-2 border-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={
                  (hasActiveSubscription && hasCreditsRemaining) || latestTrialRequest?.status?.toLowerCase() === 'approved'
                    ? handleStartSession 
                    : handleRequestTrial
                }
                disabled={
                  (latestTrialRequest?.status?.toLowerCase() !== 'approved' && isRequestingTrial) ||
                  latestTrialRequest?.status?.toLowerCase() === 'pending'
                }
              >
                {latestTrialRequest?.status?.toLowerCase() === 'pending'
                  ? "Pending"
                  : (hasActiveSubscription && hasCreditsRemaining) || latestTrialRequest?.status?.toLowerCase() === 'approved'
                  ? "Start New Session"
                  : "Request Trial Session"
                }
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Platform Capabilities
            </h2>
            <p className="text-slate-600">
              Comprehensive tools designed for modern sales excellence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border border-slate-200 shadow-sm hover:shadow-md hover:border-yellow-300 transition-all duration-200 backdrop-blur-sm bg-white/95">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-700 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-slate-900">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="text-center py-8 border-t border-yellow-200">
          <p className="text-slate-500">
            Powered by advanced machine learning algorithms and natural language processing
          </p>
        </div>
      </div>
    </div>
  );
}
