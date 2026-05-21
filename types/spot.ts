export type SpotSource = "user" | "map_ref";

export type Spot = {
  id: string;
  name: string;
  description?: string;
  lat: number;
  lng: number;
  prefecture?: string;
  category?: string;
  creator?: string;       // auth.users.id (uuid)
  creatorName?: string;   // profiles.display_name (表示用)
  source?: SpotSource;
  coverImageUrl?: string;
  createdAt?: string;
  createdBy?: string;
  likesCount?: number;
};

export type PlaceList = {
  id: string;
  name: string;
  description: string;
  category?: string;
  creator?: string;       // auth.users.id (uuid)
  creatorName?: string;   // profiles.display_name (表示用)
  creatorAvatarUrl?: string; // profiles.avatar_url (表示用)
  likes?: number;
  coverImageUrl?: string;
  isPublic?: boolean;     // true = 公開 (デフォルト), false = 作成者のみ閲覧可
  createdAt?: string;
  spots: Spot[];
};
