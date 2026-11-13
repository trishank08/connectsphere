import { Camera, ChevronLeft, KeyRound, Pencil, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import AppShell from "../components/AppShell";
import Avatar from "../components/Avatar";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState({ name: "", username: "", bio: "" });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const mine = String(profile?._id || "") === String(currentUser?._id || "");
  const load = async () => { try { const { data } = await api.get(`/users/${username}`); setProfile(data.user); setPosts(data.posts); setSettings({ name: data.user.name, username: data.user.username, bio: data.user.bio || "" }); } catch (err) { setError(err.response?.data?.message || "Couldn't find this profile."); } };
  useEffect(() => { load(); }, [username]);
  const saveProfile = async (event) => { event.preventDefault(); setSaving(true); setError(""); setNotice(""); try { const formData = new FormData(); formData.append("name", settings.name); formData.append("username", settings.username); formData.append("bio", settings.bio); if (photo) formData.append("avatar", photo); const { data } = await api.patch("/users/me/profile", formData); setUser(data.user); setProfile(data.user); setEditing(false); setPhoto(null); setPhotoPreview(""); setNotice("Profile saved beautifully."); if (data.user.username !== username) navigate(`/profile/${data.user.username}`, { replace: true }); } catch (err) { setError(err.response?.data?.message || "Couldn't save those changes."); } finally { setSaving(false); } };
  const savePassword = async (event) => { event.preventDefault(); setError(""); setNotice(""); try { const { data } = await api.patch("/users/me/password", password); setNotice(data.message); setPassword({ currentPassword: "", newPassword: "" }); } catch (err) { setError(err.response?.data?.message || "Couldn't update password."); } };
  const choosePhoto = (file) => { if (file) { setPhoto(file); setPhotoPreview(URL.createObjectURL(file)); } };
  const openEditor = () => {
    setEditing(true);
    setTimeout(() => document.getElementById("profile-editor")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  };
  const like = async (postId) => { const { data } = await api.patch(`/posts/${postId}/like`); setPosts((old) => old.map((post) => post._id === postId ? { ...post, likes: data.likes } : post)); };
  const comment = async (postId, text) => { const { data } = await api.post(`/posts/${postId}/comments`, { text }); setPosts((old) => old.map((post) => post._id === postId ? { ...post, comments: data.comments } : post)); };
  if (error && !profile) return <AppShell><div className="glass rounded-[26px] p-8"><p className="font-serif text-2xl font-bold">{error}</p><Link to="/" className="mt-3 inline-block text-sm font-bold text-lavender">Return home</Link></div></AppShell>;
  if (!profile) return <AppShell><div className="glass h-80 animate-pulse rounded-[26px]" /></AppShell>;
  return <AppShell rightRail={mine ? <SettingsRail password={password} setPassword={setPassword} savePassword={savePassword} /> : null}><div className="pb-24 lg:pb-0"><Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-lavender"><ChevronLeft size={17} /> Back to home</Link><section className="glass overflow-hidden rounded-[28px]"><div className="h-28 bg-[linear-gradient(120deg,#dcd7ff,#fbe9e3_50%,#cceede)] sm:h-40" /><div className="relative px-5 pb-5 sm:px-7 sm:pb-7"><div className="absolute -top-11 flex items-end gap-3 sm:-top-14"><div className="relative">{photoPreview ? <img src={photoPreview} alt="New profile" className="h-24 w-24 rounded-full object-cover ring-4 ring-white sm:h-28 sm:w-28" /> : <Avatar user={profile} size="xl" className="!h-24 !w-24 sm:!h-28 sm:!w-28" />}{mine && editing && <label className="absolute bottom-0 right-0 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-ink text-white shadow-lg"><Camera size={15} /><input type="file" accept="image/*" className="hidden" onChange={(e) => choosePhoto(e.target.files[0])} /></label>}</div></div><div className="flex min-h-20 items-start justify-end gap-2 pt-4"><button onClick={() => mine ? (editing ? setEditing(false) : openEditor()) : navigate(`/messages?to=${profile._id}&username=${profile.username}&name=${encodeURIComponent(profile.name)}`)} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${mine ? "bg-ink text-white hover:bg-lavender" : "bg-lavender/10 text-lavender hover:bg-lavender hover:text-white"}`}>{mine ? <span className="flex items-center gap-2">{editing ? <X size={16} /> : <Pencil size={15} />}{editing ? "Cancel" : "Edit profile"}</span> : "Say hello"}</button>{!mine && <ConnectionAction profile={profile} />}</div><div className="mt-1"><h1 className="font-serif text-3xl font-bold">{profile.name}</h1><p className="mt-1 text-sm text-slate-500">@{profile.username}</p><p className="mt-4 text-xs font-bold uppercase tracking-[.15em] text-slate-400">About</p><p className="mt-1 max-w-lg text-sm leading-6 text-slate-600">{profile.bio || "Quietly figuring it out, one day at a time."}</p><div className="mt-5 flex gap-6"><div><p className="font-serif text-xl font-bold">{posts.length}</p><p className="text-xs text-slate-500">posts</p></div><div><p className="font-serif text-xl font-bold">{profile.createdAt ? new Date(profile.createdAt).getFullYear() : "2026"}</p><p className="text-xs text-slate-500">joined</p></div></div></div></div></section><ConnectionSection profile={profile} />{mine && editing && <form id="profile-editor" onSubmit={saveProfile} className="glass mt-5 rounded-[26px] p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-lavender">Profile studio</p><h2 className="mt-1 font-serif text-2xl font-bold">Edit your about section.</h2></div></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Name<input value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} className="field mt-2" /></label><label className="text-sm font-semibold">Username<input value={settings.username} onChange={(e) => setSettings({ ...settings, username: e.target.value })} className="field mt-2" /></label></div><label className="mt-4 block text-sm font-semibold">About<textarea value={settings.bio} onChange={(e) => setSettings({ ...settings, bio: e.target.value })} className="field mt-2 min-h-24 resize-none" maxLength="160" placeholder="A little line about you..." /></label>{error && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}<button disabled={saving} className="mt-5 flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white shadow-glow hover:bg-lavender"><Save size={16} />{saving ? "Saving..." : "Save changes"}</button></form>}{notice && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}<div className="mt-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-lavender">Recent moments</p><h2 className="mt-1 font-serif text-3xl font-bold">From {mine ? "you" : profile.name.split(" ")[0]}</h2><div className="mt-5 space-y-5">{posts.length ? posts.map((post) => <PostCard key={post._id} post={post} currentUser={currentUser} onLike={like} onComment={comment} />) : <div className="glass rounded-[26px] p-10 text-center text-sm text-slate-500">No posts yet — a blank page is a lovely place to start.</div>}</div></div></div></AppShell>;
}

function SettingsRail({ password, setPassword, savePassword }) { return <form onSubmit={savePassword} className="glass sticky top-24 rounded-[26px] p-5"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-lavender/10 text-lavender"><KeyRound size={16} /></span><h2 className="font-serif text-xl font-bold">Security</h2></div><p className="mt-3 text-sm leading-5 text-slate-500">A fresh password keeps your corner private.</p><label className="mt-4 block text-xs font-bold">CURRENT PASSWORD<input value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} type="password" className="field mt-1.5 !py-2.5" required /></label><label className="mt-3 block text-xs font-bold">NEW PASSWORD<input value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} type="password" className="field mt-1.5 !py-2.5" minLength="6" required /></label><button className="mt-4 w-full rounded-xl bg-lavender py-2.5 text-sm font-bold text-white shadow-glow">Update password</button></form>; }

function ConnectionAction({ profile }) {
  const [relation, setRelation] = useState({ status: "loading" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/connections/status/${profile._id}`).then(({ data }) => setRelation(data)).catch(() => setRelation({ status: "none" }));
  }, [profile._id]);

  const act = async () => {
    if (relation.status === "accepted" || relation.status === "pending" && relation.direction === "sent") return;
    setBusy(true);
    try {
      if (relation.status === "pending" && relation.direction === "received") {
        await api.patch(`/connections/request/${relation.requestId}/accept`);
        setRelation({ ...relation, status: "accepted" });
      } else {
        const { data } = await api.post(`/connections/request/${profile._id}`);
        setRelation({ status: "pending", direction: "sent", requestId: data.request._id });
      }
    } finally { setBusy(false); }
  };

  const label = relation.status === "accepted" ? "Connected" : relation.status === "pending" && relation.direction === "received" ? "Accept request" : relation.status === "pending" ? "Request sent" : "Connect";
  return <button disabled={busy || relation.status === "loading" || relation.status === "accepted" || relation.status === "pending" && relation.direction === "sent"} onClick={act} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${relation.status === "accepted" ? "bg-emerald-50 text-emerald-700" : "bg-lavender text-white hover:bg-ink"}`}>{busy ? "Working..." : label}</button>;
}

function ConnectionSection({ profile }) {
  const [open, setOpen] = useState(false);
  const [connections, setConnections] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const loadConnections = async () => {
    if (loaded) return;
    try {
      const { data } = await api.get(`/connections/profile/${profile._id}`);
      setConnections(data.connections || []);
    } finally { setLoaded(true); }
  };
  const toggle = () => { setOpen((value) => !value); loadConnections(); };

  return <section className="glass mt-5 rounded-[26px] p-5 sm:p-6"><button onClick={toggle} className="flex w-full items-center justify-between text-left"><span><span className="block text-xs font-bold uppercase tracking-[.16em] text-lavender">Community</span><span className="mt-1 block font-serif text-2xl font-bold">Connections</span></span><span className="rounded-xl bg-lavender/10 px-3 py-2 text-sm font-bold text-lavender">{loaded ? connections.length : "View"} {loaded ? "connections" : ""}</span></button>{open && <div className="mt-5 border-t border-slate-100 pt-4">{connections.length ? <div className="grid gap-3 sm:grid-cols-2">{connections.map((person) => <Link key={person._id} to={`/profile/${person.username}`} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition hover:bg-lavender/10"><Avatar user={person} size="sm" /><span className="min-w-0"><span className="block truncate text-sm font-bold">{person.name}</span><span className="block truncate text-xs text-slate-500">@{person.username}</span></span></Link>)}</div> : <p className="py-3 text-sm text-slate-500">No connections to show yet.</p>}</div>}</section>;
}
