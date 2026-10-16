import { useEffect, useMemo, useState } from "react";

import {

  Search,

  Plus,

  Users,

  UserCheck,

  UserX,

  ShieldCheck,

  X,

  Eye,

  Pencil,

  CalendarDays,

  IndianRupee,

  ShoppingBag,

  Receipt,

  RotateCcw,

  Download,

  Activity,

  LockKeyhole,

  Save,

} from "lucide-react";

import { staffMembers as initialStaff } from "../data/mockData";



const STAFF_KEY = "groww-you-demo-staff";

const SALES_KEY = "groww-you-demo-sales";

const STAFF_EVENT = "groww-you-staff-updated";

const SALES_EVENT = "groww-you-sales-updated";



const inputClass =

  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";



const ROLE_OPTIONS = [

  "Owner",

  "Manager",

  "Cashier",

  "Inventory Manager",

  "Staff",

];



const PERMISSIONS = [

  { key: "billing", label: "Billing and sales" },

  { key: "discounts", label: "Apply discounts" },

  { key: "returns", label: "Process returns" },

  { key: "stock", label: "Edit inventory and stock" },

  { key: "purchases", label: "Manage purchases" },

  { key: "bulkUpload", label: "Bulk product upload" },

  { key: "customers", label: "View and manage customers" },

  { key: "reports", label: "View owner-level reports" },

];



const DEFAULT_PERMISSIONS = {

  Owner: {

    billing: true,

    discounts: true,

    returns: true,

    stock: true,

    purchases: true,

    bulkUpload: true,

    customers: true,

    reports: true,

  },

  Manager: {

    billing: true,

    discounts: true,

    returns: true,

    stock: true,

    purchases: true,

    bulkUpload: true,

    customers: true,

    reports: false,

  },

  Cashier: {

    billing: true,

    discounts: false,

    returns: false,

    stock: false,

    purchases: false,

    bulkUpload: false,

    customers: true,

    reports: false,

  },

  "Inventory Manager": {

    billing: false,

    discounts: false,

    returns: false,

    stock: true,

    purchases: true,

    bulkUpload: true,

    customers: false,

    reports: false,

  },

  Staff: {

    billing: true,

    discounts: false,

    returns: false,

    stock: false,

    purchases: false,

    bulkUpload: false,

    customers: false,

    reports: false,

  },

};



const money = (value) =>

  new Intl.NumberFormat("en-IN", {

    style: "currency",

    currency: "INR",

    maximumFractionDigits: 2,

  }).format(Number(value) || 0);



const readArray = (key) => {

  try {

    const value = JSON.parse(localStorage.getItem(key) || "[]");

    return Array.isArray(value) ? value : [];

  } catch {

    return [];

  }

};



const makeId = () =>

  `STF-${Date.now().toString().slice(-6)}-${Math.random()

    .toString(36)

    .slice(2, 5)

    .toUpperCase()}`;



const getPermissions = (role, permissions) => ({

  ...(DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.Staff),

  ...(permissions || {}),

});



const getSaleDate = (sale) => {

  const value = sale.timestamp || sale.createdAt || sale.date;

  if (!value) return null;



  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;

};



const getSaleStaffId = (sale) =>

  String(sale.staffId || sale.createdById || sale.userId || "");



const getSaleStaffName = (sale) =>

  String(sale.staffName || sale.createdByName || sale.userName || "");



const getSaleStatus = (sale) =>

  String(sale.status || "Completed").toLowerCase();



const isCompletedSale = (sale) =>

  !["cancelled", "failed", "void", "pending"].includes(getSaleStatus(sale));



const getSaleReturnAmount = (sale) => {

  const status = getSaleStatus(sale);



  if (status === "returned" || status === "refunded") {

    return Number(sale.total || 0);

  }



  return Number(

    sale.returnedAmount ?? sale.returnTotal ?? sale.refundAmount ?? 0

  );

};



const getStaffForSale = (sale, staff) => {

  const staffId = getSaleStaffId(sale);



  if (staffId) {

    return staff.find((member) => String(member.id) === staffId) || null;

  }



  const name = getSaleStaffName(sale).trim().toLowerCase();



  if (name) {

    return (

      staff.find(

        (member) => String(member.name || "").trim().toLowerCase() === name

      ) || null

    );

  }



  return null;

};



const emptyForm = {

  name: "",

  email: "",

  phone: "",

  password: "",
  role: "Cashier",

  status: "Active",

  permissions: { ...DEFAULT_PERMISSIONS.Cashier },

};



function loadInitialStaff() {

  const saved = readArray(STAFF_KEY);



  if (saved.length) {

    return saved.map((member) => ({

      ...member,

      permissions: getPermissions(member.role, member.permissions),

    }));

  }



  return (initialStaff || []).map((member) => ({

    ...member,

    status: member.status || "Active",

    permissions: getPermissions(member.role, member.permissions),

  }));

}



function formatDate(value) {

  if (!value) return "—";



  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);



  return date.toLocaleString("en-IN", {

    dateStyle: "medium",

    timeStyle: "short",

  });

}



function dateInRange(date, from, to) {

  if (!date) return false;



  if (from && date < new Date(`${from}T00:00:00`)) return false;

  if (to && date > new Date(`${to}T23:59:59.999`)) return false;



  return true;

}



export default function Staff() {

  const [staff, setStaff] = useState(loadInitialStaff);

  const [sales, setSales] = useState(() => readArray(SALES_KEY));



  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("All");

  const [statusFilter, setStatusFilter] = useState("All");



  const [showForm, setShowForm] = useState(false);

  const [editingStaff, setEditingStaff] = useState(null);

  const [selectedStaff, setSelectedStaff] = useState(null);



  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("success");



  const [activeTab, setActiveTab] = useState("staff");

  const [reportStaffId, setReportStaffId] = useState("All");

  const [dateFrom, setDateFrom] = useState("");

  const [dateTo, setDateTo] = useState("");



  const [form, setForm] = useState(emptyForm);



  useEffect(() => {

    const refreshSales = () => setSales(readArray(SALES_KEY));



    const refreshStaff = () => {

      const stored = readArray(STAFF_KEY);

      if (stored.length) {

        setStaff(

          stored.map((member) => ({

            ...member,

            permissions: getPermissions(member.role, member.permissions),

          }))

        );

      }

    };



    window.addEventListener(SALES_EVENT, refreshSales);

    window.addEventListener(STAFF_EVENT, refreshStaff);

    window.addEventListener("storage", refreshSales);



    return () => {

      window.removeEventListener(SALES_EVENT, refreshSales);

      window.removeEventListener(STAFF_EVENT, refreshStaff);

      window.removeEventListener("storage", refreshSales);

    };

  }, []);

  function persistStaff(nextStaff) {

    try {

      localStorage.setItem(STAFF_KEY, JSON.stringify(nextStaff));

      setStaff(nextStaff);

      window.dispatchEvent(new Event(STAFF_EVENT));

      return true;

    } catch {

      setMessageType("error");

      setMessage("Unable to save staff records in browser storage.");

      return false;

    }

  }



  function showMessage(text, type = "success") {

    setMessage(text);

    setMessageType(type);

  }



  const roles = useMemo(

    () => ["All", ...new Set(staff.map((member) => member.role).filter(Boolean))],

    [staff]

  );



  const filteredStaff = useMemo(() => {

    const query = search.trim().toLowerCase();



    return staff.filter((member) => {

      const matchesSearch =

        !query ||

        `${member.name || ""} ${member.id || ""} ${member.role || ""} ${member.email || ""

          } ${member.phone || ""}`

          .toLowerCase()

          .includes(query);



      const matchesRole =
        roleFilter === "All" || member.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;

    });

  }, [staff, search, roleFilter, statusFilter]);


  const activeCount = staff.filter(
    (member) => member.status === "Active"
  ).length;

  const inactiveCount = staff.filter(
    (member) => member.status !== "Active"
  ).length;

  const reportSales = useMemo(() => {

    return sales.filter((sale) => {

      const date = getSaleDate(sale);


      if (!dateInRange(date, dateFrom, dateTo)) return false;

      if (reportStaffId !== "All") {

        const member = getStaffForSale(sale, staff);

        if (String(member?.id || "") !== String(reportStaffId)) return false;

      }
      return true;

    });

  }, [sales, staff, reportStaffId, dateFrom, dateTo]);



  const staffPerformance = useMemo(() => {

    return staff.map((member) => {

      const memberSales = reportSales.filter((sale) => {

        const linkedStaff = getStaffForSale(sale, staff);

        return String(linkedStaff?.id || "") === String(member.id);

      });

      const completed = memberSales.filter(isCompletedSale);

      const salesValue = completed.reduce(

        (sum, sale) => sum + Number(sale.total || 0),0);

      const returnsValue = memberSales.reduce(
        (sum, sale) => sum + getSaleReturnAmount(sale), 0);

      const discounts = completed.reduce(
        (sum, sale) => sum + Number(sale.discount || 0),0   );

      const netSales = Math.max(0, salesValue - returnsValue);

      return {
        ...member,
        billCount: completed.length,
        salesValue,
        returnsValue,
        discounts,
        netSales,
        activity: memberSales,
      };
    });
  }, [staff, reportSales]);


  const reportTotals = useMemo(() =>
    staffPerformance.reduce(
      (totals, member) => ({
        bills: totals.bills + member.billCount,
        gross: totals.gross + member.salesValue,
        returns: totals.returns + member.returnsValue,
        discounts: totals.discounts + member.discounts,
        net: totals.net + member.netSales,
      }),
      { bills: 0, gross: 0, returns: 0, discounts: 0, net: 0 }
    ),
    [staffPerformance]
  );

  const openAddForm = () => {
    setEditingStaff(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage("");

  };

  const openEditForm = (member) => {
    setEditingStaff(member);

    setForm({

      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      password: "",
      role: member.role || "Cashier",
      status: member.status || "Active",
      permissions: getPermissions(member.role, member.permissions),

    });

    setShowForm(true);
    setMessage("");

  };

  const handleRoleChange = (role) => {
    setForm((current) => ({
      ...current,
      role,
      permissions: { ...getPermissions(role) },
    }));

  };

  const handleSaveStaff = (event) => {

    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const password = form.password.trim();

    if (!editingStaff && password.length < 6) {
      showMessage("New staff password must be at least 6 characters.", "error");
      return;
    }

    if (!name) {
      showMessage("Staff name is required.", "error");
      return;

    }

    if (
      email &&
      staff.some(

        (member) =>
          String(member.email || "").toLowerCase() === email.toLowerCase() &&
          String(member.id) !== String(editingStaff?.id || "")

      )

    ) {

      showMessage("This email is already assigned to another staff member.", "error");
      return;

    }

    const now = new Date().toISOString();

    const member = {
      ...(editingStaff || {}),
      id: editingStaff?.id || makeId(),
      name,
      email,
      phone,
      ...(password ? { password } : {}),
      role: form.role,
      status: form.status,
      permissions: getPermissions(form.role, form.permissions),
      updatedAt: now,
      createdAt: editingStaff?.createdAt || now,

    };

    const nextStaff = editingStaff
      ? staff.map((item) =>
        String(item.id) === String(editingStaff.id) ? member : item
      )
      : [member, ...staff];

    if (!persistStaff(nextStaff)) return;

    setShowForm(false);
    setEditingStaff(null);
    setForm(emptyForm);

    showMessage(

      editingStaff
        ? "Staff profile and permissions updated."
        : "Staff member added successfully."
    );

  };



  const toggleStatus = (member) => {

    if (member.role === "Owner" && member.status === "Active") {

      const activeOwners = staff.filter(

        (item) => item.role === "Owner" && item.status === "Active"

      );

      if (activeOwners.length <= 1) {

        showMessage("At least one active Owner must remain.", "error");
        return;
      }

    }

    const nextStatus = member.status === "Active" ? "Inactive" : "Active";

    const nextStaff = staff.map((item) =>

      String(item.id) === String(member.id)
        ? {
          ...item,
          status: nextStatus,
          updatedAt: new Date().toISOString(),

        }
        : item

    );

    if (!persistStaff(nextStaff)) return;

    setSelectedStaff(null);

    showMessage(
      `${member.name} has been marked ${nextStatus.toLowerCase()}.`

    );

  };

  const exportPerformance = () => {

    const rows = [

      [
        "Staff ID",
        "Staff Name",
        "Role",
        "Bills",
        "Gross Sales",
        "Returns",
        "Discounts",
        "Net Sales",
      ],
      ...staffPerformance.map((member) => [
        member.id,
        member.name,
        member.role,
        member.billCount,
        member.salesValue,
        member.returnsValue,
        member.discounts,
        member.netSales,

      ]),

    ];

    const csv = rows
      .map((row) =>

        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {

      type: "text/csv;charset=utf-8;",

    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "groww-you-staff-performance.csv";
    link.click()
    URL.revokeObjectURL(url);

  };

  const selectedStaffActivity = selectedStaff
    ? sales
      .filter((sale) => {
        const member = getStaffForSale(sale, staff);
        return String(member?.id || "") === String(selectedStaff.id);

      })

      .sort(
        (a, b) =>
          (getSaleDate(b)?.getTime() || 0) -
          (getSaleDate(a)?.getTime() || 0)

      )

    : [];
  return (

    <div className="space-y-6">

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>

          <p className="text-sm font-medium text-indigo-600">
            Store Operations / Team Management

          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Staff Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage staff profiles, permissions, billing activity and performance.
          </p>

        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"

        >
          <Plus size={18} />
          Add Staff
        </button>
      </header>



      {message && (

        <div

          role="status"

          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${messageType === "error"

            ? "border-rose-200 bg-rose-50 text-rose-700"

            : "border-emerald-200 bg-emerald-50 text-emerald-800"

            }`}

        >

          <span>{message}</span>

          <button

            type="button"

            onClick={() => setMessage("")}

            aria-label="Dismiss message"

          >

            <X size={16} />

          </button>

        </div>

      )}



      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard

          title="Total Staff"

          value={staff.length}

          description="All team members"

          icon={Users}

          iconClass="bg-indigo-50 text-indigo-600"

        />

        <SummaryCard

          title="Active Staff"

          value={activeCount}

          description="Currently active"

          icon={UserCheck}

          iconClass="bg-emerald-50 text-emerald-600"

        />

        <SummaryCard

          title="Inactive Staff"

          value={inactiveCount}

          description="Deactivated accounts"

          icon={UserX}

          iconClass="bg-amber-50 text-amber-600"

        />

        <SummaryCard

          title="Recorded Bills"

          value={reportTotals.bills}

          description="Linked bills in selected period"

          icon={Receipt}

          iconClass="bg-blue-50 text-blue-600"

        />

      </div>



      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2">

        {[

          { id: "staff", label: "Staff & Permissions", icon: Users },

          { id: "activity", label: "Billing Activity", icon: Activity },

          { id: "performance", label: "Staff Performance", icon: ShoppingBag },

        ].map(({ id, label, icon: Icon }) => (

          <button

            key={id}

            type="button"

            onClick={() => setActiveTab(id)}

            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${activeTab === id

              ? "bg-indigo-600 text-white"

              : "text-slate-600 hover:bg-slate-100"

              }`}

          >

            <Icon size={16} />

            {label}

          </button>

        ))}

      </div>



      {activeTab === "staff" && (

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-4 sm:p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="font-semibold text-slate-900">Store Team</h2>

                <p className="mt-1 text-sm text-slate-500">

                  {filteredStaff.length} staff member(s) found

                </p>

              </div>



              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                <div className="relative">

                  <Search

                    size={17}

                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"

                  />

                  <input

                    value={search}

                    onChange={(event) => setSearch(event.target.value)}

                    placeholder="Search staff..."

                    className={`${inputClass} pl-9`}

                  />

                </div>



                <select

                  value={roleFilter}

                  onChange={(event) => setRoleFilter(event.target.value)}

                  className={inputClass}

                  aria-label="Filter by role"

                >

                  {roles.map((role) => (

                    <option key={role} value={role}>

                      {role === "All" ? "All roles" : role}

                    </option>

                  ))}

                </select>



                <select

                  value={statusFilter}

                  onChange={(event) => setStatusFilter(event.target.value)}

                  className={inputClass}

                  aria-label="Filter by status"

                >

                  {["All", "Active", "Inactive"].map((status) => (

                    <option key={status} value={status}>

                      {status === "All" ? "All statuses" : status}

                    </option>

                  ))}

                </select>

              </div>

            </div>

          </div>



          <div className="overflow-x-auto">

            <table className="w-full min-w-[780px] text-left text-sm">

              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">

                <tr>

                  <th className="px-5 py-4">Staff Member</th>

                  <th className="px-5 py-4">Staff ID</th>

                  <th className="px-5 py-4">Role</th>

                  <th className="px-5 py-4">Status</th>

                  <th className="px-5 py-4">Permissions</th>

                  <th className="px-5 py-4 text-right">Actions</th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredStaff.map((member) => {

                  const permissionCount = Object.values(

                    getPermissions(member.role, member.permissions)

                  ).filter(Boolean).length;



                  return (

                    <tr key={member.id} className="hover:bg-slate-50/70">

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <Avatar name={member.name} />

                          <div>

                            <p className="font-semibold text-slate-800">

                              {member.name}

                            </p>

                            <p className="mt-1 text-xs text-slate-500">

                              {member.email || "No email provided"}

                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-4 font-medium text-slate-600">

                        {member.id}

                      </td>

                      <td className="px-5 py-4">

                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">

                          <ShieldCheck size={14} />

                          {member.role}

                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <StatusBadge status={member.status} />

                      </td>

                      <td className="px-5 py-4 text-slate-600">

                        {permissionCount} of {PERMISSIONS.length} enabled

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button

                            type="button"

                            onClick={() => setSelectedStaff(member)}

                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"

                            title="View staff"

                          >

                            <Eye size={16} />

                          </button>

                          <button

                            type="button"

                            onClick={() => openEditForm(member)}

                            className="rounded-lg border border-slate-200 p-2 text-indigo-600 hover:bg-indigo-50"

                            title="Edit staff and permissions"

                          >

                            <Pencil size={16} />

                          </button>

                        </div>

                      </td>

                    </tr>

                  );

                })}



                {!filteredStaff.length && (

                  <tr>

                    <td colSpan={6} className="px-5 py-12 text-center">

                      <Users size={30} className="mx-auto text-slate-300" />

                      <p className="mt-3 font-semibold text-slate-700">

                        No staff members found

                      </p>

                      <p className="mt-1 text-sm text-slate-500">

                        Try changing your search or filters.

                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      )}



      {activeTab === "activity" && (

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <ReportFilters

            staff={staff}

            staffId={reportStaffId}

            setStaffId={setReportStaffId}

            dateFrom={dateFrom}

            setDateFrom={setDateFrom}

            dateTo={dateTo}

            setDateTo={setDateTo}

          />



          <div className="border-y border-slate-100 px-5 py-4">

            <p className="text-sm text-slate-500">

              {reportSales.length} bill record(s) in this period.

              Unassigned bills are not attributed to a staff member.

            </p>

          </div>



          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px] text-left text-sm">

              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">

                <tr>

                  <th className="px-5 py-4">Bill ID</th>

                  <th className="px-5 py-4">Date</th>

                  <th className="px-5 py-4">Staff</th>

                  <th className="px-5 py-4">Customer</th>

                  <th className="px-5 py-4">Payment</th>

                  <th className="px-5 py-4">Status</th>

                  <th className="px-5 py-4 text-right">Amount</th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {[...reportSales]

                  .sort(

                    (a, b) =>

                      (getSaleDate(b)?.getTime() || 0) -

                      (getSaleDate(a)?.getTime() || 0)

                  )

                  .map((sale, index) => {

                    const member = getStaffForSale(sale, staff);



                    return (

                      <tr key={sale.id || index} className="hover:bg-slate-50">

                        <td className="px-5 py-4 font-semibold text-slate-800">

                          {sale.id || `Bill ${index + 1}`}

                        </td>

                        <td className="px-5 py-4 text-slate-600">

                          {formatDate(sale.timestamp || sale.date)}

                        </td>

                        <td className="px-5 py-4 text-slate-700">

                          {member?.name || getSaleStaffName(sale) || "Unassigned"}

                        </td>

                        <td className="px-5 py-4 text-slate-600">

                          {sale.customer || "Walk-in Customer"}

                        </td>

                        <td className="px-5 py-4 text-slate-600">

                          {sale.paymentMethod || "—"}

                        </td>

                        <td className="px-5 py-4">

                          <StatusBadge

                            status={isCompletedSale(sale) ? "Completed" : sale.status}

                          />

                        </td>

                        <td className="px-5 py-4 text-right font-semibold text-slate-800">

                          {money(sale.total)}

                        </td>

                      </tr>

                    );

                  })}



                {!reportSales.length && (

                  <tr>

                    <td colSpan={7} className="px-5 py-12 text-center text-slate-500">

                      No billing activity found for this filter.

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      )}



      {activeTab === "performance" && (

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <ReportFilters

            staff={staff}

            staffId={reportStaffId}

            setStaffId={setReportStaffId}

            dateFrom={dateFrom}

            setDateFrom={setDateFrom}

            dateTo={dateTo}

            setDateTo={setDateTo}

          />



          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-5">

            <MetricCard label="Completed Bills" value={reportTotals.bills} />

            <MetricCard label="Gross Sales" value={money(reportTotals.gross)} />

            <MetricCard label="Returns" value={money(reportTotals.returns)} />

            <MetricCard label="Discounts" value={money(reportTotals.discounts)} />

            <MetricCard label="Net Sales" value={money(reportTotals.net)} />

          </div>



          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-100 px-5 py-4">

            <div>

              <h2 className="font-semibold text-slate-900">

                Staff-wise Performance

              </h2>

              <p className="mt-1 text-sm text-slate-500">

                Based on recorded sales, returns and discounts.

              </p>

            </div>

            <button

              type="button"

              onClick={exportPerformance}

              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"

            >

              <Download size={16} />

              Export CSV

            </button>

          </div>



          <div className="overflow-x-auto">

            <table className="w-full min-w-[780px] text-left text-sm">

              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">

                <tr>

                  <th className="px-5 py-4">Staff</th>

                  <th className="px-5 py-4">Bills</th>

                  <th className="px-5 py-4">Gross Sales</th>

                  <th className="px-5 py-4">Returns</th>

                  <th className="px-5 py-4">Discounts</th>

                  <th className="px-5 py-4">Net Sales</th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {staffPerformance

                  .filter(

                    (member) =>

                      reportStaffId === "All" ||

                      String(member.id) === String(reportStaffId)

                  )

                  .map((member) => (

                    <tr key={member.id} className="hover:bg-slate-50">

                      <td className="px-5 py-4">

                        <p className="font-semibold text-slate-800">

                          {member.name}

                        </p>

                        <p className="mt-1 text-xs text-slate-500">

                          {member.role}

                        </p>

                      </td>

                      <td className="px-5 py-4 text-slate-700">

                        {member.billCount}

                      </td>

                      <td className="px-5 py-4 text-slate-700">

                        {money(member.salesValue)}

                      </td>

                      <td className="px-5 py-4 text-rose-600">

                        {money(member.returnsValue)}

                      </td>

                      <td className="px-5 py-4 text-amber-700">

                        {money(member.discounts)}

                      </td>

                      <td className="px-5 py-4 font-bold text-emerald-700">

                        {money(member.netSales)}

                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>



          <div className="border-t border-slate-100 p-4 text-xs leading-5 text-slate-500">

            Net sales = completed bill totals minus recorded returns. This demo

            does not perform detailed performance scoring.

          </div>

        </section>

      )}



      {showForm && (

        <div

          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4"

          onClick={() => setShowForm(false)}

        >

          <div

            role="dialog"

            aria-modal="true"

            aria-labelledby="staff-form-title"

            className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"

            onClick={(event) => event.stopPropagation()}

          >

            <div className="mb-5 flex items-start justify-between gap-3">

              <div>

                <h2 id="staff-form-title" className="text-lg font-bold text-slate-900">

                  {editingStaff ? "Edit Staff Member" : "Add Staff Member"}

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  Configure the staff profile, role and allowed actions.

                </p>

              </div>

              <button

                type="button"

                onClick={() => setShowForm(false)}

                aria-label="Close staff form"

                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"

              >

                <X size={18} />

              </button>

            </div>



            <form onSubmit={handleSaveStaff} className="space-y-5">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <FormField label="Full name">

                  <input

                    required

                    autoFocus

                    value={form.name}

                    onChange={(event) =>

                      setForm({ ...form, name: event.target.value })

                    }

                    placeholder="Enter staff name"

                    className={inputClass}

                  />

                </FormField>



                <FormField label="Role">

                  <select

                    value={form.role}

                    onChange={(event) => handleRoleChange(event.target.value)}

                    className={inputClass}

                  >

                    {ROLE_OPTIONS.map((role) => (

                      <option key={role} value={role}>

                        {role}

                      </option>

                    ))}

                  </select>

                </FormField>



                <FormField label="Email (optional)">

                  <input

                    type="email"

                    value={form.email}

                    onChange={(event) =>

                      setForm({ ...form, email: event.target.value })

                    }

                    placeholder="staff\@example.com"

                    className={inputClass}

                  />

                </FormField>



                <FormField label="Login Password">
                  <input
                    type="password"
                    required={!editingStaff}
                    minLength={6}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(event) =>
                      setForm({ ...form, password: event.target.value })
                    }
                    placeholder={
                      editingStaff
                        ? "Leave blank to keep current password"
                        : "Create staff login password"
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Phone (optional)">

                  <input

                    value={form.phone}

                    onChange={(event) =>

                      setForm({ ...form, phone: event.target.value })

                    }

                    placeholder="Mobile number"

                    className={inputClass}

                  />

                </FormField>



                <FormField label="Account status">

                  <select

                    value={form.status}

                    onChange={(event) =>

                      setForm({ ...form, status: event.target.value })

                    }

                    className={inputClass}

                  >

                    <option value="Active">Active</option>

                    <option value="Inactive">Inactive</option>

                  </select>

                </FormField>

              </div>



              <div className="rounded-xl border border-slate-200 p-4">

                <div className="mb-4 flex items-start gap-3">

                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-700">

                    <LockKeyhole size={18} />

                  </div>

                  <div>

                    <h3 className="font-semibold text-slate-900">

                      Role Permissions

                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">

                      Defaults are based on the selected role. Adjust individual

                      permissions below.

                    </p>

                  </div>

                </div>



                <div className="grid gap-3 sm:grid-cols-2">

                  {PERMISSIONS.map((permission) => (

                    <label

                      key={permission.key}

                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50"

                    >

                      <input

                        type="checkbox"

                        checked={Boolean(form.permissions[permission.key])}

                        onChange={(event) =>

                          setForm((current) => ({

                            ...current,

                            permissions: {

                              ...current.permissions,

                              [permission.key]: event.target.checked,

                            },

                          }))

                        }

                        className="mt-0.5 h-4 w-4 accent-indigo-600"

                      />

                      <span className="text-sm text-slate-700">

                        {permission.label}

                      </span>

                    </label>

                  ))}

                </div>

              </div>



              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">

                <button

                  type="button"

                  onClick={() => setShowForm(false)}

                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"

                >

                  Cancel

                </button>

                <button

                  type="submit"

                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"

                >

                  <Save size={16} />

                  {editingStaff ? "Save Changes" : "Create Staff"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}



      {selectedStaff && (

        <div

          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4"

          onClick={() => setSelectedStaff(null)}

        >

          <div

            role="dialog"

            aria-modal="true"

            aria-labelledby="staff-detail-title"

            className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"

            onClick={(event) => event.stopPropagation()}

          >

            <div className="flex items-start justify-between">

              <div>

                <h2 id="staff-detail-title" className="text-lg font-bold text-slate-900">

                  Staff Details

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  Profile, permissions and recorded activity

                </p>

              </div>

              <button

                type="button"
                onClick={() => setSelectedStaff(null)}
                aria-label="Close staff details"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>

            </div>



            <div className="mt-5 flex items-center gap-4 rounded-xl bg-slate-50 p-4">

              <Avatar name={selectedStaff.name} large />

              <div>

                <h3 className="font-bold text-slate-900">

                  {selectedStaff.name}

                </h3>

                <p className="mt-1 text-sm text-slate-500">

                  {selectedStaff.id}

                </p>

                <p className="mt-1 text-sm text-slate-500">

                  {selectedStaff.role}

                </p>

              </div>

              <div className="ml-auto">

                <StatusBadge status={selectedStaff.status} />

              </div>

            </div>

            <div className="mt-5 space-y-3">
              <DetailRow label="Email" value={selectedStaff.email || "—"} />
              <DetailRow label="Phone" value={selectedStaff.phone || "—"} />
              <DetailRow
                label="Recorded bills"
                value={selectedStaffActivity.length}
              />

              <DetailRow
                label="Recorded bill value"

                value={money(
                  selectedStaffActivity
                    .filter(isCompletedSale)
                    .reduce((sum, sale) => sum + Number(sale.total || 0), 0)

                )}

              />

            </div>

            <div className="mt-5">
              <h3 className="mb-3 font-semibold text-slate-900">
                Enabled Permissions
              </h3>

              <div className="flex flex-wrap gap-2">
                {PERMISSIONS.filter(

                  (permission) =>
                    getPermissions(
                      selectedStaff.role,
                      selectedStaff.permissions
                    )[permission.key]

                ).map((permission) => (

                  <span

                    key={permission.key}
                    className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700"

                  >
                    {permission.label}

                  </span>

                ))}

                {!PERMISSIONS.some(

                  (permission) =>
                    getPermissions(
                      selectedStaff.role,
                      selectedStaff.permissions
                    )[permission.key]

                ) && (

                    <span className="text-sm text-slate-500">
                      No permissions enabled.
                    </span>
                  )}

              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={() => {
                  const member = selectedStaff;
                  setSelectedStaff(null);
                  openEditForm(member);

                }}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Edit Profile
              </button>

              <button
                type="button"
                onClick={() => toggleStatus(selectedStaff)}
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"

              >
                {selectedStaff.status === "Active"
                  ? "Deactivate Account"
                  : "Activate Account"}

              </button>
            </div>

            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              This frontend demo stores permissions for display and configuration.
              It does not enforce security or authenticate staff accounts.
            </p>
          </div>
        </div>

      )}

    </div>

  );
}

function ReportFilters({
  staff,
  staffId,
  setStaffId,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
}) {

  return (

    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5">
      <label className="text-xs font-semibold text-slate-600">
        Staff member
        <select
          value={staffId}
          onChange={(event) => setStaffId(event.target.value)}
          className={inputClass}
        >

          <option value="All">All staff</option>
          {staff.map((member) => (

            <option key={member.id} value={member.id}>
              {member.name} — {member.role}
            </option>
          ))}

        </select>
      </label>

      <label className="text-xs font-semibold text-slate-600">
        From date
        <div className="relative">

          <CalendarDays
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"

          />

          <input

            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className={`${inputClass} pl-9`}

          />
        </div>

      </label>

      <label className="text-xs font-semibold text-slate-600">
        To date
        <div className="relative">

          <CalendarDays
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"

          />

          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(event) => setDateTo(event.target.value)}
            className={`${inputClass} pl-9`}

          />
        </div>

      </label>

    </div>
  );

}

function SummaryCard({ title, value, description, icon: Icon, iconClass }) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900">

            {value}

          </p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>

        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>

      </div>
    </div>

  );

}

function MetricCard({ label, value }) {

  return (

    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>

      <p className="mt-2 break-words text-xl font-bold text-slate-900">

        {value}

      </p>

    </div>
  );

}

function Avatar({ name, large = false }) {

  const initials = String(name || "?")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-semibold text-indigo-700 ${large ? "h-16 w-16 text-xl" : "h-10 w-10 text-sm"
        }`}
    >
      {initials}

    </div>

  );

}

function StatusBadge({ status }) {

  const active = String(status).toLowerCase() === "active";
  const completed = String(status).toLowerCase() === "completed";

  const style =
    active || completed
      ? "bg-emerald-50 text-emerald-700"
      : "bg-slate-100 text-slate-600";
  return (

    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      <span

        className={`h-1.5 w-1.5 rounded-full ${active || completed ? "bg-emerald-500" : "bg-slate-400"
          }`}

      />
      {status || "Unknown"}

    </span>
  );

}



function FormField({ label, children }) {
  return (

    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>

  );

}



function DetailRow({ label, value }) {

  return (

    <div className="flex items-start justify-between gap-3 text-sm">

      <span className="text-slate-500">{label}</span>

      <span className="break-all text-right font-semibold text-slate-800">

        {value}

      </span>

    </div>

  );
}
