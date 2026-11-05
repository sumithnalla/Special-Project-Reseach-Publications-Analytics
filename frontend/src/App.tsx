import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ClipboardList,
  Download,
  FileBarChart,
  FileText,
  LayoutDashboard,
  LogOut,
  PieChart,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, apiError } from "./api";

type User = {
  id: string;
  email: string;
  role: "admin" | "faculty";
  status: string;
};
type Publication = Record<string, any>;
const palette = ["#0f766e", "#f59e0b", "#2563eb", "#e11d48", "#7c3aed"];
const blankPublication = {
  title: "",
  authors: "",
  publication_type: "journal",
  journal_or_conference: "",
  publisher: "",
  publication_year: new Date().getFullYear(),
  doi: "",
  indexing: "Scopus",
  quartile: "Q2",
  impact_factor: 0,
  citation_count: 0,
  url: "",
  abstract: "",
};

function Status({ value }: { value: string }) {
  return <span className={`badge ${value}`}>{value}</span>;
}
function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <article className="metric">
      <div className="metric-head">
        <span>{label}</span>
        <span className="metric-icon">{icon}</span>
      </div>
      <div className="metric-value">{Number(value || 0).toLocaleString()}</div>
    </article>
  );
}
function Chart({
  title,
  type,
  data,
}: {
  title: string;
  type: "line" | "bar" | "pie";
  data: any[];
}) {
  const normalized =
    data?.map((item) => ({
      ...item,
      label: item.name ?? item.year,
      value: item.value ?? item.publications,
    })) || [];
  if (!normalized.length)
    return (
      <section className="panel">
        <h3 className="panel-title">{title}</h3>
        <div className="empty">No approved publication data yet.</div>
      </section>
    );
  return (
    <section className="panel">
      <h3 className="panel-title">{title}</h3>
      <div style={{ height: 270 }}>
        <ResponsiveContainer>
          {type === "line" ? (
            <LineChart data={normalized}>
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name="Publications"
                stroke="#0f766e"
                strokeWidth={3}
              />
            </LineChart>
          ) : type === "bar" ? (
            <BarChart data={normalized}>
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="value"
                name="Publications"
                fill="#0f766e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <RePieChart>
              <Pie
                data={normalized}
                dataKey="value"
                nameKey="label"
                innerRadius={54}
                outerRadius={88}
              >
                {normalized.map((_, i) => (
                  <Cell key={i} fill={palette[i % palette.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RePieChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState("sumithnalla0607@gmail.com");
  const [password, setPassword] = useState("admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("rpa_token", data.access_token);
      localStorage.setItem("rpa_user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="brand-mark">
          <BookOpenCheck size={20} color="white" />
        </div>
        <h1>Research Publication Analytics</h1>
        <p className="subtle">
          Sign in to manage, verify, and analyze synthetic research records.
        </p>
        {error && <div className="notice error">{error}</div>}
        <label>
          Email
          <input
            className="field"
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            className="field"
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button className="button" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="subtle" style={{ marginTop: 18 }}>
          Demo faculty: `faculty01@demo-university.edu` / `123456`
        </p>
      </form>
    </main>
  );
}

function PublicationModal({
  existing,
  admin = false,
  onClose,
  onSaved,
}: {
  existing?: Publication;
  admin?: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<any>(
    existing
      ? { ...existing, authors: existing.authors.join(", ") }
      : blankPublication,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const change = (key: string, value: any) =>
    setForm((current: any) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      publication_year: Number(form.publication_year),
      impact_factor: Number(form.impact_factor),
      citation_count: Number(form.citation_count),
      authors: String(form.authors)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    };
    try {
      existing
        ? await api.put(`/api/${admin ? "admin" : "faculty"}/publications/${existing.id}`, payload)
        : await api.post("/api/faculty/publications", payload);
      onSaved();
      onClose();
    } catch (e) {
      setError(apiError(e));
    } finally {
      setSaving(false);
    }
  }
  const input = (label: string, key: string, type = "text") => (
    <label>
      {label}
      <input
        className="field"
        value={form[key] ?? ""}
        type={type}
        onChange={(e) => change(key, e.target.value)}
        required={["title", "authors", "journal_or_conference"].includes(key)}
      />
    </label>
  );
  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <h2 className="page-title">
          {existing ? "Edit Publication" : "Add Publication"}
        </h2>
        {error && <div className="notice error">{error}</div>}
        <div className="form-grid">
          {input("Title", "title")}
          {input("Authors (comma separated)", "authors")}
          <label>
            Type
            <select
              className="field"
              value={form.publication_type}
              onChange={(e) => change("publication_type", e.target.value)}
            >
              <option value="journal">Journal</option>
              <option value="conference">Conference</option>
              <option value="book_chapter">Book chapter</option>
            </select>
          </label>
          {input("Journal or conference", "journal_or_conference")}
          {input("Publisher", "publisher")}
          {input("Publication year", "publication_year", "number")}
          {input("DOI", "doi")}
          <label>
            Indexing
            <select
              className="field"
              value={form.indexing}
              onChange={(e) => change("indexing", e.target.value)}
            >
              {["Scopus", "Web of Science", "UGC/Other", "Not Indexed"].map(
                (v) => (
                  <option key={v}>{v}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Quartile
            <select
              className="field"
              value={form.quartile}
              onChange={(e) => change("quartile", e.target.value)}
            >
              {["Q1", "Q2", "Q3", "Q4", "N/A"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          {input("Impact factor", "impact_factor", "number")}
          {input("Citation count", "citation_count", "number")}
          {input("Publication URL", "url")}
          <label className="wide">
            Abstract
            <textarea
              className="field"
              value={form.abstract}
              onChange={(e) => change("abstract", e.target.value)}
            />
          </label>
        </div>
        <div className="actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button" disabled={saving}>
            {saving ? "Saving..." : "Save publication"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Publications({
  admin,
  pendingOnly = false,
  notify,
}: {
  admin: boolean;
  pendingOnly?: boolean;
  notify: (message: string) => void;
}) {
  const [data, setData] = useState<any>({ items: [] });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(pendingOnly ? "pending" : "");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<Publication | undefined | null>(null);
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    try {
      const { data: result } = await api.get(
        admin
          ? pendingOnly
            ? "/api/admin/publications/pending"
            : "/api/admin/publications"
          : "/api/faculty/publications",
        {
          params: {
            page,
            page_size: 15,
            search: search || undefined,
            status: status || undefined,
          },
        },
      );
      setData(result);
    } catch (e) {
      notify(apiError(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [page, status, admin, pendingOnly]);
  async function action(id: string, kind: "approve" | "reject" | "delete") {
    const reason = kind === "reject" ? window.prompt("Rejection reason:") : "";
    if (kind === "reject" && !reason) return;
    if (
      kind === "delete" &&
      !window.confirm("Delete this publication permanently?")
    )
      return;
    try {
      if (kind === "delete")
        await api.delete(
          `${admin ? "/api/admin" : "/api/faculty"}/publications/${id}`,
        );
      else
        await api.patch(
          `/api/admin/publications/${id}/${kind}`,
          kind === "reject" ? { reason } : undefined,
        );
      notify(`Publication ${kind}d successfully.`);
      load();
    } catch (e) {
      notify(apiError(e));
    }
  }
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 className="page-title">
            {pendingOnly
              ? "Pending Approvals"
              : admin
                ? "Publications"
                : "My Publications"}
          </h1>
          <p className="subtle">
            {admin
              ? "Search, review, and manage institutional research records."
              : "Your submissions are visible here with their verification status."}
          </p>
        </div>
        {!admin && (
          <button className="button" onClick={() => setModal(undefined)}>
            <Plus size={17} /> Add publication
          </button>
        )}
      </div>
      <div className="toolbar">
        <input
          className="field search"
          placeholder="Search title, venue, DOI"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <select
          className="field"
          value={status}
          disabled={pendingOnly}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {["pending", "approved", "rejected"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <button
          className="button secondary"
          onClick={() => {
            setPage(1);
            load();
          }}
        >
          <Search size={16} /> Search
        </button>
      </div>
      <section className="panel table-wrap">
        {loading ? (
          <div className="empty">Loading publications...</div>
        ) : data.items?.length ? (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                {admin && <th>Faculty</th>}
                <th>Type</th>
                <th>Year</th>
                <th>Indexing</th>
                <th>Citations</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item: Publication) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <br />
                    <span className="subtle">{item.journal_or_conference}</span>
                  </td>
                  {admin && (
                    <td>
                      {item.faculty_name}
                      <br />
                      <span className="subtle">{item.department_name}</span>
                    </td>
                  )}
                  <td>{item.publication_type.replace("_", " ")}</td>
                  <td>{item.publication_year}</td>
                  <td>{item.indexing}</td>
                  <td>{item.citation_count}</td>
                  <td>
                    <Status value={item.status} />
                  </td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button
                      className="icon-button"
                      title="Edit publication"
                      onClick={() => setModal(item)}
                    >
                      <FileText size={16} />
                    </button>
                    {admin && item.status !== "approved" && (
                      <button
                        className="icon-button"
                        title="Approve"
                        onClick={() => action(item.id, "approve")}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    {admin && item.status === "pending" && (
                      <button
                        className="icon-button"
                        title="Reject"
                        onClick={() => action(item.id, "reject")}
                      >
                        <ShieldCheck size={16} />
                      </button>
                    )}
                    <button
                      className="icon-button"
                      title="Delete publication"
                      onClick={() => action(item.id, "delete")}
                    >
                      <LogOut size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">No publications match these filters.</div>
        )}
        <div className="pagination">
          <span>
            Showing {data.items?.length || 0} of {data.total || 0}
          </span>
          <span>
            <button
              className="icon-button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              &lt;
            </button>{" "}
            <button
              className="icon-button"
              disabled={page >= (data.total_pages || 1)}
              onClick={() => setPage(page + 1)}
            >
              &gt;
            </button>
          </span>
        </div>
      </section>
      {modal !== null && (
        <PublicationModal
          existing={modal || undefined}
          admin={admin}
          onClose={() => setModal(null)}
          onSaved={() => {
            notify("Publication saved successfully.");
            load();
          }}
        />
      )}
    </>
  );
}

function Dashboard({ admin }: { admin: boolean }) {
  const [data, setData] = useState<any>();
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get(admin ? "/api/admin/dashboard" : "/api/faculty/dashboard")
      .then((result) => setData(result.data))
      .catch((e) => setError(apiError(e)));
  }, [admin]);
  if (error) return <div className="notice error">{error}</div>;
  if (!data) return <div className="empty">Loading dashboard...</div>;
  const stats = admin ? data.overview : data.stats;
  const charts = admin ? data : data.analytics;
  return (
    <>
      <h1 className="page-title">
        {admin ? "Institution Dashboard" : `Welcome, ${data.profile.name}`}
      </h1>
      <p className="subtle">
        {admin
          ? "Approved publications are the source for every official metric."
          : "Your approved work contributes to official research analytics."}
      </p>
      <div className="grid kpis">
        <Metric
          label="Approved publications"
          value={stats.total_publications}
          icon={<BookOpenCheck size={19} />}
        />
        <Metric
          label="Total citations"
          value={stats.total_citations}
          icon={<BarChart3 size={19} />}
        />
        <Metric
          label={admin ? "Active faculty" : "Pending review"}
          value={admin ? stats.active_faculty : stats.pending}
          icon={<Users size={19} />}
        />
        <Metric
          label={admin ? "Pending approvals" : "Average citations"}
          value={admin ? stats.pending : stats.average_citations}
          icon={<ClipboardList size={19} />}
        />
      </div>
      <div className="grid chart-grid">
        <Chart title="Publications by year" type="line" data={charts.yearly} />
        <Chart title="Publication type" type="pie" data={charts.types} />
        <Chart
          title="Indexing distribution"
          type="bar"
          data={charts.indexing}
        />
        <Chart
          title="Journal quartiles"
          type={admin ? "pie" : "bar"}
          data={charts.quartiles}
        />
      </div>
    </>
  );
}

function Profile({ notify }: { notify: (message: string) => void }) {
  const [profile, setProfile] = useState<any>();
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    api.get("/api/faculty/profile").then((r) => setProfile(r.data));
  }, []);
  if (!profile) return <div className="empty">Loading profile...</div>;
  async function save() {
    try {
      await api.put("/api/faculty/profile", {
        phone: profile.phone,
        research_areas: profile.research_areas,
      });
      setEditing(false);
      notify("Profile updated successfully.");
    } catch (e) {
      notify(apiError(e));
    }
  }
  return (
    <>
      <h1 className="page-title">My Profile</h1>
      <p className="subtle">Your institutional faculty record.</p>
      <section className="panel" style={{ marginTop: 22, maxWidth: 760 }}>
        <div className="form-grid">
          {[
            ["Full name", "name"],
            ["Faculty ID", "faculty_id"],
            ["Email", "email"],
            ["Department", "department_name"],
            ["Designation", "designation"],
            ["Joining year", "joining_year"],
          ].map(([label, key]) => (
            <label key={key}>
              {label}
              <input className="field" value={profile[key]} disabled />
            </label>
          ))}
          <label>
            Phone
            <input
              className="field"
              value={profile.phone || ""}
              disabled={!editing}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />
          </label>
          <label className="wide">
            Research areas
            <input
              className="field"
              value={(profile.research_areas || []).join(", ")}
              disabled={!editing}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  research_areas: e.target.value
                    .split(",")
                    .map((v: string) => v.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
        </div>
        <div className="actions">
          {editing ? (
            <>
              <button
                className="button secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button className="button" onClick={save}>
                Save changes
              </button>
            </>
          ) : (
            <button className="button" onClick={() => setEditing(true)}>
              Edit profile
            </button>
          )}
        </div>
      </section>
    </>
  );
}

function FacultyManagement({ notify }: { notify: (message: string) => void }) {
  const [data, setData] = useState<any>({ items: [] });
  const [departments, setDepartments] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    faculty_id: "",
    department_id: "",
    designation: "Assistant Professor",
    research_areas: "",
    joining_year: 2024,
    temporary_password: "123456",
  });
  const load = () => api.get("/api/admin/faculty").then((r) => setData(r.data));
  useEffect(() => {
    load();
    api.get("/api/admin/departments").then((r) => setDepartments(r.data));
  }, []);
  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      await api.post("/api/admin/faculty", {
        ...form,
        research_areas: form.research_areas.split(",").filter(Boolean),
      });
      setShow(false);
      notify("Faculty account created successfully.");
      load();
    } catch (e) {
      notify(apiError(e));
    }
  }
  async function toggle(item: any) {
    try {
      await api.patch(`/api/admin/faculty/${item.id}/status`, {
        status: item.status === "active" ? "inactive" : "active",
      });
      notify("Faculty account status updated.");
      load();
    } catch (e) {
      notify(apiError(e));
    }
  }
  async function edit(item: any) {
    const designation = window.prompt("Designation", item.designation);
    if (!designation?.trim()) return;
    try {
      await api.put(`/api/admin/faculty/${item.id}`, { designation: designation.trim() });
      notify("Faculty profile updated.");
      load();
    } catch (e) {
      notify(apiError(e));
    }
  }
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Faculty Management</h1>
          <p className="subtle">
            Create and maintain faculty research accounts.
          </p>
        </div>
        <button className="button" onClick={() => setShow(true)}>
          <Plus size={17} /> Add faculty
        </button>
      </div>
      <section className="panel table-wrap" style={{ marginTop: 22 }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Faculty ID</th>
              <th>Department</th>
              <th>Email</th>
              <th>Publications</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item: any) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.faculty_id}</td>
                <td>{item.department_name}</td>
                <td>{item.email}</td>
                <td>{item.publication_count}</td>
                <td>
                  <Status value={item.status} />
                </td>
                <td>
                  <button
                    className="button secondary"
                    style={{ marginRight: 6 }}
                    onClick={() => edit(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => toggle(item)}
                  >
                    {item.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {show && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={save}>
            <h2 className="page-title">Add Faculty</h2>
            <div className="form-grid">
              {[
                ["Full name", "name"],
                ["Email", "email"],
                ["Faculty ID", "faculty_id"],
                ["Designation", "designation"],
                ["Joining year", "joining_year"],
                ["Temporary password", "temporary_password"],
                ["Research areas (comma separated)", "research_areas"],
              ].map(([label, key]) => (
                <label key={key}>
                  {label}
                  <input
                    className="field"
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    required
                  />
                </label>
              ))}
              <label>
                Department
                <select
                  className="field"
                  value={form.department_id}
                  onChange={(e) =>
                    setForm({ ...form, department_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="actions">
              <button
                type="button"
                className="button secondary"
                onClick={() => setShow(false)}
              >
                Cancel
              </button>
              <button className="button">Create faculty</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function Reports({ notify }: { notify: (message: string) => void }) {
  async function download(kind: "pdf" | "excel") {
    try {
      const response = await api.get(
        `/api/admin/reports/publications/${kind}`,
        { responseType: "blob" },
      );
      const link = document.createElement("a");
      link.href = URL.createObjectURL(response.data);
      link.download = `research-publication-analytics-report.${kind === "pdf" ? "pdf" : "xlsx"}`;
      link.click();
      URL.revokeObjectURL(link.href);
      notify(`${kind.toUpperCase()} report generated.`);
    } catch (e) {
      notify(apiError(e));
    }
  }
  return (
    <>
      <h1 className="page-title">Reports</h1>
      <p className="subtle">
        Download approved publication data and institution summaries.
      </p>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          marginTop: 22,
        }}
      >
        <section className="panel">
          <FileText size={28} color="#0f766e" />
          <h3 className="panel-title" style={{ marginTop: 16 }}>
            PDF Analytics Report
          </h3>
          <p className="subtle">
            Summary metrics, yearly trends, and approved publication entries.
          </p>
          <button
            className="button"
            style={{ marginTop: 18 }}
            onClick={() => download("pdf")}
          >
            <Download size={16} /> Download PDF
          </button>
        </section>
        <section className="panel">
          <FileBarChart size={28} color="#2563eb" />
          <h3 className="panel-title" style={{ marginTop: 16 }}>
            Excel Workbook
          </h3>
          <p className="subtle">
            Summary, publications, and yearly breakdown in separate sheets.
          </p>
          <button
            className="button"
            style={{ marginTop: 18 }}
            onClick={() => download("excel")}
          >
            <Download size={16} /> Download Excel
          </button>
        </section>
      </div>
    </>
  );
}
function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    api.get("/api/admin/audit-logs").then((r) => setLogs(r.data.items));
  }, []);
  return (
    <>
      <h1 className="page-title">Audit Logs</h1>
      <p className="subtle">
        Traceable system activity for administrative review.
      </p>
      <section className="panel table-wrap" style={{ marginTop: 22 }}>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.user_email}</td>
                <td>{log.action.replaceAll("_", " ")}</td>
                <td>{log.entity_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("rpa_user") || "null");
    } catch {
      return null;
    }
  });
  const [toast, setToast] = useState("");
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3600);
  };
  const admin = user?.role === "admin";
  const defaultPath = admin ? "/admin/dashboard" : "/faculty/dashboard";
  useEffect(() => {
    if (user && !location.pathname.startsWith(`/${user.role}`))
      navigate(defaultPath, { replace: true });
  }, [user, location.pathname]);
  if (!user)
    return (
      <Login
        onLogin={(newUser) => {
          setUser(newUser);
          navigate(
            newUser.role === "admin"
              ? "/admin/dashboard"
              : "/faculty/dashboard",
          );
        }}
      />
    );
  const nav = admin
    ? [
        ["Dashboard", "/admin/dashboard", LayoutDashboard],
        ["Faculty", "/admin/faculty", Users],
        ["Publications", "/admin/publications", BookOpenCheck],
        ["Pending", "/admin/pending", ClipboardList],
        ["Analytics", "/admin/analytics", PieChart],
        ["Reports", "/admin/reports", FileBarChart],
        ["Audit Logs", "/admin/audit-logs", ShieldCheck],
      ]
    : [
        ["Dashboard", "/faculty/dashboard", LayoutDashboard],
        ["My Profile", "/faculty/profile", Users],
        ["My Publications", "/faculty/publications", BookOpenCheck],
        ["Analytics", "/faculty/analytics", BarChart3],
      ];
  let page: React.ReactNode = <Dashboard admin={!!admin} />;
  if (location.pathname.endsWith("/profile"))
    page = <Profile notify={notify} />;
  if (location.pathname.endsWith("/publications"))
    page = <Publications admin={!!admin} notify={notify} />;
  if (location.pathname.endsWith("/pending"))
    page = <Publications admin pendingOnly notify={notify} />;
  if (location.pathname.endsWith("/faculty") && admin)
    page = <FacultyManagement notify={notify} />;
  if (location.pathname.endsWith("/analytics"))
    page = <Dashboard admin={!!admin} />;
  if (location.pathname.endsWith("/reports"))
    page = <Reports notify={notify} />;
  if (location.pathname.endsWith("/audit-logs")) page = <AuditLogs />;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Building2 size={19} />
          </div>
          <span>Research Analytics</span>
        </div>
        <nav className="nav">
          {nav.map(([label, path, Icon]: any) => (
            <button
              key={path}
              className={location.pathname === path ? "active" : ""}
              onClick={() => navigate(path)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button
            className="nav button"
            onClick={() => {
              localStorage.removeItem("rpa_token");
              localStorage.removeItem("rpa_user");
              setUser(null);
              navigate("/login");
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <strong>
              {admin ? "Administrator workspace" : "Faculty workspace"}
            </strong>
            <div className="subtle">{user.email}</div>
          </div>
          <Status value={user.status} />
        </header>
        <div className="content">{page}</div>
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
export default App;
