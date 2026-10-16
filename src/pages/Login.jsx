
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Store,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ArrowRight,
  UserPlus,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { ROLES } from "../auth/permissions";

const ROLE_DESTINATIONS = {
  [ROLES.OWNER]: "/dashboard",
  [ROLES.STAFF]: "/billing",
  [ROLES.GROWW_YOU_ADMIN]: "/admin",
  [ROLES.MARKETING_TEAM]: "/growth",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      // AuthContext must identify the role from the authenticated account.
      const result = await Promise.resolve(
        login(normalizedEmail, password)
      );

      if (!result?.success) {
        setError(result?.message || "Invalid email or password.");
        return;
      }

      const authenticatedRole = result.user?.role;
      const destination = ROLE_DESTINATIONS[authenticatedRole];

      if (!destination) {
        setError(
          "Your account role is not configured. Please contact the administrator."
        );
        return;
      }

      navigate(destination, { replace: true });
    } catch (loginError) {
      console.error("Login error:", loginError);
      setError("Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2">
        {/* Branding panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500">
              <Store size={26} />
            </div>

            <div>
              <h1 className="text-xl font-bold">Groww You</h1>
              <p className="text-xs text-slate-400">
                Retail POS Platform
              </p>
            </div>
          </div>

          <div className="relative py-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Retail made simpler
            </p>

            <h2 className="mt-4 text-4xl font-bold leading-tight">
              Manage your shop.
              <span className="block text-emerald-400">
                Grow your business.
              </span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              Manage billing, inventory, customers, staff and shop
              operations from one platform with role-based access.
            </p>
          </div>

          <p className="relative text-xs text-slate-500">
            © {new Date().getFullYear()} Groww You
          </p>
        </section>

        {/* Login form */}
        <main className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <Store size={25} />
              </div>

              <h1 className="text-xl font-bold text-slate-900">
                Groww You
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Retail POS Platform
              </p>
            </div>

            <div className="mb-8">
              <p className="text-sm font-semibold text-emerald-600">
                SECURE ACCOUNT LOGIN
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in with your registered email and password.
                Your account permissions determine which pages you can access.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Owner registration only */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">
                NEW TO GROWW YOU?
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              to="/register"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <UserPlus size={18} />
              Create Owner Account
            </Link>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              Staff and platform team accounts must be created through
              their authorized account-management process.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
