import OffersPage from '@/pages/OffersPage';

export default function LastMinutePage() {
  return (
    <OffersPage
      presetFilters={{ last_minute: true }}
      pageTitle="Oferte last minute"
      pageSubtitle="Plecări în următoarele 14 zile, la cele mai bune prețuri disponibile acum."
      emptyTitle="Nu avem oferte last minute chiar acum."
      emptyMessage="Verifică din nou peste câteva ore — ofertele se actualizează automat, zilnic."
    />
  );
}
