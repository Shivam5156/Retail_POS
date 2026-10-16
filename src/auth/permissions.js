export const ROLES = {
  OWNER: "OWNER",
  STAFF: "STAFF",
  GROWW_YOU_ADMIN: "GROWW_YOU_ADMIN",
  MARKETING_TEAM: "MARKETING_TEAM",
};

export const PERMISSIONS = {
  DASHBOARD: "dashboard",
  BILLING: "billing",
  DISCOUNTS: "discounts",
  RETURNS: "returns",

  INVENTORY_VIEW: "inventory.view",
  INVENTORY_EDIT: "inventory.edit",
  STOCK_ADJUSTMENT: "inventory.stockAdjustment",
  BULK_UPLOAD: "inventory.bulkUpload",

  PURCHASES: "purchases",
  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_ADD: "customers.add",

  STAFF_MANAGEMENT: "staff.management",
  STAFF_ACTIVITY: "staff.activity",

  OWNER_DASHBOARD: "owner.dashboard",
  REAL_TIME_CONTROL: "owner.realTimeControl",
  OWNER_REPORTS: "owner.reports",
  ALERTS: "owner.alerts",
  BUSINESS_ANALYSIS: "owner.businessAnalysis",

  GROWTH_TOOLS: "growth.tools",
  MARKETING_CAMPAIGNS: "growth.campaigns",

  SHOP_SETTINGS: "shop.settings",
  SUBSCRIPTION_VIEW: "shop.subscription.view",

  PLANS_MANAGEMENT: "admin.plans",
  ADDONS_MANAGEMENT: "admin.addons",
  MASTER_DATA: "admin.masterData",
  SHOP_SUPPORT_VIEW: "admin.shopSupportView",
};

// Default permissions defined from the SRS matrix.
// Staff-specific permissions can later be configured by the Owner.
export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: Object.values(PERMISSIONS).filter(
    (permission) =>
      ![
        PERMISSIONS.PLANS_MANAGEMENT,
        PERMISSIONS.ADDONS_MANAGEMENT,
        PERMISSIONS.MASTER_DATA,
      ].includes(permission)
  ),

  [ROLES.STAFF]: [
    PERMISSIONS.BILLING,
    PERMISSIONS.DISCOUNTS,
    PERMISSIONS.RETURNS,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_ADD,
  ],

  [ROLES.GROWW_YOU_ADMIN]: [
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.SHOP_SUPPORT_VIEW,
    PERMISSIONS.SUBSCRIPTION_VIEW,
    PERMISSIONS.PLANS_MANAGEMENT,
    PERMISSIONS.ADDONS_MANAGEMENT,
    PERMISSIONS.MASTER_DATA,
  ],

  [ROLES.MARKETING_TEAM]: [
    PERMISSIONS.GROWTH_TOOLS,
    PERMISSIONS.MARKETING_CAMPAIGNS,
  ],
};

export const hasPermission = (user, permission) => {
  if (!user || !permission) return false;

  // Owner gets shop-level permissions, not platform admin permissions.
  if (user.role === ROLES.OWNER) {
    return ROLE_PERMISSIONS[ROLES.OWNER].includes(permission);
  }

  // Owner-configured permissions for individual staff members.
  if (user.role === ROLES.STAFF) {
    const permissions =
      user.permissions ?? ROLE_PERMISSIONS[ROLES.STAFF];

    return permissions.includes(permission);
  }

  return (
    ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false
  );
};

export const hasAnyPermission = (user, permissions = []) =>
  permissions.some((permission) => hasPermission(user, permission));

export const hasAllPermissions = (user, permissions = []) =>
  permissions.every((permission) => hasPermission(user, permission));