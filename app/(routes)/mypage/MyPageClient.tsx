"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Edit3, ChevronRight, AlertTriangle, MapPin, LayoutList, Sparkles, Camera } from "lucide-react"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { logoutAction, deleteAccountAction } from "@/app/actions/auth"
import { updateDisplayNameAction, updateAvatarUrlAction } from "@/app/actions/profile"
import { uploadAvatar } from "@/lib/client/uploadAvatar"
import { avatarInitial } from "@/lib/display"

const DISPLAY_NAME_MAX = 50

export type MyPageUser = {
  email: string
  createdAt: string
  initialName: string
  avatarUrl: string | null
}

export type MyPageStats = {
  placeListsCount: number
  favoritesCount: number
  likesReceived: number
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-1">
      {children}
    </h2>
  )
}

function SettingRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-sm text-zinc-800 dark:text-zinc-200">{label}</p>
        {sub && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">{children}</div>
    </div>
  )
}

function NavRow({
  label, sub, href, onClick, danger = false,
}: {
  label: string; sub?: string; href?: string; onClick?: () => void; danger?: boolean
}) {
  const labelColor = danger ? "text-red-400" : "text-zinc-800 dark:text-zinc-200"

  const inner = (
    <>
      <div className="min-w-0">
        <p className={`text-sm ${labelColor}`}>{label}</p>
        {sub && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">{sub}</p>}
      </div>
      {!danger && (
        <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0" />
      )}
    </>
  )
  const baseCls = "w-full flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors text-left"
  const hoverCls = danger
    ? "hover:bg-red-50 dark:hover:bg-red-950/30"
    : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
  const cls = `${baseCls} ${hoverCls}`

  return href
    ? <Link href={href} className={cls}>{inner}</Link>
    : <button onClick={onClick} className={cls}>{inner}</button>
}

type StatItem = { value: number; label: string; href: string }

function StatsGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3">
      {items.map((stat, i) => (
        <Link
          key={stat.label}
          href={stat.href}
          className={`text-center py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors ${
            i === 1 ? "border-x border-zinc-100 dark:border-zinc-800" : ""
          }`}
        >
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{stat.label}</p>
        </Link>
      ))}
    </div>
  )
}

function DeleteAccountDialog({
  email, onClose, onConfirm, isDeleting, error,
}: {
  email: string
  onClose: () => void
  onConfirm: (password: string) => void
  isDeleting: boolean
  error: string | null
}) {
  const [password, setPassword] = useState("")
  const [confirmText, setConfirmText] = useState("")

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) onClose()
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, isDeleting])

  const emailMatches = confirmText.trim() === email
  const canSubmit = emailMatches && password.length > 0 && !isDeleting

  function handleSubmit() {
    if (!canSubmit) return
    onConfirm(password)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={() => { if (!isDeleting) onClose() }}
    >
      <div
        className="w-full sm:max-w-sm bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="delete-account-title"
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              アカウントを削除しますか？
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              この操作は取り消せません。<br />
              プロフィール・いいね・保存・お気に入りは削除されます。<br />
              あなたが作成したプレイスリストとスポットは「匿名ユーザー」として残ります。
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="delete-confirm-email" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              確認のため、ご自身のメールアドレスを入力してください
            </label>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-1.5 font-mono select-all break-all">{email}</p>
            <input
              id="delete-confirm-email"
              type="email"
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isDeleting}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:border-zinc-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="delete-password" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              現在のパスワード
            </label>
            <input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
              disabled={isDeleting}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:border-zinc-500 disabled:opacity-50"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-3" role="alert">{error}</p>
        )}
        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 border border-zinc-200 dark:border-zinc-700 text-sm py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "削除中…" : "削除する"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MyPageClient({
  user, stats, statsError, appVersion,
}: {
  user: MyPageUser
  stats: MyPageStats
  statsError: boolean
  appVersion: string
}) {
  const router = useRouter()

  const [name, setName]               = useState<string>(user.initialName)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput]     = useState(user.initialName)
  const [nameError, setNameError]     = useState<string | null>(null)
  const [savingName, setSavingName]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const [avatarUrl, setAvatarUrl]     = useState<string | null>(user.avatarUrl)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteError, setDeleteError]           = useState<string | null>(null)
  const [isLoggingOut, startLogout]             = useTransition()
  const [isDeleting, startDelete]               = useTransition()

  const initials = avatarInitial(name)

  async function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""

    setUploadingAvatar(true)
    setAvatarError(null)
    try {
      const result = await uploadAvatar(file)
      if (!result.ok) {
        setAvatarError(result.message ?? "アップロードに失敗しました")
        return
      }
      const saveResult = await updateAvatarUrlAction(result.url)
      if (saveResult?.error) {
        setAvatarError(saveResult.error)
        return
      }
      setAvatarUrl(result.url)
    } finally {
      setUploadingAvatar(false)
    }
  }

  function startEditingName() {
    setNameInput(name)
    setNameError(null)
    setEditingName(true)
  }

  function cancelEditingName() {
    if (savingName) return
    setEditingName(false)
    setNameError(null)
  }

  async function saveName() {
    const next = nameInput.trim()
    if (!next) {
      setNameError("表示名を入力してください")
      inputRef.current?.focus()
      return
    }
    if (next.length > DISPLAY_NAME_MAX) {
      setNameError(`${DISPLAY_NAME_MAX} 文字以内にしてください`)
      return
    }
    if (next === name) {
      setEditingName(false)
      setNameError(null)
      return
    }

    setSavingName(true)
    setNameError(null)
    try {
      const result = await updateDisplayNameAction(next)
      if (result?.error) {
        setNameError(result.error)
        return
      }
      setName(next)
      setEditingName(false)
      router.refresh()
    } finally {
      setSavingName(false)
    }
  }

  const statItems: StatItem[] = [
    { value: stats.placeListsCount, label: "プレイスリスト",   href: "/mylibrary/placelists" },
    { value: stats.favoritesCount,  label: "お気に入りスポット", href: "/mypage/favorites" },
    { value: stats.likesReceived,   label: "もらったいいね",   href: "/mylibrary/placelists" },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <header className="sticky top-0 z-50 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <User className="w-6 h-6 text-green-500 mr-2" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">マイページ</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">

        {/* プロフィールカード */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
          <div className="flex items-center gap-4">
            {/* アバター — クリックで画像を選択 */}
            <button
              type="button"
              aria-label="アイコン画像を変更"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="relative w-14 h-14 rounded-full shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:opacity-60"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="アイコン"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 text-xl font-bold">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div>
                  <div className="flex gap-2 items-center">
                    <input
                      ref={inputRef}
                      autoFocus
                      value={nameInput}
                      maxLength={DISPLAY_NAME_MAX}
                      onChange={(e) => { setNameInput(e.target.value); if (nameError) setNameError(null) }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveName()
                        if (e.key === "Escape") cancelEditingName()
                      }}
                      aria-invalid={nameError ? "true" : undefined}
                      aria-describedby={nameError ? "name-error" : undefined}
                      className="flex-1 min-w-0 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg px-2 py-1 text-sm outline-none focus:border-zinc-500"
                    />
                    <button
                      onClick={saveName}
                      disabled={savingName}
                      className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
                    >
                      {savingName ? "保存中…" : "保存"}
                    </button>
                    <button
                      onClick={cancelEditingName}
                      disabled={savingName}
                      className="text-xs text-zinc-400 disabled:opacity-50"
                    >
                      取消
                    </button>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
                    <span id="name-error" className="text-red-500 dark:text-red-400">
                      {nameError ?? ""}
                    </span>
                    <span>{nameInput.length} / {DISPLAY_NAME_MAX}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{name}</p>
                  <button
                    onClick={startEditingName}
                    aria-label="表示名を編集"
                    className="text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 transition-colors shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate" title={user.email}>{user.email}</p>
              <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-0.5">登録日: {user.createdAt}</p>
            </div>
          </div>

          {avatarError && (
            <p className="mt-2 text-xs text-red-500 dark:text-red-400" role="alert">{avatarError}</p>
          )}

          {statsError ? (
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>集計を取得できませんでした。時間を置いて再読み込みしてください。</span>
            </div>
          ) : (
            <StatsGrid items={statItems} />
          )}
        </div>

        {/* 初回ユーザー向け CTA: 統計が全部 0 のときだけ表示 */}
        {!statsError && stats.placeListsCount === 0 && stats.favoritesCount === 0 && stats.likesReceived === 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 rounded-2xl border border-green-100 dark:border-green-900/40 p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  最初のひとつから始めましょう
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  気になる場所をスポットとして登録したり、テーマでまとめたプレイスリストを作れます。
                </p>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <Link
                    href="/spots/create"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl py-2 hover:opacity-90 transition"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    スポットを登録する
                  </Link>
                  <Link
                    href="/placelists/create"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-semibold rounded-xl py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                    プレイスリストを作る
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 外観 */}
        <div>
          <SectionTitle>外観</SectionTitle>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <SettingRow label="ダークモード" sub="アプリのテーマを切り替えます">
              <ThemeToggle className="w-9 h-9 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100" />
            </SettingRow>
          </div>
        </div>

        {/* サポート */}
        <div>
          <SectionTitle>サポート</SectionTitle>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <NavRow href="/help"     label="ヘルプ"             sub="使い方・よくある質問" />
            <NavRow href="/feedback" label="フィードバックを送る" sub="ご意見・バグ報告" />
            <NavRow href="/terms"    label="利用規約" />
            <NavRow href="/privacy"  label="プライバシーポリシー" />
            <SettingRow label="バージョン">
              <span className="text-sm text-zinc-400 dark:text-zinc-500">{appVersion}</span>
            </SettingRow>
          </div>
        </div>

        {/* アカウント */}
        <div>
          <SectionTitle>アカウント</SectionTitle>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <NavRow href="/mypage/account/password" label="パスワードを変更する" />
            <NavRow
              label={isLoggingOut ? "ログアウト中…" : "ログアウト"}
              onClick={() => startLogout(() => logoutAction())}
            />
            <NavRow
              danger
              label="アカウントを削除する"
              onClick={() => { setDeleteError(null); setShowDeleteDialog(true) }}
            />
          </div>
        </div>

        <div className="h-2" />
      </div>

      {showDeleteDialog && (
        <DeleteAccountDialog
          email={user.email}
          isDeleting={isDeleting}
          error={deleteError}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={(password) => {
            setDeleteError(null)
            startDelete(async () => {
              const result = await deleteAccountAction(password)
              if (result?.error) setDeleteError(result.error)
            })
          }}
        />
      )}
    </div>
  )
}
