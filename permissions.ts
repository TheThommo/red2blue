// User permissions and access control for subscription tiers
import type { ClientUser } from "@/hooks/useAuth";

export interface PermissionCheck {
  hasAccess: boolean;
  requiredTier: string;
  upgradeMessage: string;
}

// Free tier permissions - very limited access
const FREE_TIER_FEATURES = {
  // Assessments
  basicAssessment: true,
  advancedAssessments: false,
  assessmentHistory: false,
  
  // Chat/AI
  limitedChat: true, // 5 messages per day
  unlimitedChat: false,
  aiCoaching: false,
  personalizedRecommendations: false,
  
  // Content Access
  basicPDFs: true, // Master Your Moment, Ability to Focus, Mental Toughness
  allContent: false,
  
  // Tools & Features
  dashboard: false, // No full dashboard access
  techniques: false,
  scenarios: false,
  goals: false,
  progress: false,
  community: false,
  humanCoaching: false,
  
  // Analytics
  basicInsights: false,
  advancedAnalytics: false,
};

// Premium tier permissions
const PREMIUM_TIER_FEATURES = {
  // Everything free has plus:
  ...FREE_TIER_FEATURES,
  
  // Full access to core features
  dashboard: true,
  advancedAssessments: true,
  assessmentHistory: true,
  unlimitedChat: true,
  aiCoaching: true,
  personalizedRecommendations: true,
  allContent: true,
  techniques: true,
  scenarios: true,
  goals: true,
  progress: true,
  community: true,
  basicInsights: true,
  advancedAnalytics: true,
  
  // Still no human coaching
  humanCoaching: false,
};

// Ultimate tier permissions
const ULTIMATE_TIER_FEATURES = {
  // Everything premium has plus:
  ...PREMIUM_TIER_FEATURES,
  
  // Human coaching access
  humanCoaching: true,
};

export function checkFeatureAccess(
  user: ClientUser | null, 
  feature: keyof typeof FREE_TIER_FEATURES
): PermissionCheck {
  // Not logged in users get very limited access
  if (!user) {
    if (feature === 'limitedChat' || feature === 'basicPDFs') {
      return {
        hasAccess: true,
        requiredTier: "none",
        upgradeMessage: ""
      };
    }
    
    return {
      hasAccess: false,
      requiredTier: "free",
      upgradeMessage: "Please create a free account to access this feature."
    };
  }

  let permissions;
  switch (user.subscriptionTier) {
    case 'free':
      permissions = FREE_TIER_FEATURES;
      break;
    case 'premium':
      permissions = PREMIUM_TIER_FEATURES;
      break;
    case 'ultimate':
      permissions = ULTIMATE_TIER_FEATURES;
      break;
    default:
      permissions = FREE_TIER_FEATURES;
  }

  const hasAccess = permissions[feature];
  
  if (hasAccess) {
    return {
      hasAccess: true,
      requiredTier: user.subscriptionTier || "free",
      upgradeMessage: ""
    };
  }

  // Determine required tier for upgrade message
  let requiredTier = "premium";
  let upgradeMessage = "Upgrade to Premium ($490) for full access to all Red2Blue tools and techniques.";
  
  if (feature === 'humanCoaching') {
    requiredTier = "ultimate";
    upgradeMessage = "Upgrade to Ultimate ($2190) for human coaching access.";
  }

  return {
    hasAccess: false,
    requiredTier,
    upgradeMessage
  };
}

// Helper function to check if user can access the full dashboard
export function canAccessDashboard(user: ClientUser | null): boolean {
  return checkFeatureAccess(user, 'dashboard').hasAccess;
}

// Helper function to check if user can access unlimited chat
export function canAccessUnlimitedChat(user: ClientUser | null): boolean {
  return checkFeatureAccess(user, 'unlimitedChat').hasAccess;
}

// Helper function to get allowed features for a user
export function getAllowedFeatures(user: ClientUser | null): string[] {
  if (!user) {
    return ['limitedChat', 'basicPDFs'];
  }

  let permissions;
  switch (user.subscriptionTier) {
    case 'free':
      permissions = FREE_TIER_FEATURES;
      break;
    case 'premium':
      permissions = PREMIUM_TIER_FEATURES;
      break;
    case 'ultimate':
      permissions = ULTIMATE_TIER_FEATURES;
      break;
    default:
      permissions = FREE_TIER_FEATURES;
  }

  return Object.entries(permissions)
    .filter(([_, hasAccess]) => hasAccess)
    .map(([feature, _]) => feature);
}