import { Car, Heart, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Vehicle } from '../types/vehicle';
import { formatBRL, formatKm } from '../utils/format';

interface VehicleCardProps {
  vehicle: Vehicle;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export function VehicleCard({
  vehicle,
  isFavorite,
  onToggleFavorite,
  onSelectVehicle,
}: VehicleCardProps) {
  const [imgError, setImgError] = useState(false);
  const fipeDiff = vehicle.fipePrice - vehicle.price;
  const isBelowFipe = fipeDiff > 0;

  return (
    <article className="group bg-white rounded-xl border border-[#E4E7EC] overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Image area (4:3 aspect ratio) */}
      <div className="relative aspect-[4/3] bg-[#F3F4F6] overflow-hidden">
        <button
          type="button"
          onClick={() => onSelectVehicle(vehicle)}
          className="w-full h-full block text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#E30613]"
          aria-label={`Ver detalhes de ${vehicle.brand} ${vehicle.model}`}
        >
          {!imgError ? (
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.brand} ${vehicle.model} ${vehicle.version}`}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] flex flex-col items-center justify-center p-4 text-center">
              <Car className="w-10 h-10 text-[#9CA3AF] mb-2" aria-hidden="true" />
              <span className="text-sm font-semibold text-[#374151]">
                {vehicle.brand} {vehicle.model}
              </span>
            </div>
          )}
        </button>

        {/* Maximum 1 subtle tag top-left */}
        {vehicle.isZeroKm ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#111827]/85 text-white text-xs font-semibold tracking-tight pointer-events-none">
            0 KM
          </span>
        ) : isBelowFipe ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#059669] text-white text-xs font-semibold tracking-tight pointer-events-none">
            Abaixo da FIPE
          </span>
        ) : null}

        {/* Favorite toggle button */}
        <button
          type="button"
          onClick={() => onToggleFavorite(vehicle.id)}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
          aria-pressed={isFavorite}
          className="absolute top-2.5 right-2.5 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#111827] flex items-center justify-center shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
        >
          <Heart
            className={`w-4.5 h-4.5 transition-colors ${
              isFavorite ? 'fill-[#E30613] text-[#E30613]' : 'text-[#4B5563]'
            }`}
          />
        </button>
      </div>

      {/* Card Body - Uniform field order */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => onSelectVehicle(vehicle)}
            className="text-left w-full cursor-pointer group/title focus-visible:outline-none"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-display text-base font-bold text-[#111827] group-hover/title:text-[#E30613] transition-colors truncate">
                {vehicle.brand} {vehicle.model}
              </h3>
              <span className="text-xs font-semibold text-[#4B5563] tabular-nums shrink-0">
                {vehicle.yearFabrication}/{vehicle.yearModel}
              </span>
            </div>
            <p className="text-sm text-[#4B5563] truncate mt-0.5">{vehicle.version}</p>
          </button>

          {/* Unboxed metadata with typographic separators */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#6B7280] mt-2.5 tabular-nums">
            <span>{formatKm(vehicle.mileage)}</span>
            <span aria-hidden="true">·</span>
            <span>{vehicle.transmission}</span>
            <span aria-hidden="true">·</span>
            <span>{vehicle.fuel}</span>
          </div>
        </div>

        <div>
          {/* Price & FIPE comparison */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display text-xl font-extrabold text-[#111827] tabular-nums">
              {formatBRL(vehicle.price)}
            </span>
            <span className="text-xs text-[#6B7280] tabular-nums">
              FIPE {formatBRL(vehicle.fipePrice)}
            </span>
          </div>

          {/* Hairline divider + Location & CTA */}
          <div className="mt-3.5 pt-3 border-t border-[#F0F2F5] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-xs font-medium text-[#374151] truncate">
                <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {vehicle.city} - {vehicle.state}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] truncate mt-0.5">{vehicle.sellerType}</p>
            </div>

            <button
              type="button"
              onClick={() => onSelectVehicle(vehicle)}
              className="px-3.5 py-2 rounded-lg border border-[#E4E7EC] hover:border-[#E30613] hover:text-[#E30613] text-xs font-semibold text-[#111827] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
            >
              Ver oferta
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
