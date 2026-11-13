import { Image, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import Avatar from "./Avatar";

export default function CreatePost({ user, onCreate }) {
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef();
  const close = () => { setOpen(false); setCaption(""); setImage(null); setPreview(""); };
  const choose = (file) => { if (file) { setImage(file); setPreview(URL.createObjectURL(file)); } };
  const submit = async (event) => {
    event.preventDefault();
    if (!caption.trim() && !image) return;
    setSending(true);
    try { await onCreate({ caption, image }); close(); } finally { setSending(false); }
  };
  return <>
    <button onClick={() => setOpen(true)} className="glass flex w-full items-center gap-3 rounded-[26px] p-4 text-left transition hover:shadow-md"><Avatar user={user} size="md" /><span className="flex-1 rounded-full bg-slate-100/85 px-5 py-3 text-sm text-slate-400">Share a little something...</span><span className="hidden rounded-full bg-lavender/10 p-3 text-lavender sm:block"><Image size={19} /></span></button>
    {open && <div className="fixed inset-0 z-50 grid place-items-end bg-ink/25 p-0 backdrop-blur-sm sm:place-items-center sm:p-5"><form onSubmit={submit} className="w-full max-w-[540px] rounded-t-[30px] bg-[#fbfbfa] p-5 shadow-2xl sm:rounded-[30px] sm:p-6"><div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><Avatar user={user} size="md" /><div><p className="font-semibold">{user.name}</p><p className="text-xs text-slate-500">Posting to everyone</p></div></div><button type="button" onClick={close} className="icon-button" aria-label="Close"><X size={18} /></button></div><textarea autoFocus value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What’s on your mind?" className="min-h-32 w-full resize-none bg-transparent text-[17px] leading-7 outline-none placeholder:text-slate-400" maxLength="1200" />{preview && <div className="relative mt-3 overflow-hidden rounded-2xl"><img src={preview} alt="Post preview" className="max-h-72 w-full object-cover" /><button type="button" onClick={() => { setImage(null); setPreview(""); }} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white"><X size={16} /></button></div>}<div className="mt-5 flex items-center justify-between border-t pt-4"><label className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-lavender transition hover:bg-lavender/10"><Image size={19} /> Add photo<input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => choose(e.target.files[0])} /></label><button disabled={sending || (!caption.trim() && !image)} className="flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white shadow-glow transition hover:bg-lavender"><Send size={16} />{sending ? "Sharing..." : "Share"}</button></div></form></div>}
  </>;
}
