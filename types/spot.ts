export type Spot = {
  id: string;
  name: string;
  desc?: string;
  description?: string;
  lat: number;
  lng: number;
  createdAt?: string;
  createdBy?: string;
};

export type PlaceList = {
  id: string;
  name: string;
  description: string;
  creator?: string;
  likes?: number;
  spots: Spot[];
};