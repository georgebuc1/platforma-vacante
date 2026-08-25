import OffersPage from '@/pages/OffersPage';

export default function BiletePage() {
  return (
    <OffersPage
      presetFilters={{ transport_type: 'avion' }}
      pageTitle="Bilete de avion"
      pageSubtitle="Zboruri ieftine către destinațiile tale preferate, actualizate automat."
      emptyTitle="Nu am găsit bilete pentru aceste criterii."
      emptyMessage="Încearcă altă destinație sau lărgește perioada de căutare."
    />
  );
}
