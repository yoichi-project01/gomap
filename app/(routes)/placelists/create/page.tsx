import { listSpots } from "@/lib/server/spots";
import { supabase } from "@/lib/server/supabase";
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth";
import { listFavoriteSpotIds } from "@/lib/server/favorites";
import CreatePlaceListForm from "./CreatePlaceListForm";

export const dynamic = "force-dynamic";

export default async function CreatePlaceListPage() {
  const authed = await createSupabaseServerClient();
  const [{ data: { user } }, availableSpots, favoriteSpotIds] = await Promise.all([
    authed.auth.getUser(),
    listSpots(supabase),
    listFavoriteSpotIds(),
  ]);
  return (
    <CreatePlaceListForm
      availableSpots={availableSpots}
      currentUserId={user?.id ?? null}
      favoriteSpotIds={favoriteSpotIds}
    />
  );
}
