import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { UpgradePrompt } from "./UpgradePrompt";
import { RootState, UserData } from "../types";

interface SubscriptionGuardProps {
  children: ReactNode;
  requiredPlan?: "free" | "starter" | "manager" | "enterprise";
  feature?: string;
}

export const SubscriptionGuard = ({ 
  children, 
  requiredPlan = "manager",
  feature = "this feature"
}: SubscriptionGuardProps) => {
  const user = useSelector((state: RootState) => state?.auth?.user) as UserData;
  
  // Safety check for user data
  if (!user || !user.user_id) {
    return <div>Loading...</div>;
  }
  
  // Get the active subscription from user data
  const activeSubscription = user?.user_subscriptions?.find(
    (sub) => sub.status_active === true
  );
  
  const hasRequiredSubscription = () => {
    if (!activeSubscription) return false;
    
    const planType = activeSubscription.subscription?.plan_type;
    if (!planType) return false;
    
    // Define plan hierarchy (higher plans include lower plan features)
    const planHierarchy = {
      "free": 0,
      "starter": 1,
      "manager": 2,
      "enterprise": 3
    };
    
    const userPlanLevel = planHierarchy[planType as keyof typeof planHierarchy] || 0;
    const requiredPlanLevel = planHierarchy[requiredPlan] || 0;
    
    return userPlanLevel >= requiredPlanLevel;
  };

  if (!hasRequiredSubscription()) {
    return (
      <UpgradePrompt 
        feature={feature}
        requiredPlan={requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
      />
    );
  }

  return <>{children}</>;
};
