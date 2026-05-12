import { listSpots } from "@/lib/server/spots";
import { supabase } from "@/lib/server/supabase";
import CreatePlaceListForm from "./CreatePlaceListForm";

export const dynamic = "force-dynamic";

export default async function CreatePlaceListPage() {
  const availableSpots = await listSpots(supabase);
  return <CreatePlaceListForm availableSpots={availableSpots} />;
}
