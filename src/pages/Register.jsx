import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Store,
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  MapPin,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  ownerName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  shopName: "",
  businessType: "Garments & Footwear",
  address: "",
  city: "",
  state: "Madhya Pradesh",
  pincode: "",
  gstin: "",
};

const businessTypes = [
  "Garments & Footwear",
  "Grocery & General Store",
  "Electronics",
  "Mobile & Accessories",
  "Pharmacy",
  "Cosmetics & Beauty",
  "Furniture & Home Decor",
  "Other Retail Business",
];

export default function Register() {
  const navigate = useNavigate();
  const { registerOwner } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  }

  function validateOwner() {
    if (!form.ownerName.trim()) {
      return "Please enter the owner's full name.";
    }

    if (!form.email.trim()) {
      return "Please enter your email address.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }

    const phone = form.phone.replace(/\D/g, "");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return "Please enter a valid 10-digit Indian mobile number.";
    }

    if (form.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (form.password !== form.confirmPassword) {
      return "Password and confirm password do not match.";
    }

    return "";
  }

  function validateShop() {
    if (!form.shopName.trim()) {
      return "Please enter your shop name.";
    }

    if (!form.businessType) {
      return "Please select a business type.";
    }

    if (!form.address.trim()) {
      return "Please enter your shop address.";
    }

    if (!form.city.trim()) {
      return "Please enter your city.";
    }

    if (!form.state.trim()) {
      return "Please enter your state.";
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      return "Please enter a valid 6-digit PIN code.";
    }

    if (
      form.gstin.trim() &&
      !/^[0-9A-Z]{15}$/.test(form.gstin.trim().toUpperCase())
    ) {
      return "Please enter a valid 15-character GSTIN or leave it blank.";
    }

    return "";
  }

  function handleContinue(event) {
    event.preventDefault();

    const validationError = validateOwner();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setStep(2);
  }

  function handleBack() {
    setError("");
    setStep(1);
  }

  function handleRegister(event) {
    event.preventDefault();

    const ownerError = validateOwner();

    if (ownerError) {
      setStep(1);
      setError(ownerError);
      return;
    }

    const shopError = validateShop();

    if (shopError) {
      setError(shopError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const registrationData = {
        ...form,
        ownerName: form.ownerName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.replace(/\D/g, ""),
        shopName: form.shopName.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        gstin: form.gstin.trim().toUpperCase(),
      };

      const result = registerOwner(registrationData);

      if (!result?.success) {
        setError(
          result?.message || "Registration failed. Please try again."
        );
        return;
      }

      setForm(initialForm);
      navigate("/dashboard", { replace: true });
    } catch (registrationError) {
      console.error("Owner registration error:", registrationError);
      setError(
        "Unable to complete registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  function FieldIcon({ icon: Icon }) {
    return (
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon size={18} />
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left branding panel */}
        <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500">
              <Store size={25} className="text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Groww You
              </h1>
              <p className="text-xs text-slate-400">
                Retail POS Platform
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium text-emerald-300">
              <CheckCircle2 size={15} />
              Get your retail business started
            </span>

            <h2 className="mt-7 text-4xl font-bold leading-tight xl:text-5xl">
              One platform.
              <span className="block text-emerald-400">
                Smarter retail.
              </span>
            </h2>

            <p className="mt-5 max-w-md text-base leading-7 text-slate-400">
              Create your owner account and set up your shop to manage
              billing, inventory, customers and everyday retail
              operations from one place.
            </p>

            <div className="mt-10 space-y-5">
              {[
                {
                  title: "Fast Billing",
                  description: "Create bills and manage daily sales.",
                },
                {
                  title: "Inventory Management",
                  description: "Keep your product and stock records organized.",
                },
                {
                  title: "Business Control",
                  description: "Manage staff and shop settings from your account.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                    <CheckCircle2 size={17} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-500">
            © {new Date().getFullYear()} Groww You. All rights reserved.
          </p>
        </section>

        {/* Registration form */}
        <main className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-xl">
            {/* Mobile branding */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600">
                <Store size={23} className="text-white" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Groww You
                </h1>
                <p className="text-xs text-slate-500">
                  Retail POS Platform
                </p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-semibold text-emerald-600">
                CREATE YOUR ACCOUNT
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Set up your shop
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your details to create an owner account and
                register your retail business.
              </p>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${
                    step === 1 ? "text-emerald-700" : "text-slate-400"
                  }`}
                >
                  1. Owner details
                </span>

                <span
                  className={`text-sm font-semibold ${
                    step === 2 ? "text-emerald-700" : "text-slate-400"
                  }`}
                >
                  2. Shop details
                </span>
              </div>

              <div className="flex gap-2">
                <div
                  className={`h-1.5 flex-1 rounded-full ${
                    step >= 1 ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
                <div
                  className={`h-1.5 flex-1 rounded-full ${
                    step >= 2 ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleContinue} className="space-y-5">
                <div>
                  <label htmlFor="ownerName" className={labelClass}>
                    Owner's full name *
                  </label>

                  <div className="relative">
                    <FieldIcon icon={UserRound} />
                    <input
                      id="ownerName"
                      name="ownerName"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={form.ownerName}
                      onChange={handleChange}
                      className={`${inputClass} pl-11`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email address *
                  </label>

                  <div className="relative">
                    <FieldIcon icon={Mail} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      className={`${inputClass} pl-11`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Mobile number *
                  </label>

                  <div className="relative">
                    <FieldIcon icon={Phone} />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={form.phone}
                      onChange={handleChange}
                      className={`${inputClass} pl-11`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className={labelClass}>
                    Password *
                  </label>

                  <div className="relative">
                    <FieldIcon icon={LockKeyhole} />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Minimum 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      className={`${inputClass} pl-11 pr-12`}
                      required
                      minLength={8}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className={labelClass}
                  >
                    Confirm password *
                  </label>

                  <div className="relative">
                    <FieldIcon icon={LockKeyhole} />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className={`${inputClass} pl-11 pr-12`}
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                >
                  Continue to shop details
                  <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label htmlFor="shopName" className={labelClass}>
                    Shop name *
                  </label>

                  <div className="relative">
                    <FieldIcon icon={Store} />
                    <input
                      id="shopName"
                      name="shopName"
                      type="text"
                      placeholder="Enter your shop name"
                      value={form.shopName}
                      onChange={handleChange}
                      className={`${inputClass} pl-11`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="businessType" className={labelClass}>
                    Business type *
                  </label>

                  <div className="relative">
                    <FieldIcon icon={Building2} />

                    <select
                      id="businessType"
                      name="businessType"
                      value={form.businessType}
                      onChange={handleChange}
                      className={`${inputClass} pl-11`}
                      required
                    >
                      {businessTypes.map((businessType) => (
                        <option key={businessType} value={businessType}>
                          {businessType}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className={labelClass}>
                    Shop address *
                  </label>

                  <div className="relative">
                    <FieldIcon icon={MapPin} />
                    <input
                      id="address"
                      name="address"
                      type="text"
                      autoComplete="street-address"
                      placeholder="Street, area or locality"
                      value={form.address}
                      onChange={handleChange}
                      className={`${inputClass} pl-11`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="city" className={labelClass}>
                      City *
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="Enter city"
                      value={form.city}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className={labelClass}>
                      State *
                    </label>

                    <input
                      id="state"
                      name="state"
                      type="text"
                      autoComplete="address-level1"
                      placeholder="Enter state"
                      value={form.state}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pincode" className={labelClass}>
                      PIN code *
                    </label>

                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={6}
                      placeholder="6-digit PIN code"
                      value={form.pincode}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="gstin" className={labelClass}>
                      GSTIN (optional)
                    </label>

                    <input
                      id="gstin"
                      name="gstin"
                      type="text"
                      maxLength={15}
                      placeholder="15-character GSTIN"
                      value={form.gstin}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create owner account
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Sign in
              </Link>
            </p>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              By creating an account, you confirm that the details
              provided are accurate.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
