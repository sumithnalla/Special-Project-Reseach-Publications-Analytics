import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart3,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ClipboardList,
  Download,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
const palette = ["#a990e6", "#83cfae", "#92b8f1", "#eec18f", "#89a77b"];
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
      <div className="chart-canvas">
        <ResponsiveContainer>
          {type === "line" ? (
            <LineChart data={normalized}>
              <CartesianGrid stroke="#e9edeb" strokeDasharray="4 5" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#78838a", fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={14} />
              <YAxis allowDecimals={false} tick={{ fill: "#78838a", fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name="Publications"
                stroke="#9279d4"
                strokeWidth={3}
                dot={{ r: 4, fill: "#9279d4", strokeWidth: 0 }}
              />
            </LineChart>
          ) : type === "bar" ? (
            <BarChart data={normalized}>
              <CartesianGrid stroke="#e9edeb" strokeDasharray="4 5" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#78838a", fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={14} />
              <YAxis allowDecimals={false} tick={{ fill: "#78838a", fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
              <Tooltip />
              <Bar
                dataKey="value"
                name="Publications"
                fill="#8ecfae"
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
  notify,
}: {
  admin: boolean;
  notify: (message: string) => void;
}) {
  const [data, setData] = useState<any>({ items: [] });
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [publicationType, setPublicationType] = useState("");
  const [indexing, setIndexing] = useState("");
  const [year, setYear] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<Publication | undefined | null>(null);
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    try {
      const { data: result } = await api.get(
        admin ? "/api/admin/publications" : "/api/faculty/publications",
        {
          params: {
            page,
            page_size: 50,
            search: appliedSearch || undefined,
            status: status || undefined,
            publication_type: publicationType || undefined,
            indexing: indexing || undefined,
            year: year || undefined,
            department_id: admin ? departmentId || undefined : undefined,
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
  }, [page, status, publicationType, indexing, year, departmentId, appliedSearch, admin]);
  useEffect(() => {
    if (admin) api.get("/api/admin/departments").then((r) => setDepartments(r.data)).catch((e) => notify(apiError(e)));
  }, [admin]);
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
      notify(kind === "delete" ? "Publication deleted." : kind === "approve" ? "Publication approved." : "Publication rejected.");
      if (kind === "delete" && data.items.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (e) {
      notify(apiError(e));
    }
  }
  return (
    <>
      <div className="page-heading-row">
        <div>
          <h1 className="page-title">{admin ? "Publications" : "My Publications"}</h1>
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
          onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); setAppliedSearch(search.trim()); } }}
        />
        <select
          className="field"
          value={status}
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
        <select className="field" value={publicationType} onChange={(e) => { setPublicationType(e.target.value); setPage(1); }} aria-label="Publication type">
          <option value="">All types</option>
          <option value="journal">Journal</option><option value="conference">Conference</option><option value="book_chapter">Book chapter</option>
        </select>
        <select className="field" value={indexing} onChange={(e) => { setIndexing(e.target.value); setPage(1); }} aria-label="Indexing">
          <option value="">All indexing</option>
          {["Scopus", "Web of Science", "UGC/Other", "Not Indexed"].map((value) => <option key={value}>{value}</option>)}
        </select>
        <input className="field year-filter" type="number" min="2020" max="2100" placeholder="Year" value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }} aria-label="Publication year" />
        {admin && <select className="field" value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); setPage(1); }} aria-label="Department">
          <option value="">All departments</option>
          {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
        </select>}
        <button
          className="button secondary"
          onClick={() => {
            setPage(1);
            setAppliedSearch(search.trim());
            if (search.trim() === appliedSearch && page === 1) load();
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
                <th>#</th>
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
              {data.items.map((item: Publication, index: number) => (
                <tr key={item.id}>
                  <td>{(page - 1) * 50 + index + 1}</td>
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
                  <td><div className="row-actions">
                    <button
                      className="icon-button"
                      title="Edit publication"
                      onClick={() => setModal(item)}
                    >
                      <Pencil size={16} />
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
                        <XCircle size={16} />
                      </button>
                    )}
                    <button
                      className="icon-button"
                      title="Delete publication"
                      onClick={() => action(item.id, "delete")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">No publications match these filters.</div>
        )}
        <div className="pagination">
          <span>Showing {data.total ? (page - 1) * 50 + 1 : 0}-{Math.min(page * 50, data.total || 0)} of {data.total || 0}</span>
          <span className="page-controls">
            <button
              className="icon-button"
              title="Previous page"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              &lt;
            </button>
            {Array.from({ length: data.total_pages || 1 }, (_: unknown, i: number) => i + 1).filter((number: number) => number === 1 || number === data.total_pages || Math.abs(number - page) <= 2).map((number: number) => <button key={number} className={`icon-button ${page === number ? "current-page" : ""}`} aria-label={`Page ${number}`} aria-current={page === number ? "page" : undefined} onClick={() => setPage(number)}>{number}</button>)}
            <button
              className="icon-button"
              title="Next page"
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
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const designations = ["Assistant Professor", "Associate Professor", "Professor", "HOD", "Lecturer", "Senior Lecturer", "Research Professor", "Visiting Professor"];
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
  const load = () => api.get("/api/admin/faculty", { params: { page_size: 100 } }).then((r) => setData(r.data));
  useEffect(() => {
    load();
    api.get("/api/admin/departments").then((r) => setDepartments(r.data));
  }, []);
  async function save(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await api.post("/api/admin/faculty", {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        faculty_id: form.faculty_id.trim().toUpperCase(),
        joining_year: Number(form.joining_year),
        research_areas: form.research_areas.split(",").map((area: string) => area.trim()).filter(Boolean),
      });
      setShow(false);
      setForm({ name: "", email: "", faculty_id: "", department_id: "", designation: "Assistant Professor", research_areas: "", joining_year: new Date().getFullYear(), temporary_password: "123456" });
      notify("Faculty account created successfully.");
      load();
    } catch (e) {
      setFormError(apiError(e));
    } finally {
      setSaving(false);
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
  async function edit(item: any, designation: string) {
    try {
      await api.put(`/api/admin/faculty/${item.id}`, { designation });
      notify("Faculty profile updated.");
      load();
    } catch (e) {
      notify(apiError(e));
    }
  }
  return (
    <>
      <div className="page-heading-row">
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
                  <select className="field" aria-label={`Designation for ${item.name}`} value={item.designation} onChange={(e) => edit(item, e.target.value)} style={{ marginRight: 6 }}>
                    {!designations.includes(item.designation) && <option value={item.designation}>{item.designation}</option>}
                    {designations.map((designation) => <option key={designation}>{designation}</option>)}
                  </select>
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
            {formError && <div className="notice error" role="alert">{formError}</div>}
            <div className="form-grid">
              {[
                ["Full name", "name"],
                ["Email", "email"],
                ["Faculty ID", "faculty_id"],
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
              <label>Designation
                <select className="field" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}>
                  {designations.map((designation) => <option key={designation}>{designation}</option>)}
                </select>
              </label>
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
              <button className="button" disabled={saving}>{saving ? "Creating..." : "Create faculty"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function Reports({ notify }: { notify: (message: string) => void }) {
  const [options, setOptions] = useState<any>({ departments: [], faculty: [] });
  const [filters, setFilters] = useState<any>({ faculty_id: "", department_id: "", topic: "", publication_type: "", status: "approved", date_from: "", date_to: "" });
  const [summary, setSummary] = useState<any>();
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState("");
  const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""));
  useEffect(() => {
    api.get("/api/admin/reports/options").then((response) => setOptions(response.data)).catch((e) => setError(apiError(e)));
  }, []);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      api.get("/api/admin/reports/publications/summary", { params }).then((response) => {
        if (active) { setSummary(response.data); setError(""); }
      }).catch((e) => { if (active) { setSummary(undefined); setError(apiError(e)); } });
    }, 300);
    return () => { active = false; window.clearTimeout(timer); };
  }, [filters]);
  const change = (key: string, value: string) => setFilters((current: any) => ({ ...current, [key]: value, ...(key === "department_id" ? { faculty_id: "" } : {}) }));
  async function download(kind: "pdf" | "csv" | "excel") {
    setDownloading(kind);
    try {
      const response = await api.get(
        `/api/admin/reports/publications/${kind}`,
        { responseType: "blob", params },
      );
      const link = document.createElement("a");
      const url = URL.createObjectURL(response.data);
      link.href = url;
      link.download = `research-publication-analytics-report.${kind === "excel" ? "xlsx" : kind}`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify(`${kind.toUpperCase()} report generated.`);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.data instanceof Blob) {
        try { notify(JSON.parse(await e.response.data.text()).detail || apiError(e)); }
        catch { notify(apiError(e)); }
      } else notify(apiError(e));
    } finally {
      setDownloading("");
    }
  }
  return (
    <>
      <h1 className="page-title">Reports</h1>
      <p className="subtle">Publication report</p>
      <section className="panel report-panel">
        <div className="report-filters">
          <label>Department<select className="field" value={filters.department_id} onChange={(e) => change("department_id", e.target.value)}><option value="">All departments</option>{options.departments.map((item: any) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Faculty<select className="field" value={filters.faculty_id} onChange={(e) => change("faculty_id", e.target.value)}><option value="">All faculty</option>{options.faculty.filter((item: any) => !filters.department_id || item.department_id === filters.department_id).map((item: any) => <option key={item.id} value={item.id}>{item.name} ({item.faculty_id})</option>)}</select></label>
          <label>Research topic<input className="field" value={filters.topic} onChange={(e) => change("topic", e.target.value)} placeholder="Title, abstract, or area" /></label>
          <label>Type<select className="field" value={filters.publication_type} onChange={(e) => change("publication_type", e.target.value)}><option value="">All types</option><option value="journal">Journal</option><option value="conference">Conference</option><option value="book_chapter">Book chapter</option></select></label>
          <label>Status<select className="field" value={filters.status} onChange={(e) => change("status", e.target.value)}><option value="all">All statuses</option><option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option></select></label>
          <label>Submitted from<input className="field" type="date" value={filters.date_from} onChange={(e) => change("date_from", e.target.value)} /></label>
          <label>Submitted through<input className="field" type="date" value={filters.date_to} onChange={(e) => change("date_to", e.target.value)} /></label>
        </div>
        {error && <div className="notice error" role="alert">{error}</div>}
        {summary && <div className="report-summary">
          <div><strong>{summary.total_publications.toLocaleString()}</strong><span>Publications</span></div>
          <div><strong>{summary.total_citations.toLocaleString()}</strong><span>Citations</span></div>
          <div><strong>{summary.average_citations}</strong><span>Average citations</span></div>
          <div><strong>{summary.faculty_count}</strong><span>Faculty</span></div>
        </div>}
        <div className="report-actions">
          {(["csv", "pdf", "excel"] as const).map((kind) => <button key={kind} className="button secondary" disabled={!!downloading || !!error} onClick={() => download(kind)}><Download size={16} /> {downloading === kind ? "Generating..." : `Download ${kind === "excel" ? "Excel" : kind.toUpperCase()}`}</button>)}
        </div>
      </section>
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3600);
  };
  const admin = user?.role === "admin";
  const defaultPath = admin ? "/admin/dashboard" : "/faculty/dashboard";
  const validPaths = admin
    ? ["/admin/dashboard", "/admin/faculty", "/admin/publications", "/admin/reports", "/admin/audit-logs"]
    : ["/faculty/dashboard", "/faculty/profile", "/faculty/publications"];
  useEffect(() => {
    if (user && !validPaths.includes(location.pathname))
      navigate(defaultPath, { replace: true });
  }, [user, location.pathname]);
  useEffect(() => setMobileNavOpen(false), [location.pathname]);
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
        ["Reports", "/admin/reports", FileBarChart],
        ["Audit Logs", "/admin/audit-logs", ShieldCheck],
      ]
    : [
        ["Dashboard", "/faculty/dashboard", LayoutDashboard],
        ["My Profile", "/faculty/profile", Users],
        ["My Publications", "/faculty/publications", BookOpenCheck],
      ];
  const currentPage = String(nav.find(([, path]) => path === location.pathname)?.[0] || "Dashboard");
  let page: React.ReactNode = <Dashboard admin={!!admin} />;
  if (location.pathname.endsWith("/profile"))
    page = <Profile notify={notify} />;
  if (location.pathname.endsWith("/publications"))
    page = <Publications admin={!!admin} notify={notify} />;
  if (location.pathname.endsWith("/faculty") && admin)
    page = <FacultyManagement notify={notify} />;
  if (location.pathname.endsWith("/reports"))
    page = <Reports notify={notify} />;
  if (location.pathname.endsWith("/audit-logs")) page = <AuditLogs />;
  return (
    <div className="app-shell">
      {mobileNavOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <aside id="app-sidebar" className={`sidebar ${mobileNavOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Building2 size={19} />
          </div>
          <span>Research Analytics</span>
          <button className="sidebar-close icon-button" title="Close navigation" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}><X size={18} /></button>
        </div>
        <div className="sidebar-section-label">Workspace</div>
        <nav className="nav" aria-label="Main navigation">
          {nav.map(([label, path, Icon]: any) => (
            <button
              key={path}
              className={location.pathname === path ? "active" : ""}
              aria-current={location.pathname === path ? "page" : undefined}
              onClick={() => navigate(path)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-profile">
            <span className="avatar avatar-large">{user.email.slice(0, 2).toUpperCase()}</span>
            <strong>{admin ? "Administrator" : "Faculty member"}</strong>
            <small title={user.email}>{user.email}</small>
          </div>
          <button
            className="logout-button"
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
          <div className="topbar-heading">
            <button className="mobile-menu icon-button" title="Open navigation" aria-label="Open navigation" aria-controls="app-sidebar" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
            <div>
              <span className="topbar-kicker">Research Analytics / {currentPage}</span>
              <strong>{admin ? "Administrator workspace" : "Faculty workspace"}</strong>
            </div>
          </div>
          <div className="topbar-user">
            <Status value={user.status} />
            <span className="avatar">{user.email.slice(0, 2).toUpperCase()}</span>
            <span className="topbar-user-name" title={user.email}>{user.email}</span>
          </div>
        </header>
        <div className="content">{page}</div>
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
export default App;
