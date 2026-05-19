"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, X } from "lucide-react"
import { uploadCover, deleteCover } from "@/lib/client/uploadCover"

type Props = {
  value: { url: string; path: string } | null
  onChange: (next: { url: string; path: string } | null) => void
  className?: string
}

export default function CoverImageUploader({ value, onChange, className = "" }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setErrorMessage(null)

    const result = await uploadCover(file)
    setUploading(false)

    if (!result.ok) {
      if (result.reason === "unauthenticated") {
        router.push("/login")
        return
      }
      setErrorMessage(result.message ?? "アップロードに失敗しました")
      return
    }

    if (value?.path) {
      void deleteCover(value.path)
    }
    onChange({ url: result.url, path: result.path })
  }

  function handleRemove() {
    if (value?.path) void deleteCover(value.path)
    onChange(null)
    setErrorMessage(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative w-48 h-48 rounded-md overflow-hidden shadow-lg">
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.url}
              alt="カバー画像プレビュー"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              aria-label="画像を削除"
              className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition group disabled:cursor-wait disabled:opacity-70"
          >
            <Camera className="w-10 h-10 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors mb-2" />
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
              {uploading ? "アップロード中…" : "画像を選択"}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />

      {errorMessage && (
        <p className="text-xs text-red-400" role="alert">{errorMessage}</p>
      )}
      {!errorMessage && value && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition disabled:opacity-50"
        >
          {uploading ? "アップロード中…" : "画像を変更"}
        </button>
      )}
    </div>
  )
}
