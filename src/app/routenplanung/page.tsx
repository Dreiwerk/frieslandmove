// app/routenplanung/page.tsx

import dynamic from 'next/dynamic';

// Dynamic import - Leaflet braucht window/document
const RouteMapPlanner = dynamic(
  () => import('@/components/RouteMapPlanner'),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-600">Routenplaner wird geladen...</span>
        </div>
      </div>
    )
  }
);

export default function RoutenplanungPage() {
  return <RouteMapPlanner />;
}

// Metadata
export const metadata = {
  title: 'Routenplanung - Schülerbeförderung',
  description: 'Interaktive Routenplanung für die Schülerbeförderung im Landkreis Friesland',
};
