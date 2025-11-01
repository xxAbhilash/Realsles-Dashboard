export const apis = {
  auth_me: "/v1/auth/me",
  sales_companies: "/v1/sales-companies/",
  company_teams: "/v1/company-teams/",
  company_teams_members: "/v1/company-teams-members/",
  by_user: "/v1/sessions/by-user/",
  interaction_modes: "/v1/interaction-modes/"
  ,ai_persona_by_id: "/v1/ai-personas/" // Usage: /v1/ai-personas/{persona_id}
  ,ai_personas: "/v1/ai-personas/" // Get all personas
  ,performance_manager_average_by_modes: "/v1/performance-reports/manager/" // Usage: /api/v1/performance-reports/manager/{manager_id}/average-by-modes
  ,performance_manager_monthly_trend: "/v1/performance-reports/manager/"
  ,free_trial_requests: "/v1/free-trial-requests/" // Request a free trial
  ,my_trial_requests: "/v1/free-trial-requests/my-requests" // Check trial request status
};
