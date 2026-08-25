import OffersPage from '@/pages/OffersPage';

export default function RentACarPage() {
  return (
    <OffersPage
      presetFilters={{ transport_type: 'masina' }}
      pageTitle="Rent a car"
      pageSubtitle="Închirieri auto pentru vacanța ta, la destinație."
      emptyTitle="Momentan nu avem oferte de rent a car."
      emptyMessage="Această secțiune este în curs de populare cu oferte reale. Revino în curând."
    />
  );
}
