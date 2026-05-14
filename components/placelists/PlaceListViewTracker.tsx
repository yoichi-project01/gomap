"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/client/viewHistory";

type Props = {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  spotsCount: number;
};

export default function PlaceListViewTracker({
  id,
  name,
  description,
  coverImageUrl,
  spotsCount,
}: Props) {
  useEffect(() => {
    recordView({ id, name, description, coverImageUrl, spotsCount });
  }, [id, name, description, coverImageUrl, spotsCount]);

  return null;
}
