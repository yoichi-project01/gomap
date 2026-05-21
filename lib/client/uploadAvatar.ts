"use client"

// アバター画像のクライアントサイド処理
// 1. canvas で正方形にセンタークロップ
// 2. 400px 以下にリサイズ
// 3. JPEG (quality 0.85) に再エンコード
// 4. Supabase Storage の avatars バケットに {user_id}/{uuid}.jpg として配置
// 5. public URL を返す

import { createSupabaseBrowserClient } from "./supabaseBrowser"

const MAX_DIMENSION   = 400
const JPEG_QUALITY    = 0.85
const ALLOWED_MIME    = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_INPUT_BYTES = 10 * 1024 * 1024

export type UploadAvatarResult =
  | { ok: true; url: string }
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

async function processToSquareJpeg(file: File): Promise<Blob> {
  const img = await loadImage(file)
  const srcSize = Math.min(img.naturalWidth, img.naturalHeight)
  const sx = (img.naturalWidth - srcSize) / 2
  const sy = (img.naturalHeight - srcSize) / 2
  const dstSize = Math.min(srcSize, MAX_DIMENSION)

  const canvas = document.createElement("canvas")
  canvas.width = dstSize
  canvas.height = dstSize
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("canvas 2d context が取得できません")
  ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, dstSize, dstSize)

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  )
  if (!blob) throw new Error("画像のエンコードに失敗しました")
  return blob
}

export async function uploadAvatar(file: File): Promise<UploadAvatarResult> {
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
    blob = await processToSquareJpeg(file)
  } catch (err) {
    return { ok: false, reason: "decode", message: (err as Error).message }
  }

  const path = `${user.id}/${crypto.randomUUID()}.jpg`
  const { error: uploadErr } = await supabase.storage
    .from("avatars")
    .upload(path, blob, { contentType: "image/jpeg", upsert: false })

  if (uploadErr) {
    return { ok: false, reason: "upload", message: uploadErr.message }
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path)
  return { ok: true, url: data.publicUrl }
}
