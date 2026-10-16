
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ROLES,
  ROLE_PERMISSIONS,
  hasPermission,
} from "../auth/permissions";

const AuthContext = createContext(null);

const STAFF_STORAGE_KEY = "groww-you-demo-staff";
const SESSION_STORAGE_KEY = "groww-you-demo-session";
const OWNERS_STORAGE_KEY = "groww-you-demo-owners";
const SHOPS_STORAGE_KEY = "groww-you-demo-shops";

// Demo accounts for testing.
// Public registration always creates an Owner.
const DEMO_USERS = {
  OWNER: {
    id: "demo-owner-1",
    name: "Store Owner",
    email: "owner@growwyou.demo",
    password: "Owner@123",
    role: ROLES.OWNER,
    shopId: "demo-shop-1",
  },

  STAFF: {
    id: "demo-staff-1",
    name: "Store Staff",
    email: "staff@growwyou.demo",
    password: "Staff@123",
    role: ROLES.STAFF,
    shopId: "demo-shop-1",
  },

  GROWW_YOU_ADMIN: {
    id: "demo-admin-1",
    name: "Groww You Admin",
    email: "admin@growwyou.demo",
    password: "Admin@123",
    role: ROLES.GROWW_YOU_ADMIN,
  },

  MARKETING_TEAM: {
    id: "demo-marketing-1",
    name: "Marketing Team",
    email: "marketing@growwyou.demo",
    password: "Marketing@123",
    role: ROLES.MARKETING_TEAM,
    managedShopIds: ["demo-shop-1"],
  },
};

// --------------------------------------------------
// STORAGE HELPERS
// --------------------------------------------------

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readSession() {
  try {
    const value = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function saveSession(user) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

function safeDemoUser(user) {
  const { password: ignoredPassword, ...safeUser } = user;
  return safeUser;
}

// --------------------------------------------------
// STAFF PERMISSIONS
// --------------------------------------------------

function getStaffPermissions(staff) {
  const permissions = staff.permissions || {};

  const permissionMap = {
    billing: "billing",
    discounts: "discounts",
    returns: "returns",
    stock: "inventory.edit",
    purchases: "purchases",
    bulkUpload: "inventory.bulkUpload",
    customers: "customers.view",
  };

  return Object.entries(permissionMap)
    .filter(([key]) => permissions[key] === true)
    .map(([, permission]) => permission);
}

function buildStaffUser(staff) {
  return {
    id: String(staff.id),
    name: staff.name,
    email: String(staff.email || "").trim().toLowerCase(),
    role: ROLES.STAFF,
    staffRole: staff.role,
    shopId: staff.shopId || "demo-shop-1",
    permissions: getStaffPermissions(staff),
    staffAccountId: String(staff.id),
  };
}

// --------------------------------------------------
// OWNER HELPERS
// --------------------------------------------------

function findRegisteredOwnerById(ownerId) {
  return readArray(OWNERS_STORAGE_KEY).find(
    (owner) => String(owner.id) === String(ownerId)
  );
}

function buildRegisteredOwner(owner) {
  return {
    id: String(owner.id),
    name: owner.name,
    email: owner.email,
    phone: owner.phone,
    role: ROLES.OWNER,
    shopId: owner.shopId,
    registeredOwner: true,
  };
}

// --------------------------------------------------
// SESSION RESTORE
// --------------------------------------------------

function getStoredUser(session) {
  if (!session?.id || !session?.role) {
    return null;
  }

  // Restore Staff session from current staff record.
  if (session.staffAccountId) {
    const staff = readArray(STAFF_STORAGE_KEY).find(
      (item) => String(item.id) === String(session.staffAccountId)
    );

    if (!staff || staff.status !== "Active") {
      clearSession();
      return null;
    }

    return buildStaffUser(staff);
  }

  // Restore registered Owner session.
  if (session.registeredOwner) {
    const owner = findRegisteredOwnerById(session.id);

    if (!owner || owner.role !== ROLES.OWNER) {
      clearSession();
      return null;
    }

    return buildRegisteredOwner(owner);
  }

  // Restore only known demo accounts.
  const demoUser = Object.values(DEMO_USERS).find(
    (item) =>
      item.id === session.id &&
      item.role === session.role
  );

  if (!demoUser) {
    clearSession();
    return null;
  }

  return {
    ...safeDemoUser(demoUser),
    permissions:
      demoUser.role === ROLES.STAFF
        ? [...(ROLE_PERMISSIONS[ROLES.STAFF] || [])]
        : undefined,
  };
}

// --------------------------------------------------
// AUTH PROVIDER
// --------------------------------------------------

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser(readSession()));

  // ------------------------------------------------
  // OWNER REGISTRATION
  // ------------------------------------------------

  const registerOwner = useCallback((form) => {
    if (!form || typeof form !== "object") {
      return {
        success: false,
        message: "Invalid registration details.",
      };
    }

    const ownerName = String(form.ownerName || "").trim();
    const email = String(form.email || "").trim().toLowerCase();
    const phone = String(form.phone || "").replace(/\D/g, "");
    const password = String(form.password || "");
    const confirmPassword = String(form.confirmPassword || "");

    if (!ownerName || !email || !phone || !password) {
      return {
        success: false,
        message: "Please complete all required owner details.",
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        message: "Please enter a valid email address.",
      };
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return {
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      };
    }

    if (password.length < 8) {
      return {
        success: false,
        message: "Password must contain at least 8 characters.",
      };
    }

    if (password !== confirmPassword) {
      return {
        success: false,
        message: "Passwords do not match.",
      };
    }

    const shopName = String(form.shopName || "").trim();
    const address = String(form.address || "").trim();
    const city = String(form.city || "").trim();
    const state = String(form.state || "").trim();
    const pincode = String(form.pincode || "").trim();
    const gstin = String(form.gstin || "").trim().toUpperCase();

    if (
      !shopName ||
      !address ||
      !city ||
      !state ||
      !/^\d{6}$/.test(pincode)
    ) {
      return {
        success: false,
        message: "Please complete all required shop details.",
      };
    }

    if (gstin && !/^[0-9A-Z]{15}$/.test(gstin)) {
      return {
        success: false,
        message: "Please enter a valid GSTIN or leave it blank.",
      };
    }

    const owners = readArray(OWNERS_STORAGE_KEY);
    const shops = readArray(SHOPS_STORAGE_KEY);

    if (
      owners.some(
        (owner) =>
          String(owner.email || "").trim().toLowerCase() === email
      )
    ) {
      return {
        success: false,
        message: "This email is already registered. Please sign in.",
      };
    }

    if (
      owners.some(
        (owner) =>
          String(owner.phone || "").replace(/\D/g, "") === phone
      )
    ) {
      return {
        success: false,
        message: "This mobile number is already registered.",
      };
    }

    const now = new Date().toISOString();
    const uniqueId = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const ownerId = `OWNER-${uniqueId}`;
    const shopId = `SHOP-${uniqueId}`;

    const owner = {
      id: ownerId,
      name: ownerName,
      email,
      phone,
      // Demo only. Use server-side password hashing in production.
      password,
      role: ROLES.OWNER,
      shopId,
      createdAt: now,
    };

    const shop = {
      id: shopId,
      ownerId,
      name: shopName,
      businessType: String(
        form.businessType || "Garments & Footwear"
      ),
      address,
      city,
      state,
      pincode,
      gstin,
      createdAt: now,
    };

    try {
      localStorage.setItem(
        OWNERS_STORAGE_KEY,
        JSON.stringify([...owners, owner])
      );

      try {
        localStorage.setItem(
          SHOPS_STORAGE_KEY,
          JSON.stringify([...shops, shop])
        );
      } catch (error) {
        localStorage.setItem(
          OWNERS_STORAGE_KEY,
          JSON.stringify(owners)
        );
        throw error;
      }

      const loggedInUser = buildRegisteredOwner(owner);

      setUser(loggedInUser);
      saveSession(loggedInUser);

      return {
        success: true,
        user: loggedInUser,
      };
    } catch {
      return {
        success: false,
        message: "Unable to save registration in this browser.",
      };
    }
  }, []);

  // ------------------------------------------------
  // LOGIN: ROLE DETECTED FROM EMAIL
  // ------------------------------------------------

  const login = useCallback((email, password) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const enteredPassword = String(password || "");

    if (!normalizedEmail || !enteredPassword) {
      return {
        success: false,
        message: "Enter your email and password.",
      };
    }

    // 1. Check registered Staff accounts.
    const staff = readArray(STAFF_STORAGE_KEY).find(
      (item) =>
        String(item.email || "").trim().toLowerCase() ===
        normalizedEmail
    );

    if (staff) {
      if (staff.status !== "Active") {
        return {
          success: false,
          message: "This staff account is inactive. Contact the Owner.",
        };
      }

      if (!staff.password || staff.password !== enteredPassword) {
        return {
          success: false,
          message: "Invalid email or password.",
        };
      }

      const staffUser = buildStaffUser(staff);

      setUser(staffUser);
      saveSession(staffUser);

      return {
        success: true,
        user: staffUser,
      };
    }

    // 2. Check registered Owner accounts.
    const registeredOwner = readArray(OWNERS_STORAGE_KEY).find(
      (owner) =>
        String(owner.email || "").trim().toLowerCase() ===
        normalizedEmail
    );

    if (registeredOwner) {
      if (
        registeredOwner.role !== ROLES.OWNER ||
        registeredOwner.password !== enteredPassword
      ) {
        return {
          success: false,
          message: "Invalid email or password.",
        };
      }

      const ownerUser = buildRegisteredOwner(registeredOwner);

      setUser(ownerUser);
      saveSession(ownerUser);

      return {
        success: true,
        user: ownerUser,
      };
    }

    // 3. Check fixed demo accounts by email.
    const demoUser = Object.values(DEMO_USERS).find(
      (item) => item.email.toLowerCase() === normalizedEmail
    );

    if (!demoUser || demoUser.password !== enteredPassword) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    const loggedInUser = {
      ...safeDemoUser(demoUser),
      permissions:
        demoUser.role === ROLES.STAFF
          ? [...(ROLE_PERMISSIONS[ROLES.STAFF] || [])]
          : undefined,
    };

    setUser(loggedInUser);
    saveSession(loggedInUser);

    return {
      success: true,
      user: loggedInUser,
    };
  }, []);

  // ------------------------------------------------
  // LOGOUT
  // ------------------------------------------------

  const logout = useCallback(() => {
    setUser(null);
    clearSession();
  }, []);

  // ------------------------------------------------
  // REFRESH STAFF SESSION WHEN ACCOUNT CHANGES
  // ------------------------------------------------

  useEffect(() => {
    if (!user?.staffAccountId) return undefined;

    const refreshStaffSession = () => {
      const staff = readArray(STAFF_STORAGE_KEY).find(
        (item) => String(item.id) === String(user.staffAccountId)
      );

      if (!staff || staff.status !== "Active") {
        setUser(null);
        clearSession();
        return;
      }

      const updatedUser = buildStaffUser(staff);

      setUser(updatedUser);
      saveSession(updatedUser);
    };

    const handleStorage = (event) => {
      if (!event.key || event.key === STAFF_STORAGE_KEY) {
        refreshStaffSession();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshStaffSession);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshStaffSession);
    };
  }, [user?.staffAccountId]);

  // ------------------------------------------------
  // PERMISSIONS
  // ------------------------------------------------

  const can = useCallback(
    (permission) => hasPermission(user, permission),
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      registerOwner,
      can,
      roles: ROLES,
    }),
    [user, login, logout, registerOwner, can]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// --------------------------------------------------
// AUTH HOOK
// --------------------------------------------------

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
