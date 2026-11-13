import { Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Avatar from "./Avatar";

const ago = (date) => {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(date)) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

export default function PostCard({ post, currentUser, onLike, onComment }) {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const liked = post.likes.some((id) => String(id._id || id) === currentUser._id);
  const submit = async (event) => { event.preventDefault(); if (!comment.trim()) return; await onComment(post._id, comment); setComment(""); setShowComments(true); };
  return <article className="glass overflow-hidden rounded-[26px] p-4 sm:p-5"><div className="flex items-center gap-3"><Link to={`/profile/${post.user.username}`}><Avatar user={post.user} size="md" /></Link><div className="min-w-0 flex-1"><Link to={`/profile/${post.user.username}`} className="block truncate text-sm font-bold hover:text-lavender">{post.user.name}</Link><p className="text-xs text-slate-500">@{post.user.username} · {ago(post.createdAt)}</p></div><button className="icon-button h-8 w-8" aria-label="Post options"><MoreHorizontal size={18} /></button></div>{post.caption && <p className="whitespace-pre-wrap px-1 pb-4 pt-4 text-[15px] leading-6 text-slate-700">{post.caption}</p>}{post.image && <img src={post.image} alt="Post content" className="max-h-[560px] w-full rounded-2xl object-cover" />}<div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-3 text-xs text-slate-500"><span>{post.likes.length ? `${post.likes.length} ${post.likes.length === 1 ? "like" : "likes"}` : "Be the first to like this"}</span><button onClick={() => setShowComments((value) => !value)}>{post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}</button></div><div className="flex gap-2 py-2"><button onClick={() => onLike(post._id)} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${liked ? "bg-rose-50 text-rose-500" : "text-slate-500 hover:bg-slate-100"}`}><Heart size={18} className={liked ? "fill-current" : ""} /> Like</button><button onClick={() => setShowComments(true)} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"><MessageCircle size={18} /> Comment</button></div>{showComments && <div className="border-t border-slate-100 pt-3"><div className="space-y-3">{post.comments.map((item) => <div key={item._id} className="flex gap-2"><Avatar user={item.user} size="xs" /><div className="rounded-2xl bg-slate-100/80 px-3 py-2"><p className="text-xs font-bold">{item.user.name} <span className="font-normal text-slate-400">@{item.user.username}</span></p><p className="mt-0.5 text-sm text-slate-600">{item.text}</p></div></div>)}</div><form onSubmit={submit} className="mt-3 flex items-center gap-2"><Avatar user={currentUser} size="xs" /><input value={comment} onChange={(e) => setComment(e.target.value)} className="field !py-2" placeholder="Write a kind comment..." maxLength="400" /><button className="icon-button h-9 w-9 shrink-0" aria-label="Send comment"><Send size={16} /></button></form></div>}</article>;
}
