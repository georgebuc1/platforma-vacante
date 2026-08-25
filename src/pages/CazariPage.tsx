import OffersPage from '@/pages/OffersPage';

export default function CazariPage() {
  return (
    <OffersPage
      presetFilters={{ accommodation_only: true }}
      pageTitle="Cazări"
      pageSubtitle="Hoteluri și cazări selectate pentru vacanța ta."
      emptyTitle="Momentan nu avem cazări disponibile."
      emptyMessage="Lucrăm la adăugarea de cazări reale (Booking.com). Revino în curând."
    />
  );
}
