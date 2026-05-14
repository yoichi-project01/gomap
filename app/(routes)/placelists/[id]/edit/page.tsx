import { notFound, redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/server/supabaseAuth';
import { getPlaceListById } from '@/lib/server/placeLists';
import { listSpots } from '@/lib/server/spots';
import EditPlaceListForm from './EditPlaceListForm';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPlaceListPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/placelists/${id}/edit`);

  const [placeList, availableSpots] = await Promise.all([
    getPlaceListById(supabase, id),
    listSpots(supabase),
  ]);

  if (!placeList) notFound();
  if (placeList.creator !== user.id) notFound();

  const initialCover = placeList.coverImageUrl
    ? { url: placeList.coverImageUrl, path: '' }
    : null;

  return (
    <EditPlaceListForm
      id={id}
      initialTitle={placeList.name}
      initialDescription={placeList.description ?? ''}
      initialCover={initialCover}
      initialSpots={placeList.spots}
      availableSpots={availableSpots}
    />
  );
}
