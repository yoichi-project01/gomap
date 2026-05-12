"use client"

// カバー画像のクライアントサイド処理
// 1. canvas で 1080px 以下にリサイズ
// 2. JPEG (quality 0.82) に再エンコード
// 3. Supabase Storage の covers バケットに {user_id}/{uuid}.jpg として配置
// 4. public URL を返す

import { createSupabaseBrowserClient } from "./supabaseBrowser"

const MAX_DIMENSION    = 1080
const JPEG_QUALITY     = 0.82
const ALLOWED_MIME     = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_INPUT_BYTES  = 10 * 1024 * 1024 // 入力 10MB 上限 (リサイズで縮む)

export type UploadCoverResult =
  | { ok: true; url: string; path: string }
  | { ok: false; reason: "unauthenticated" | "invalid_type" | "too_large" | "decode" | "upload"; message?: string }

async function loadImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error("decode"))
      img.src = url
    })
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

function computeSize(width: number, height: number): { width: number; height: number } {
  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) return { width, height }
  const scale = MAX_DIMENSION / Math.max(width, height)
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

async function processToJpeg(file: File): Promise<Blob> {
  const img = await loadImage(file)
  const { width, height } = computeSize(img.naturalWidth, img.naturalHeight)
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("canvas 2d context が取得できません")
  ctx.drawImage(img, 0, 0, width, height)

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  )
  if (!blob) throw new Error("画像のエンコードに失敗しました")
  return blob
}

export async function uploadCover(file: File): Promise<UploadCoverResult> {
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, reason: "invalid_type", message: "JPEG / PNG / WebP のみ対応しています" }
  }
  if (file.size > MAX_INPUT_BYTES) {
    return { ok: false, reason: "too_large", message: "10MB 以下の画像を選んでください" }
  }

  const supabase = createSupabaseBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: "unauthenticated" }

  let blob: Blob
  try {
    blob = await processToJpeg(file)
  } catch (err) {
    return { ok: false, reason: "decode", message: (err as Error).message }
  }

  const path = `${user.id}/${crypto.randomUUID()}.jpg`
  const { error: uploadErr } = await supabase.storage
    .from("covers")
    .upload(path, blob, { contentType: "image/jpeg", upsert: false })

  if (uploadErr) {
    return { ok: false, reason: "upload", message: uploadErr.message }
  }

  const { data } = supabase.storage.from("covers").getPublicUrl(path)
  return { ok: true, url: data.publicUrl, path }
}

export async function deleteCover(path: string): Promise<void> {
  const supabase = createSupabaseBrowserClient()
  await supabase.storage.from("covers").remove([path])
}
