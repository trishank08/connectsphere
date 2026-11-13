import { ArrowLeft, MessageCircleMore, Search, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Link, useSearchParams } from "react-router-dom";
import api, { SOCKET_URL } from "../api";
import AppShell from "../components/AppShell";
import Avatar from "../components/Avatar";
import { useAuth } from "../context/AuthContext";

const shortTime = (date) => {
  if (!date) return "";
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(date)) / 1000));
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedContactId = searchParams.get("to");
  const requestedUsername = searchParams.get("username");
  const requestedName = searchParams.get("name");
  const notes = () => ({ _id: user._id, name: "My notes", username: user.username, avatar: user.avatar, isNotes: true, lastMessage: "A private space for you", unreadCount: 0 });
  const [contacts, setContacts] = useState(() => [notes()]);
  const [selected, setSelected] = useState(() => notes());
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");
  const selectedRef = useRef(selected);
  const endRef = useRef(null);

  useEffect(() => { selectedRef.current = selected; }, [selected]);

  useEffect(() => {
    const myNotes = notes();
    let socket;
    const loadContacts = async () => {
      try {
        const { data } = await api.get("/messages/contacts");
        const people = Array.isArray(data.contacts) ? data.contacts : [];
        const requestedContact = people.find((contact) => String(contact._id) === requestedContactId)
          || (requestedContactId && requestedUsername ? { _id: requestedContactId, username: requestedUsername, name: requestedName || requestedUsername, avatar: "", lastMessage: "No messages yet", unreadCount: 0 } : null);
        const nextContacts = requestedContact && !people.some((contact) => String(contact._id) === String(requestedContact._id)) ? [myNotes, requestedContact, ...people] : [myNotes, ...people];
        setContacts(nextContacts);
        setSelected(requestedContact || myNotes);
      } catch {
        setError("Contacts are unavailable right now. You can still use My notes.");
        setContacts([myNotes]);
      }
    };
    loadContacts();
    try {
      socket = io(SOCKET_URL, { withCredentials: true });
      socket.emit("join", user._id);
      socket.on("message:new", (incoming) => {
        const active = selectedRef.current;
        const belongsToActive = active && ((incoming.sender === active._id && incoming.recipient === user._id) || (incoming.sender === user._id && incoming.recipient === active._id));
        if (belongsToActive) setMessages((old) => old.some((item) => item._id === incoming._id) ? old : [...old, incoming]);
        const otherId = incoming.sender === user._id ? incoming.recipient : incoming.sender;
        setContacts((old) => old.map((contact) => String(contact._id) === String(otherId) ? { ...contact, lastMessage: incoming.text, lastAt: incoming.createdAt, lastMessageFromMe: incoming.sender === user._id, unreadCount: incoming.sender === user._id || belongsToActive ? 0 : (contact.unreadCount || 0) + 1 } : contact));
      });
    } catch { setError("Live updates are unavailable, but regular messages still work."); }
    return () => socket?.disconnect();
  }, [user._id, requestedContactId]);

  useEffect(() => {
    if (!selected) return;
    setMessages([]);
    api.get(`/messages/${selected._id}`).then(({ data }) => {
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setContacts((old) => old.map((contact) => String(contact._id) === String(selected._id) ? { ...contact, unreadCount: 0 } : contact));
    }).catch(() => setMessages([]));
  }, [selected?._id]);
  useEffect(() => { try { endRef.current?.scrollIntoView({ behavior: "smooth" }); } catch { /* nonessential */ } }, [messages]);

  const send = async (event) => {
    event.preventDefault();
    if (!text.trim() || !selected) return;
    const draft = text.trim();
    setText(""); setSendError("");
    try {
      const { data } = await api.post(`/messages/${selected._id}`, { text: draft });
      setMessages((old) => old.some((item) => item._id === data.message._id) ? old : [...old, data.message]);
      setContacts((old) => old.map((contact) => String(contact._id) === String(selected._id) ? { ...contact, lastMessage: draft, lastAt: data.message.createdAt, lastMessageFromMe: true } : contact));
    } catch (requestError) {
      setText(draft);
      setSendError(requestError.response?.data?.message || "Message couldn't be sent. Check that the backend is running.");
    }
  };

  const visibleContacts = contacts.filter((contact) => `${contact.name || ""} ${contact.username || ""} ${contact.lastMessage || ""}`.toLowerCase().includes(filter.toLowerCase()));
  return <AppShell rightRail={<MessageTips />}><div className="pb-24 lg:pb-0"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-lavender">Stay close</p><h1 className="mt-1 font-serif text-3xl font-bold sm:text-4xl">Messages</h1></div>{error && <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</p>}<div className="glass grid h-[calc(100vh-180px)] min-h-[540px] overflow-hidden rounded-[28px] md:grid-cols-[270px_minmax(0,1fr)]"><aside className={`${selected ? "hidden md:block" : ""} border-r border-slate-200/70 bg-white/35`}><div className="border-b p-4"><div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5"><Search size={16} className="text-slate-400" /><input value={filter} onChange={(event) => setFilter(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Find someone" /></div></div><div className="max-h-[calc(100%-76px)] overflow-y-auto p-2">{visibleContacts.map((contact) => <button key={contact._id} onClick={() => setSelected(contact)} className={`relative flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${selected?._id === contact._id ? "bg-lavender/10" : "hover:bg-white"}`}><Avatar user={contact} size="sm" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-bold">{contact.name}</p><span className="text-[11px] text-slate-400">{shortTime(contact.lastAt)}</span></div><p className={`truncate text-xs ${contact.unreadCount ? "font-bold text-ink" : "text-slate-500"}`}>{contact.isNotes ? "A private space for you" : `${contact.lastMessageFromMe ? "You: " : ""}${contact.lastMessage || "No messages yet"}`}</p></div>{contact.unreadCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{contact.unreadCount > 9 ? "9+" : contact.unreadCount}</span>}</button>)}</div></aside><section className={`${!selected ? "hidden md:flex" : "flex"} min-w-0 flex-col bg-white/20`}>{selected ? <><header className="flex items-center gap-3 border-b bg-white/45 p-4"><button onClick={() => setSelected(null)} className="mr-1 md:hidden"><ArrowLeft size={20} /></button><Link to={`/profile/${selected.username}`} className="flex items-center gap-3"><Avatar user={selected} size="sm" /><div><p className="text-sm font-bold">{selected.name}</p><p className="flex items-center gap-1 text-xs text-emerald-600"><i className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-emerald-500" />{selected.isNotes ? "Only you can see these" : "Available to chat"}</p></div></Link></header><div className="flex-1 overflow-y-auto p-4 sm:p-5">{messages.length === 0 && <div className="grid h-full place-items-center text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-lavender/10 text-lavender"><MessageCircleMore /></span><p className="mt-3 text-sm font-semibold">{selected.isNotes ? "Leave yourself a note." : `Say hello to ${selected.name.split(" ")[0]}.`}</p><p className="mt-1 text-xs text-slate-500">{selected.isNotes ? "A small private space to test the chat." : "A little message can start a lot."}</p></div></div>}{messages.map((item) => { const mine = item.sender === user._id; return <div key={item._id} className={`mb-3 flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-5 ${mine ? "rounded-br-md bg-ink text-white" : "rounded-bl-md bg-white text-slate-700 shadow-sm"}`}>{item.text}</div></div>; })}<div ref={endRef} /></div><form onSubmit={send} className="border-t bg-white/45 p-3">{sendError && <p className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{sendError}</p>}<div className="flex gap-2"><input value={text} onChange={(event) => setText(event.target.value)} className="field !py-2.5" placeholder={selected.isNotes ? "Write a private note..." : `Message ${selected.name.split(" ")[0]}...`} maxLength="1200" /><button disabled={!text.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lavender text-white shadow-glow"><Send size={18} /></button></div></form></> : <div className="grid flex-1 place-items-center text-center"><div><MessageCircleMore size={34} className="mx-auto text-lavender" /><p className="mt-3 font-serif text-xl font-bold">Choose a conversation</p></div></div>}</section></div></div></AppShell>;
}

function MessageTips() { return <div className="sticky top-24 rounded-[26px] bg-gradient-to-br from-[#e8e4ff] via-white to-[#e6f5ed] p-5"><p className="text-xs font-bold tracking-[.15em] text-lavender">A GENTLE REMINDER</p><h2 className="mt-3 font-serif text-2xl font-bold leading-8">The best chats don’t need a perfect opener.</h2><p className="mt-3 text-sm leading-6 text-slate-500">Try asking what made someone smile today.</p></div>; }
