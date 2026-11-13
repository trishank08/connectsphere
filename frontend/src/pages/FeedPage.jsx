import { RefreshCw, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import AppShell from "../components/AppShell";
import Avatar from "../components/Avatar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => { setLoading(true); try { const [postData, userData] = await Promise.all([api.get("/posts"), api.get("/users/discover")]); setPosts(postData.data.posts); setPeople(userData.data.users.slice(0, 4)); } catch (err) { setError(err.response?.data?.message || "Couldn't load your feed."); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const createPost = async ({ caption, image }) => { const formData = new FormData(); formData.append("caption", caption); if (image) formData.append("image", image); const { data } = await api.post("/posts", formData); setPosts((old) => [data.post, ...old]); };
  const like = async (postId) => { const { data } = await api.patch(`/posts/${postId}/like`); setPosts((old) => old.map((post) => post._id === postId ? { ...post, likes: data.likes } : post)); };
  const comment = async (postId, text) => { const { data } = await api.post(`/posts/${postId}/comments`, { text }); setPosts((old) => old.map((post) => post._id === postId ? { ...post, comments: data.comments } : post)); };
  const rail = <div className="sticky top-24 space-y-5"><div className="glass rounded-[26px] p-5"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><UsersRound size={17} className="text-lavender" /><h2 className="font-serif text-xl font-bold">People to meet</h2></div><span className="text-xs text-slate-400">{people.length} nearby</span></div><div className="space-y-4">{people.length ? people.map((person) => <Link key={person._id} to={`/profile/${person.username}`} className="flex items-center gap-3"><Avatar user={person} size="sm" /><div className="min-w-0"><p className="truncate text-sm font-semibold">{person.name}</p><p className="truncate text-xs text-slate-500">@{person.username}</p></div><span className="ml-auto text-xs font-bold text-lavender">View</span></Link>) : <p className="text-sm text-slate-500">New faces will appear here.</p>}</div></div><div className="rounded-[26px] bg-gradient-to-br from-[#e6e2ff] to-[#f7edf4] p-5"><p className="text-sm font-bold text-lavender">DAILY NUDGE</p><p className="mt-2 font-serif text-xl font-bold leading-7">What made you pause today?</p><p className="mt-2 text-sm leading-5 text-slate-500">There’s probably a story in it.</p></div></div>;
  return <AppShell rightRail={rail}><div className="pb-24 lg:pb-8"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-lavender">Your space</p><h1 className="mt-1 font-serif text-3xl font-bold sm:text-4xl">Today, softly.</h1></div><button onClick={load} className="icon-button" aria-label="Refresh feed"><RefreshCw size={18} /></button></div><CreatePost user={user} onCreate={createPost} />{error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}<div className="mt-5 space-y-5">{loading ? [1, 2].map((i) => <div key={i} className="glass h-64 animate-pulse rounded-[26px]" />) : posts.length ? posts.map((post) => <PostCard key={post._id} post={post} currentUser={user} onLike={like} onComment={comment} />) : <div className="glass rounded-[26px] px-8 py-14 text-center"><span className="text-4xl">✦</span><h2 className="mt-3 font-serif text-2xl font-bold">Your feed is waiting.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Be the first one to turn an ordinary moment into a small story.</p></div>}</div></div></AppShell>;
}
