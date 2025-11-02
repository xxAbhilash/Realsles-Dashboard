import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Users, Building2, ArrowRight, Check } from "lucide-react";

interface UpgradePromptProps {
  feature?: string;
  requiredPlan?: string;
}

export const UpgradePrompt = ({ 
  feature = "this feature", 
  requiredPlan = "Manager" 
}: UpgradePromptProps) => {
  const handleUpgrade = () => {
    // Open pricing page in new tab
    window.open('https://mainreal-sales.vercel.app/pricing', '_blank');
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Pattern - matching Overview page exactly */}
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
        {/* Header Section - matching Overview page */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Subscription Required
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Please buy the <span className="font-semibold text-yellow-600">manager or enterprise plan</span> to access this feature.
          </p>
        </div>

        {/* Main Card - matching Overview page structure */}
        <Card className="border border-slate-200 shadow-sm backdrop-blur-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-yellow-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold text-slate-900">
                  Premium Features
                </CardTitle>
                <CardDescription className="text-slate-600 mt-1">
                  Unlock advanced management capabilities
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                Premium Feature
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border border-slate-200 shadow-sm hover:shadow-md hover:border-yellow-300 transition-all duration-200 backdrop-blur-sm bg-white/95">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 flex-shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-slate-900">
                        Company Management
                      </h3>
                      <p className="text-slate-600">
                        Complete company dashboard and analytics for comprehensive business oversight
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm hover:shadow-md hover:border-yellow-300 transition-all duration-200 backdrop-blur-sm bg-white/95">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-700 flex-shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-slate-900">
                        Team Management
                      </h3>
                      <p className="text-slate-600">
                        Advanced team analytics and performance tracking for optimal team coordination
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm hover:shadow-md hover:border-yellow-300 transition-all duration-200 backdrop-blur-sm bg-white/95">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-700 flex-shrink-0">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-slate-900">
                        Advanced Reporting
                      </h3>
                      <p className="text-slate-600">
                        Comprehensive insights and detailed analytics for data-driven decisions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm hover:shadow-md hover:border-yellow-300 transition-all duration-200 backdrop-blur-sm bg-white/95">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 flex-shrink-0">
                      <Check className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-slate-900">
                        Priority Support
                      </h3>
                      <p className="text-slate-600">
                        Dedicated support and priority assistance for all your business needs
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Action Section - matching Overview page exactly */}
        <Card className="border border-yellow-200 shadow-lg bg-gradient-to-r from-yellow-400 to-yellow-500 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                  Ready to Upgrade?
                </h2>
                <p className="text-slate-700 text-lg">
                  Unlock powerful management features with our Manager or Enterprise plan.
                </p>
              </div>
              <Button 
                size="lg" 
                className="bg-slate-900 text-white hover:bg-slate-800 font-semibold px-8 py-3 shadow-lg border-2 border-slate-900"
                onClick={handleUpgrade}
              >
                View Pricing Plans
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
