export type Spot = {
  id: string;
  name: string;
  description?: string;
  desc?: string;
  lat: number;
  lng: number;
  prefecture?: string;
  category?: string;
  creator?: string;
  coverImageUrl?: string;
  createdAt?: string;
  createdBy?: string;
};

export type PlaceList = {
  id: string;
  name: string;
  description: string;
  creator?: string;
  likes?: number;
  coverImageUrl?: string;
  createdAt?: string;
  spots: Spot[];
};
