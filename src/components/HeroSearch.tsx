import { ArrowRight, Bike, Car, MapPin, Search, Truck, Zap } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { BRAZILIAN_CITIES } from '../data/vehicles';
import { BodyType, SearchFilters, Vehicle, VehicleCategory } from '../types/vehicle';
import { formatBRL } from '../utils/format';

interface HeroSearchProps {
  filters: SearchFilters;
  availableVehicles: Vehicle[];
  onUpdateFilters: (patch: Partial<SearchFilters>) => void;
  onSubmitSearch: () => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  categoryCounts: Record<BodyType, number>;
}

const CATEGORY_TABS: { id: VehicleCategory; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'carros', label: 'Carros' },
  { id: 'motos', label: 'Motos' },
  { id: 'eletricos', label: 'Elétricos & Híbridos' },
  { id: 'zero_km', label: '0 KM' },
];

const BODY_STYLES: { id: BodyType; label: string; icon: 'car' | 'suv' | 'pickup' | 'ev' | 'moto' }[] = [
  { id: 'todos', label: 'Todos os estilos', icon: 'car' },
  { id: 'suv', label: 'SUVs', icon: 'suv' },
  { id: 'sedan', label: 'Sedãs', icon: 'car' },
  { id: 'hatch', label: 'Hatches', icon: 'car' },
  { id: 'picape', label: 'Picapes', icon: 'pickup' },
  { id: 'eletrico', label: 'Elétricos', icon: 'ev' },
  { id: 'moto', label: 'Motos', icon: 'moto' },
];

export function HeroSearch({
  filters,
  availableVehicles,
  onUpdateFilters,
  onSubmitSearch,
  onSelectVehicle,
  categoryCounts,
}: HeroSearchProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const quickMatches = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    if (!q) return [];
    return availableVehicles.filter((v) =>
      `${v.brand} ${v.model} ${v.version} ${v.city} ${v.fuel}`.toLowerCase().includes(q)
    );
  }, [availableVehicles, filters.query]);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setDropdownOpen(false);
    onSubmitSearch();
  };

  const renderIcon = (type: 'car' | 'suv' | 'pickup' | 'ev' | 'moto') => {
    switch (type) {
      case 'pickup':
        return <Truck className="w-4 h-4 shrink-0" aria-hidden="true" />;
      case 'ev':
        return <Zap className="w-4 h-4 shrink-0" aria-hidden="true" />;
      case 'moto':
        return <Bike className="w-4 h-4 shrink-0" aria-hidden="true" />;
      default:
        return <Car className="w-4 h-4 shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <section id="topo" className="relative bg-[#111827] overflow-visible">
      {/* Background image with measured contrast scrim */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/src/assets/images/hero_showroom_automotive_1794852433661.jpg"
          alt="Showroom automotivo moderno com veículo em destaque"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#111827]/85 via-[#111827]/65 to-[#111827]/90" />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 pb-10 md:pt-16 md:pb-14">
        <div className="max-w-2xl mb-8">
          <p className="text-sm font-medium text-white/85 mb-2">
            Classificados automotivos em todo o Brasil
          </p>
          <h1
            className="font-display text-white font-extrabold tracking-tight leading-[1.12]"
            style={{
              fontSize: 'clamp(1.875rem, 3.8vw, 3rem)',
              textWrap: 'balance',
            }}
          >
            Encontre o seu próximo carro com transparência e preço justo
          </h1>
        </div>

        {/* Chaves na Mão style unified search box */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E4E7EC] p-4 sm:p-5">
          {/* Category Segmented Tabs */}
          <div
            role="tablist"
            aria-label="Tipo de veículo"
            className="flex flex-wrap items-center gap-1.5 border-b border-[#E4E7EC] pb-3.5 mb-4"
          >
            {CATEGORY_TABS.map((tab) => {
              const active = filters.category === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() =>
                    onUpdateFilters({
                      category: tab.id,
                      bodyType: tab.id === 'motos' ? 'moto' : 'todos',
                    })
                  }
                  className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#E30613] text-white'
                      : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Inputs Row */}
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div ref={searchBoxRef} className="md:col-span-5 relative">
              <label htmlFor="search-query" className="block text-xs font-medium text-[#4B5563] mb-1">
                Marca, modelo ou versão
              </label>
              <div className="relative">
                <Search
                  className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="search-query"
                  type="text"
                  value={filters.query}
                  onFocus={() => setDropdownOpen(true)}
                  onChange={(e) => {
                    onUpdateFilters({ query: e.target.value });
                    setDropdownOpen(true);
                  }}
                  placeholder="Ex: Polo, Volvo XC60, Honda CB..."
                  autoComplete="off"
                  className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-[#D1D5DB] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/15"
                />
              </div>

              {/* Instant Live Suggestions Dropdown */}
              {dropdownOpen && filters.query.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-xl border border-[#E4E7EC] shadow-xl overflow-hidden">
                  {quickMatches.length > 0 ? (
                    <>
                      <div className="divide-y divide-[#F0F2F5] max-h-72 overflow-y-auto">
                        {quickMatches.slice(0, 5).map((vehicle) => (
                          <button
                            key={vehicle.id}
                            type="button"
                            onClick={() => {
                              setDropdownOpen(false);
                              onSelectVehicle(vehicle);
                            }}
                            className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-[#F7F8FA] transition-colors text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={vehicle.imageUrl}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                referrerPolicy="no-referrer"
                                className="w-12 h-9 rounded object-cover bg-[#F3F4F6] shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#111827] truncate">
                                  {vehicle.brand} {vehicle.model}
                                </p>
                                <p className="text-xs text-[#6B7280] truncate">
                                  {vehicle.version} · {vehicle.city}-{vehicle.state}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-[#111827] tabular-nums shrink-0">
                              {formatBRL(vehicle.price)}
                            </span>
                          </button>
                        ))}
                      </div>
                      <button
                        type="submit"
                        className="w-full px-4 py-3 bg-[#F7F8FA] hover:bg-[#F0F2F5] border-t border-[#E4E7EC] flex items-center justify-between text-xs font-bold text-[#E30613] cursor-pointer"
                      >
                        <span>
                          Ver todos os {quickMatches.length} disponíveis para "{filters.query.trim()}"
                        </span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="submit"
                      className="w-full px-4 py-3 text-left text-xs text-[#4B5563] hover:bg-[#F7F8FA] flex items-center justify-between cursor-pointer"
                    >
                      <span>Abrir página de busca com filtro lateral para "{filters.query.trim()}"</span>
                      <ArrowRight className="w-4 h-4 text-[#E30613]" aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="md:col-span-3">
              <label htmlFor="search-city" className="block text-xs font-medium text-[#4B5563] mb-1">
                Cidade ou estado
              </label>
              <div className="relative">
                <MapPin
                  className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <select
                  id="search-city"
                  value={filters.city}
                  onChange={(e) => onUpdateFilters({ city: e.target.value })}
                  className="w-full h-11 pl-10 pr-3 rounded-lg border border-[#D1D5DB] bg-white text-sm text-[#111827] focus:outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/15"
                >
                  <option value="todas">Todo o Brasil</option>
                  {BRAZILIAN_CITIES.map((cityLabel) => (
                    <option key={cityLabel} value={cityLabel}>
                      {cityLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="search-price" className="block text-xs font-medium text-[#4B5563] mb-1">
                Faixa de preço
              </label>
              <select
                id="search-price"
                value={filters.priceRange}
                onChange={(e) =>
                  onUpdateFilters({
                    priceRange: e.target.value as SearchFilters['priceRange'],
                  })
                }
                className="w-full h-11 px-3 rounded-lg border border-[#D1D5DB] bg-white text-sm text-[#111827] focus:outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/15"
              >
                <option value="all">Qualquer valor</option>
                <option value="up_to_90">Até R$ 90 mil</option>
                <option value="90_to_180">R$ 90 mil a R$ 180 mil</option>
                <option value="above_180">Acima de R$ 180 mil</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full h-11 px-4 rounded-lg bg-[#E30613] hover:bg-[#C20510] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E30613]"
              >
                <span>Buscar ofertas</span>
              </button>
            </div>
          </form>
        </div>

        {/* Body-style quick filter buttons below search */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
          {BODY_STYLES.map((style) => {
            const active = filters.bodyType === style.id;
            const count = categoryCounts[style.id] ?? 0;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  onUpdateFilters({
                    bodyType: style.id,
                    category: style.id === 'moto' ? 'motos' : 'todos',
                  });
                  onSubmitSearch();
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-[#111827] shadow-sm'
                    : 'bg-white/12 text-white hover:bg-white/20'
                }`}
              >
                {renderIcon(style.icon)}
                <span>{style.label}</span>
                <span
                  className={`text-xs tabular-nums ${
                    active ? 'text-[#6B7280]' : 'text-white/75'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
