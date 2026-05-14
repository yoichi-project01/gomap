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
};

export type PlaceList = {
  id: string;
  name: string;
  description: string;
  category?: string;
  creator?: string;       // auth.users.id (uuid)
  creatorName?: string;   // profiles.display_name (表示用)
  likes?: number;
  coverImageUrl?: string;
  createdAt?: string;
  spots: Spot[];
};
