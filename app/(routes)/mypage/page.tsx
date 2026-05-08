"use client"

import { useState } from "react"
import Link from "next/link"
import ThemeToggle from "@/components/ui/ThemeToggle"

const DUMMY_USER = {
  name: "田中 太郎",
  email: "tanaka@example.com",
  createdAt: "2026-01-15",
}
const DUMMY_STATS = { spotsCount: 3, favoritesCount: 3, likesReceived: 8 }
const APP_VERSION = "0.1.0"

const PREFECTURES = [
  "北海道",
  "青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県",
]

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
  const inner = (
    <>
      <div>
        <p className={`text-sm ${danger ? "text-red-400" : "text-zinc-800 dark:text-zinc-200"}`}>{label}</p>
        {sub && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{sub}</p>}
      </div>
      {!danger && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-300 dark:text-zinc-600">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </>
  )
  const cls = `w-full flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${
    danger ? "hover:bg-red-50 dark:hover:bg-red-950/30" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
  } transition-colors text-left`

  return href
    ? <Link href={href} className={cls}>{inner}</Link>
    : <button onClick={onClick} className={cls}>{inner}</button>
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-6 rounded-full transition-colors relative ${value ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"}`}
    >
      <span className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-zinc-900 shadow transition-transform duration-200 ${value ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  )
}

function SettingSelect({ value, options, onChange }: {
  value: string; options: string[]; onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 outline-none max-w-[140px]"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export default function MyPage() {
  const [name, setName]               = useState(DUMMY_USER.name)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput]     = useState(DUMMY_USER.name)

  const [defaultPref, setDefaultPref] = useState("大阪府")
  const [defaultZoom, setDefaultZoom] = useState("14")
  const [mapStyle, setMapStyle]       = useState("標準")

  const [spotsPublic, setSpotsPublic]     = useState(true)
  const [profilePublic, setProfilePublic] = useState(true)

  const [pushNotif, setPushNotif]   = useState(true)
  const [emailNotif, setEmailNotif] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState(false)

  const initials = name.trim().slice(0, 1)

  function saveName() {
    if (nameInput.trim()) setName(nameInput.trim())
    setEditingName(false)
  }

  return (
    <div className="h-screen overflow-y-auto bg-zinc-50 dark:bg-zinc-950 [&::-webkit-scrollbar]:hidden">
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-24 space-y-6">

      {/* プロフィールカード */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 text-xl font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex gap-2 items-center">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  className="flex-1 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg px-2 py-1 text-sm outline-none focus:border-zinc-500"
                />
                <button onClick={saveName} className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">保存</button>
                <button onClick={() => setEditingName(false)} className="text-xs text-zinc-400">取消</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{name}</p>
                <button
                  onClick={() => { setNameInput(name); setEditingName(true) }}
                  className="text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 transition-colors shrink-0"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
            )}
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">{DUMMY_USER.email}</p>
            <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-0.5">登録日: {DUMMY_USER.createdAt}</p>
          </div>
        </div>

        {/* 統計 */}
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3 text-center">
          {[
            { value: DUMMY_STATS.spotsCount,     label: "プレイスリスト" },
            { value: DUMMY_STATS.favoritesCount, label: "保存済み" },
            { value: DUMMY_STATS.likesReceived,  label: "もらったいいね" },
          ].map((stat, i) => (
            <div key={i} className={i === 1 ? "border-x border-zinc-100 dark:border-zinc-800" : ""}>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 外観 */}
      <div>
        <SectionTitle>外観</SectionTitle>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <SettingRow label="ダークモード" sub="アプリのテーマを切り替えます">
            <ThemeToggle className="w-9 h-9 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100" />
          </SettingRow>
        </div>
      </div>

      {/* 表示設定 */}
      <div>
        <SectionTitle>表示設定</SectionTitle>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <SettingRow label="デフォルト都道府県">
            <select
              value={defaultPref}
              onChange={(e) => setDefaultPref(e.target.value)}
              className="text-sm text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 outline-none max-w-[130px]"
            >
              <option value="">指定なし</option>
              {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </SettingRow>
          <SettingRow label="デフォルトズーム">
            <SettingSelect value={defaultZoom} options={["10","11","12","13","14","15","16","17","18"]} onChange={setDefaultZoom} />
          </SettingRow>
          <SettingRow label="マップスタイル">
            <SettingSelect value={mapStyle} options={["標準","地形","衛星"]} onChange={setMapStyle} />
          </SettingRow>
        </div>
      </div>

      {/* プライバシー */}
      <div>
        <SectionTitle>プライバシー</SectionTitle>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <SettingRow label="スポットを公開する" sub="オフにすると自分だけが見られます">
            <Toggle value={spotsPublic} onChange={setSpotsPublic} />
          </SettingRow>
          <SettingRow label="プロフィールを公開する">
            <Toggle value={profilePublic} onChange={setProfilePublic} />
          </SettingRow>
        </div>
      </div>

      {/* 通知 */}
      <div>
        <SectionTitle>通知</SectionTitle>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <SettingRow label="プッシュ通知">
            <Toggle value={pushNotif} onChange={setPushNotif} />
          </SettingRow>
          <SettingRow label="メール通知">
            <Toggle value={emailNotif} onChange={setEmailNotif} />
          </SettingRow>
        </div>
      </div>

      {/* サポート */}
      <div>
        <SectionTitle>サポート</SectionTitle>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <NavRow href="#" label="ヘルプ" />
          <NavRow href="#" label="フィードバックを送る" />
          <NavRow href="#" label="利用規約" />
          <NavRow href="#" label="プライバシーポリシー" />
          <SettingRow label="バージョン">
            <span className="text-sm text-zinc-400 dark:text-zinc-500">{APP_VERSION}</span>
          </SettingRow>
        </div>
      </div>

      {/* アカウント */}
      <div>
        <SectionTitle>アカウント</SectionTitle>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <NavRow label="ログアウト" onClick={() => {}} />
          {!confirmDelete ? (
            <NavRow danger label="アカウントを削除する" onClick={() => setConfirmDelete(true)} />
          ) : (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-950/30">
              <p className="text-xs text-red-500 mb-2">本当に削除しますか？この操作は取り消せません。</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-red-500 text-white text-xs py-2 rounded-xl">削除する</button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 border border-zinc-200 dark:border-zinc-700 text-xs py-2 rounded-xl text-zinc-600 dark:text-zinc-300"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-2" />
    </div>
    </div>
  )
}
