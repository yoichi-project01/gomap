export interface Location {
  id: string
  name: string
  lat: number
  lng: number
}

export interface PlaceList {
  id: number
  name: string
  category: string
  prefecture: string
  description: string
  spots: string[]
  tags: string[]
  locations: Location[]
}

export const placeLists: PlaceList[] = [
  {
    id: 1,
    name: "大阪の観光地7選",
    category: "観光",
    prefecture: "大阪府",
    description: "大阪を代表する観光スポットを厳選した7つの名所。古都の歴史と現代の活気が融合した街を堪能できます。",
    spots: [
      "大阪城",
      "ユニバーサル・スタジオ・ジャパン",
      "道頓堀",
      "梅田スカイビル",
      "天王寺動物園",
      "大阪水上バス",
      "なんばグランド花月"
    ],
    tags: ["観光", "歴史", "エンタメ"],
    locations: [
      { id: "loc-1", name: "大阪城", lat: 34.6873, lng: 135.5262 },
      { id: "loc-2", name: "ユニバーサル・スタジオ・ジャパン", lat: 34.6639, lng: 135.4309 },
      { id: "loc-3", name: "道頓堀", lat: 34.6687, lng: 135.5021 }
    ]
  },
  {
    id: 2,
    name: "大阪のグルメ5選",
    category: "グルメ",
    prefecture: "大阪府",
    description: "大阪名物の美味しい食べ物を集めた5つのグルメスポット。食いだおれの町大阪を代表する絶品グルメが集結。",
    spots: [
      "道頓堀 たこ焼き",
      "北新地 焼き肉",
      "新世界 串カツ",
      "天満 天ぷら",
      "中之島 カフェ"
    ],
    tags: ["グルメ", "食べ歩き", "関西グルメ"],
    locations: [
      { id: "loc-4", name: "道頓堀", lat: 34.6687, lng: 135.5021 },
      { id: "loc-5", name: "北新地", lat: 34.6825, lng: 135.4878 },
      { id: "loc-6", name: "新世界", lat: 34.6525, lng: 135.5063 }
    ]
  },
  {
    id: 3,
    name: "大阪の夜景スポット3選",
    category: "観光",
    prefecture: "大阪府",
    description: "大阪の美しい夜景を楽しめる3つのスポット。ビジネス街の輝きと川沿いの景観が織り成す、幻想的な夜景の世界。",
    spots: [
      "梅田スカイビル",
      "大阪城",
      "ユニバーサル・シティウォーク"
    ],
    tags: ["夜景", "写真スポット", "デート"],
    locations: [
      { id: "loc-7", name: "梅田スカイビル", lat: 34.7050, lng: 135.4896 },
      { id: "loc-8", name: "大阪城", lat: 34.6873, lng: 135.5262 },
      { id: "loc-9", name: "ユニバーサル・シティウォーク", lat: 34.6615, lng: 135.4293 }
    ]
  },
  {
    id: 4,
    name: "大阪のショッピング5選",
    category: "ショッピング",
    prefecture: "大阪府",
    description: "大阪でお買い物におすすめの5つのエリア。ハイブランドからカジュアルまで、あらゆる世代のショッピング需要を満たせます。",
    spots: [
      "梅田",
      "心斎橋",
      "天王寺",
      "なんば",
      "京橋"
    ],
    tags: ["ショッピング", "ファッション", "買い物"],
    locations: [
      { id: "loc-10", name: "梅田", lat: 34.7034, lng: 135.4895 },
      { id: "loc-11", name: "心斎橋", lat: 34.6707, lng: 135.4966 },
      { id: "loc-12", name: "なんば", lat: 34.6556, lng: 135.5012 }
    ]
  },
  {
    id: 5,
    name: "大阪の自然スポット4選",
    category: "自然",
    prefecture: "大阪府",
    description: "大阪で自然を感じられる4つのスポット。都会の喧騒を忘れ、自然の中でリラックスできるオアシスです。",
    spots: [
      "大阪城公園",
      "天王寺公園",
      "中之島公園",
      "服部緑地"
    ],
    tags: ["自然", "公園", "散歩"],
    locations: [
      { id: "loc-13", name: "大阪城公園", lat: 34.6873, lng: 135.5262 },
      { id: "loc-14", name: "天王寺公園", lat: 34.6437, lng: 135.5116 },
      { id: "loc-15", name: "中之島公園", lat: 34.6887, lng: 135.5006 }
    ]
  },
  {
    id: 6,
    name: "大阪のカフェ6選",
    category: "カフェ",
    prefecture: "大阪府",
    description: "大阪にある居心地の良いカフェ6選。朝のコーヒーから夜のくつろぎまで、素敵な時間を過ごせるお店ばかり。",
    spots: [
      "蔵前 コーヒーロースター",
      "中之島 オシャレカフェ",
      "難波 レトロカフェ",
      "心斎橋 アートカフェ",
      "北浜 隠れ家カフェ",
      "堂島 ブックカフェ"
    ],
    tags: ["カフェ", "癒し", "リラックス"],
    locations: [
      { id: "loc-16", name: "中之島", lat: 34.6887, lng: 135.5006 },
      { id: "loc-17", name: "難波", lat: 34.6556, lng: 135.5012 },
      { id: "loc-18", name: "心斎橋", lat: 34.6707, lng: 135.4966 }
    ]
  },
  {
    id: 7,
    name: "大阪の週末デートスポット4選",
    category: "観光",
    prefecture: "大阪府",
    description: "週末のデートにおすすめの4つのスポット。ロマンティックな雰囲気から最新の娯楽施設まで、カップルの思い出作りにぴったり。",
    spots: [
      "ユニバーサル・スタジオ・ジャパン",
      "大阪城公園 桜の季節",
      "なんばパークス",
      "キューズタウン梅田"
    ],
    tags: ["デート", "恋愛", "楽しい"],
    locations: [
      { id: "loc-19", name: "ユニバーサル・スタジオ・ジャパン", lat: 34.6639, lng: 135.4309 },
      { id: "loc-20", name: "大阪城公園", lat: 34.6873, lng: 135.5262 },
      { id: "loc-21", name: "なんば", lat: 34.6556, lng: 135.5012 }
    ]
  },
  {
    id: 8,
    name: "大阪の穴場スポット5選",
    category: "観光",
    prefecture: "大阪府",
    description: "ガイドブックには載らない、地元民が愛する穴場スポット5選。隠れた魅力を発見できるエリアばかり。",
    spots: [
      "浜寺公園",
      "造幣局 桜の通り抜け",
      "北港テクノロジー緑地",
      "下寺町 昭和レトログミッド",
      "長居公園 日本庭園"
    ],
    tags: ["穴場", "マイナー", "発見"],
    locations: [
      { id: "loc-22", name: "造幣局", lat: 34.7198, lng: 135.4742 },
      { id: "loc-23", name: "北港", lat: 34.6425, lng: 135.3925 },
      { id: "loc-24", name: "長居公園", lat: 34.6214, lng: 135.5326 }
    ]
  }
]