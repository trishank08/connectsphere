import { Bell, Heart, House, LogOut, MessageCircle, Search, Settings, Sparkles, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api, { SOCKET_URL } from "../api";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

const sideLinks = [
  { to: "/", label: "Home", icon: House, end: true },
  { to: "/messages", label: "Messages", icon: MessageCircle },
];

function CountBadge({ count }) {
  if (!count) return null;
  return <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-cream">{count > 9 ? "9+" : count}</span>;
}

function notificationText(item) {
  const name = item.actor?.name || "Someone";
  if (item.type === "like") return `${name} liked your post`;
  if (item.type === "comment") return `${name} commented on your post`;
  if (item.type === "request") return `${name} sent you a connection request`;
  if (item.type === "request_accepted_by_you") return `${name} connection request accepted`;
  return `${name} accepted your connection request`;
}

export default function AppShell({ children, rightRail }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [people, setPeople] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [counts, setCounts] = useState({ unreadNotifications: 0, unreadMessages: 0 });

  const leave = async () => { await logout(); navigate("/auth"); };
  const loadCounts = async () => {
    try { const { data } = await api.get("/notifications/summary"); setCounts(data); } catch { /* badges are optional */ }
  };
  const loadPeople = async () => {
    if (people.length) return;
    try { const { data } = await api.get("/users/discover"); setPeople(data.users || []); } catch { setPeople([]); }
  };
  const openSearch = () => { setShowSearch(true); loadPeople(); };
  const openNotifications = async () => {
    const nextOpen = !showNotifications;
    setShowNotifications(nextOpen);
    if (!nextOpen) return;
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications || []);
      await api.patch("/notifications/read");
      setCounts((old) => ({ ...old, unreadNotifications: 0 }));
    } catch { setNotifications([]); }
  };
  const acceptRequest = async (item) => {
    try {
      await api.patch(`/connections/request/${item.request}/accept`);
      setNotifications((old) => old.map((note) => note._id === item._id ? { ...note, type: "request_accepted_by_you" } : note));
      loadCounts();
    } catch { /* stale requests can be safely ignored */ }
  };

  useEffect(() => {
    loadCounts();
    const socket = io(SOCKET_URL, { withCredentials: true });
    socket.emit("join", user._id);
    socket.on("notification:new", (item) => {
      setNotifications((old) => [item, ...old.filter((note) => note._id !== item._id)]);
      loadCounts();
    });
    socket.on("counts:refresh", loadCounts);
    return () => socket.disconnect();
  }, [user._id]);

  const results = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return people.slice(0, 6);
    return people.filter((person) => `${person.name} ${person.username} ${person.bio || ""}`.toLowerCase().includes(query)).slice(0, 8);
  }, [people, searchText]);
  const choosePerson = (person) => { setShowSearch(false); setSearchText(""); navigate(`/profile/${person.username}`); };
  const SearchResults = () => <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">{results.length ? results.map((person) => <button key={person._id} onClick={() => choosePerson(person)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-lavender/5"><Avatar user={person} size="sm" /><span className="min-w-0"><span className="block truncate text-sm font-bold">{person.name}</span><span className="block truncate text-xs text-slate-500">@{person.username}</span></span></button>) : <p className="px-4 py-5 text-center text-sm text-slate-500">No people found.</p>}</div>;

  return <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,#ebe8ff_0,transparent_23%),radial-gradient(circle_at_90%_28%,#e8f7f0_0,transparent_20%)]">
    <header className="sticky top-0 z-30 border-b border-white/70 bg-cream/80 backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10"><Link to="/" className="flex min-w-0 items-center gap-2.5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-ink text-lg font-bold text-white shadow-glow">C</span><span className="truncate font-serif text-2xl font-bold tracking-tight max-[430px]:hidden">connectSphere</span></Link><div className="relative hidden w-full max-w-sm md:block"><div className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/65 px-4 py-2.5"><Search size={17} className="text-slate-400" /><input value={searchText} onFocus={openSearch} onChange={(event) => { setSearchText(event.target.value); openSearch(); }} aria-label="Search people" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search people and ideas" /></div>{showSearch && <SearchResults />}</div><div className="flex shrink-0 items-center gap-2"><button onClick={openSearch} className="icon-button md:hidden" aria-label="Search"><Search size={18} /></button><button onClick={openNotifications} className="icon-button relative" aria-label="Notifications"><Bell size={18} /><CountBadge count={counts.unreadNotifications} /></button><Link to={`/profile/${user.username}`} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 text-sm font-semibold hover:bg-white"><Avatar user={user} size="sm" /><span className="hidden sm:block">{user.name.split(" ")[0]}</span></Link></div></div></header>
    {showSearch && <div className="fixed inset-0 z-40 bg-ink/25 p-4 pt-20 backdrop-blur-sm md:hidden"><div className="mx-auto max-w-lg rounded-[26px] bg-cream p-4 shadow-2xl"><div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3"><Search size={18} className="text-slate-400" /><input autoFocus value={searchText} onChange={(event) => setSearchText(event.target.value)} className="w-full bg-transparent py-3 text-sm outline-none" placeholder="Search people" /><button onClick={() => setShowSearch(false)} aria-label="Close search"><X size={18} /></button></div><SearchResults /></div></div>}
    {showNotifications && <section className="fixed right-4 top-20 z-40 w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-[26px] border border-white bg-[#fcfcfa] shadow-2xl"><div className="flex items-center justify-between border-b p-4"><div><p className="font-serif text-xl font-bold">Notifications</p><p className="text-xs text-slate-500">Your latest activity</p></div><button onClick={() => setShowNotifications(false)} className="icon-button h-8 w-8" aria-label="Close notifications"><X size={16} /></button></div><div className="max-h-[65vh] overflow-y-auto">{notifications.length ? notifications.map((item) => <div key={item._id} className="flex gap-3 border-b border-slate-100 p-4 last:border-0"><Link to={`/profile/${item.actor?.username}`} onClick={() => setShowNotifications(false)}><Avatar user={item.actor} size="sm" /></Link><div className="min-w-0 flex-1"><p className="text-sm leading-5 text-slate-700"><button onClick={() => { setShowNotifications(false); navigate(`/profile/${item.actor?.username}`); }} className="font-bold hover:text-lavender">{item.actor?.name}</button> {notificationText(item).replace(`${item.actor?.name} `, "")}</p><p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>{item.type === "request" && <button onClick={() => acceptRequest(item)} className="mt-2 inline-flex items-center gap-1 rounded-lg bg-lavender px-3 py-1.5 text-xs font-bold text-white"><UserPlus size={13} />Accept request</button>}</div></div>) : <div className="p-8 text-center"><Bell className="mx-auto text-lavender" /><p className="mt-3 text-sm text-slate-500">No notifications yet.</p></div>}</div></section>}
    <main className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[220px_minmax(0,680px)_280px] lg:px-10"><aside className="hidden lg:block"><div className="glass sticky top-24 rounded-[26px] p-3"><div className="mb-3 rounded-2xl bg-gradient-to-br from-[#e3e0ff] via-[#faf4f1] to-[#d9f4e7] p-3"><Link to={`/profile/${user.username}`} className="flex items-center gap-3"><Avatar user={user} size="md" /><div className="min-w-0"><p className="truncate text-sm font-bold">{user.name}</p><p className="truncate text-xs text-slate-500">@{user.username}</p></div></Link></div><nav className="space-y-1">{sideLinks.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link relative ${isActive ? "active" : ""}`}><Icon size={18} />{label}{label === "Messages" && <span className="relative ml-auto"><CountBadge count={counts.unreadMessages} /></span>}</NavLink>)}<NavLink to={`/profile/${user.username}`} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><Settings size={18} />Profile & settings</NavLink></nav><div className="my-3 border-t border-slate-200/70" /><button onClick={leave} className="nav-link w-full"><LogOut size={18} />Log out</button></div><p className="px-3 pt-4 text-xs leading-5 text-slate-400">Made for sharing small, bright moments.</p></aside><section className="min-w-0 animate-float-in">{children}</section><aside className="hidden lg:block">{rightRail || <DefaultRail />}</aside></main>
    <nav className="glass fixed inset-x-4 bottom-4 z-30 flex items-center justify-around rounded-2xl p-2 lg:hidden"><NavLink to="/" end className={({ isActive }) => `grid h-11 w-12 place-items-center rounded-xl ${isActive ? "bg-lavender text-white" : "text-slate-500"}`}><House size={21} /></NavLink><NavLink to="/messages" className={({ isActive }) => `relative grid h-11 w-12 place-items-center rounded-xl ${isActive ? "bg-lavender text-white" : "text-slate-500"}`}><MessageCircle size={21} /><CountBadge count={counts.unreadMessages} /></NavLink><NavLink to={`/profile/${user.username}`} className={({ isActive }) => `grid h-11 w-12 place-items-center rounded-xl ${isActive ? "bg-lavender text-white" : "text-slate-500"}`}><Avatar user={user} size="sm" /></NavLink><button onClick={leave} aria-label="Log out" className="grid h-11 w-12 place-items-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-500"><LogOut size={20} /></button></nav>
  </div>;
}

export function DefaultRail() {
  return <div className="sticky top-24 space-y-5"><div className="glass rounded-[26px] p-5"><div className="mb-4 flex items-center gap-2"><Sparkles size={17} className="text-lavender" /><h2 className="font-serif text-xl font-bold">Good to know</h2></div><div className="space-y-4 text-sm"><article><p className="font-semibold">Keep it kind.</p><p className="mt-1 leading-5 text-slate-500">ConnectSphere is a little corner for good conversations and fresh ideas.</p></article><article><p className="font-semibold">Share a moment.</p><p className="mt-1 leading-5 text-slate-500">A photo, a lesson, or just something that made you smile.</p></article></div></div><div className="rounded-[26px] bg-ink p-5 text-white shadow-soft"><Heart size={19} className="mb-5 fill-[#f2a6c7] text-[#f2a6c7]" /><p className="font-serif text-xl font-bold leading-7">“Make room for the small things.”</p><p className="mt-3 text-xs text-white/55">— your ConnectSphere reminder</p></div></div>;
}
