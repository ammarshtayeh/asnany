"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  label: string;
  value?: string;
  folder?: string;
  onChange: (url: string) => void;
  required?: boolean;
};

export default function AdminImageUpload({
  label,
  value,
  folder = "admin",
  onChange,
  required,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر رفع الصورة");
      onChange(data.url);
    } catch (err: any) {
      setError(err.message || "تعذر رفع الصورة");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-slate-700">{label}</span>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-xs font-black text-red-600"
          >
            <X className="h-3.5 w-3.5" />
            حذف
          </button>
        ) : null}
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3">
        {value ? (
          <img src={value} alt={label} className="mb-3 h-36 w-full rounded-xl object-cover" />
        ) : (
          <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-white text-slate-400">
            <ImagePlus className="h-8 w-8" />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          required={required && !value}
          className="hidden"
          onChange={(event) => upload(event.target.files?.[0])}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-sky-600 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? "جار رفع الصورة..." : value ? "تغيير الصورة" : "رفع صورة"}
        </button>
      </div>

      {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  );
}
