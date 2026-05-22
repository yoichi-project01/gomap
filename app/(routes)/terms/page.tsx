import { FileText } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

export const metadata = {
  title: "利用規約 | Gomap",
};

const EFFECTIVE_DATE = "2026年5月14日";

type Section = { title: string; body: string[] };

const SECTIONS: Section[] = [
  {
    title: "第1条（適用）",
    body: [
      "本規約は、Gomap（以下「本サービス」といいます）の提供条件および本サービスの利用に関する当方とユーザーとの間の権利義務関係を定めることを目的とし、ユーザーと当方の間の本サービスの利用に関わる一切の関係に適用されます。",
    ],
  },
  {
    title: "第2条（利用登録）",
    body: [
      "本サービスにおいては、登録希望者が本規約に同意の上、所定の方法によって利用登録を申請し、当方がこれを承認することによって、利用登録が完了するものとします。",
      "当方は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。",
    ],
  },
  {
    title: "第3条（ユーザーIDおよびパスワードの管理）",
    body: [
      "ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。",
      "ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。",
    ],
  },
  {
    title: "第4条（投稿コンテンツ）",
    body: [
      "ユーザーは、本サービスを利用してスポット情報・プレイスリスト等のコンテンツを投稿することができます。",
      "ユーザーは、自ら投稿したコンテンツについて、当方に対し、世界的、非独占的、無償、サブライセンス可能かつ譲渡可能な使用、複製、配布、派生著作物の作成、表示および実行に関するライセンスを付与します。",
      "ユーザーは、投稿コンテンツについて、自らが投稿その他送信することについての適法な権利を有していること、および投稿コンテンツが第三者の権利を侵害していないことを表明し、保証するものとします。",
    ],
  },
  {
    title: "第5条（禁止事項）",
    body: [
      "ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。",
      "・法令または公序良俗に違反する行為",
      "・犯罪行為に関連する行為",
      "・本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為",
      "・当方、他のユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為",
      "・本サービスによって得られた情報を商業的に利用する行為",
      "・当方のサービスの運営を妨害するおそれのある行為",
      "・不正アクセスをし、またはこれを試みる行為",
      "・他のユーザーに関する個人情報等を収集または蓄積する行為",
      "・不正な目的を持って本サービスを利用する行為",
      "・その他、当方が不適切と判断する行為",
    ],
  },
  {
    title: "第6条（本サービスの提供の停止等）",
    body: [
      "当方は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。",
      "・本サービスにかかるコンピュータシステムの保守点検または更新を行う場合",
      "・地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合",
      "・コンピュータまたは通信回線等が事故により停止した場合",
      "・その他、当方が本サービスの提供が困難と判断した場合",
    ],
  },
  {
    title: "第7条（免責事項）",
    body: [
      "当方は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます）がないことを明示的にも黙示的にも保証しておりません。",
      "当方は、本サービスに起因してユーザーに生じたあらゆる損害について、当方の故意又は重過失による場合を除き、一切の責任を負いません。",
    ],
  },
  {
    title: "第8条（サービス内容の変更等）",
    body: [
      "当方は、ユーザーに通知することなく、本サービスの内容を変更し、または本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。",
    ],
  },
  {
    title: "第9条（利用規約の変更）",
    body: [
      "当方は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。",
    ],
  },
  {
    title: "第10条（準拠法・裁判管轄）",
    body: [
      "本規約の解釈にあたっては、日本法を準拠法とします。",
      "本サービスに関して紛争が生じた場合には、当方の本店所在地を管轄する裁判所を専属的合意管轄とします。",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <header className="sticky top-0 z-50 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <BackButton
          className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition mr-3"
          iconClassName="w-6 h-6 text-zinc-700 dark:text-white"
        />
        <FileText className="w-6 h-6 text-green-500 mr-2" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">利用規約</h1>
      </header>

      <main className="px-4 mt-6 max-w-2xl mx-auto">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-6 px-1">
          施行日: {EFFECTIVE_DATE}
        </p>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-6">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.body.map((p, i) => (
                  <p
                    key={i}
                    className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-6 px-1 text-right">
          以上
        </p>
      </main>
    </div>
  );
}
