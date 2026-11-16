import { ChevronRight, Heart, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { BRAZILIAN_CITIES } from '../data/vehicles';
import { BodyType, SearchFilters, SortOption, Vehicle, VehicleCategory } from '../types/vehicle';
import { VehicleCard } from './VehicleCard';

interface SearchResultsPageProps {
  vehicles: Vehicle[];
  filters: SearchFilters;
  favorites: string[];
  onUpdateFilters: (patch: Partial<SearchFilters>) => void;
  onResetFilters: () => void;
  onToggleFavorite: (id: string) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onBackHome: () => void;
}

const CATEGORY_OPTIONS: { id: VehicleCategory; label: string }[] = [
  { id: 'todos', label: 'Todos os veículos' },
  { id: 'carros', label: 'Carros' },
  { id: 'motos', label: 'Motos' },
  { id: 'eletricos', label: 'Elétricos & Híbridos' },
  { id: 'zero_km', label: '0 KM' },
];

const BODY_OPTIONS: { id: BodyType; label: string }[] = [
  { id: 'todos', label: 'Todas' },
  { id: 'suv', label: 'SUV' },
  { id: 'sedan', label: 'Sedã' },
  { id: 'hatch', label: 'Hatchback' },
  { id: 'picape', label: 'Picape' },
  { id: 'eletrico', label: 'Elétrico' },
  { id: 'moto', label: 'Moto' },
];

const FUEL_OPTIONS: Vehicle['fuel'][] = [
  'Flex',
  'Gasolina',
  'Diesel',
  'Elétrico',
  'Híbrido Plug-in',
];

export function SearchResultsPage({
  vehicles,
  filters,
  favorites,
  onUpdateFilters,
  onResetFilters,
  onToggleFavorite,
  onSelectVehicle,
  onBackHome,
}: SearchResultsPageProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFilterCount = [
    filters.category !== 'todos',
    filters.bodyType !== 'todos',
    filters.query.trim() !== '',
    filters.city !== 'todas',
    filters.priceRange !== 'all',
    filters.minPrice !== '',
    filters.maxPrice !== '',
    filters.minYear !== 'all',
    filters.maxKm !== 'all',
    filters.transmission !== 'all',
    filters.fuel !== 'all',
    filters.onlyBelowFipe,
    filters.onlyZeroKm,
    filters.onlyAutomatic,
    filters.onlyFavorites,
  ].filter(Boolean).length;

  const sidebarForm = (
    <div className="space-y-5">
      {/* Header of Sidebar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#E30613]" aria-hidden="true" />
          <h2 className="font-display text-base font-bold text-[#111827]">Filtros</h2>
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#E30613] hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>Limpar ({activeFilterCount})</span>
          </button>
        )}
      </div>

      {/* Text Search */}
      <div>
        <label
          htmlFor="sidebar-query"
          className="block text-xs font-semibold text-[#374151] mb-1.5"
        >
          Marca, modelo ou palavra-chave
        </label>
        <div className="relative">
          <Search
            className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="sidebar-query"
            type="text"
            value={filters.query}
            onChange={(e) => onUpdateFilters({ query: e.target.value })}
            placeholder="Ex: Polo, XC60, Honda..."
            className="w-full h-10 pl-9 pr-8 rounded-lg border border-[#D1D5DB] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E30613]"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => onUpdateFilters({ query: '' })}
              aria-label="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <span className="block text-xs font-semibold text-[#374151] mb-1.5">Categoria</span>
        <div className="space-y-1">
          {CATEGORY_OPTIONS.map((cat) => {
            const active = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  onUpdateFilters({
                    category: cat.id,
                    bodyType: cat.id === 'motos' ? 'moto' : 'todos',
                  })
                }
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#111827] text-white font-semibold'
                    : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="sidebar-city" className="block text-xs font-semibold text-[#374151] mb-1.5">
          Localização
        </label>
        <select
          id="sidebar-city"
          value={filters.city}
          onChange={(e) => onUpdateFilters({ city: e.target.value })}
          className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] bg-white text-sm text-[#111827] focus:outline-none focus:border-[#E30613]"
        >
          <option value="todas">Todo o Brasil</option>
          {BRAZILIAN_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Price Min / Max */}
      <div>
        <span className="block text-xs font-semibold text-[#374151] mb-1.5">Preço (R$)</span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="sidebar-min-price" className="sr-only">
              Preço mínimo
            </label>
            <input
              id="sidebar-min-price"
              type="number"
              min={0}
              step={5000}
              value={filters.minPrice}
              onChange={(e) =>
                onUpdateFilters({ minPrice: e.target.value, priceRange: 'all' })
              }
              placeholder="Mínimo"
              className="w-full h-9 px-2.5 rounded-lg border border-[#D1D5DB] text-xs tabular-nums focus:outline-none focus:border-[#E30613]"
            />
          </div>
          <div>
            <label htmlFor="sidebar-max-price" className="sr-only">
              Preço máximo
            </label>
            <input
              id="sidebar-max-price"
              type="number"
              min={0}
              step={5000}
              value={filters.maxPrice}
              onChange={(e) =>
                onUpdateFilters({ maxPrice: e.target.value, priceRange: 'all' })
              }
              placeholder="Máximo"
              className="w-full h-9 px-2.5 rounded-lg border border-[#D1D5DB] text-xs tabular-nums focus:outline-none focus:border-[#E30613]"
            />
          </div>
        </div>
      </div>

      {/* Year & Mileage */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="sidebar-year" className="block text-xs font-semibold text-[#374151] mb-1">
            Ano mínimo
          </label>
          <select
            id="sidebar-year"
            value={filters.minYear}
            onChange={(e) => onUpdateFilters({ minYear: e.target.value })}
            className="w-full h-9 px-2 rounded-lg border border-[#D1D5DB] bg-white text-xs tabular-nums focus:outline-none focus:border-[#E30613]"
          >
            <option value="all">Todos</option>
            <option value="2020">2020+</option>
            <option value="2022">2022+</option>
            <option value="2023">2023+</option>
            <option value="2024">2024+</option>
          </select>
        </div>

        <div>
          <label htmlFor="sidebar-km" className="block text-xs font-semibold text-[#374151] mb-1">
            KM máxima
          </label>
          <select
            id="sidebar-km"
            value={filters.maxKm}
            onChange={(e) => onUpdateFilters({ maxKm: e.target.value })}
            className="w-full h-9 px-2 rounded-lg border border-[#D1D5DB] bg-white text-xs tabular-nums focus:outline-none focus:border-[#E30613]"
          >
            <option value="all">Qualquer</option>
            <option value="10000">Até 10 mil</option>
            <option value="30000">Até 30 mil</option>
            <option value="60000">Até 60 mil</option>
          </select>
        </div>
      </div>

      {/* Body Type */}
      <div>
        <label htmlFor="sidebar-body" className="block text-xs font-semibold text-[#374151] mb-1.5">
          Carroceria
        </label>
        <select
          id="sidebar-body"
          value={filters.bodyType}
          onChange={(e) => onUpdateFilters({ bodyType: e.target.value as BodyType })}
          className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] bg-white text-sm text-[#111827] focus:outline-none focus:border-[#E30613]"
        >
          {BODY_OPTIONS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      {/* Transmission */}
      <div>
        <span className="block text-xs font-semibold text-[#374151] mb-1.5">Câmbio</span>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { id: 'all', label: 'Todos' },
              { id: 'automatico', label: 'Automático' },
              { id: 'manual', label: 'Manual' },
            ] as const
          ).map((item) => {
            const active = filters.transmission === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onUpdateFilters({
                    transmission: item.id,
                    onlyAutomatic: item.id === 'automatico',
                  })
                }
                className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#111827] text-white border-[#111827]'
                    : 'bg-white text-[#4B5563] border-[#E4E7EC] hover:border-[#9CA3AF]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fuel */}
      <div>
        <label htmlFor="sidebar-fuel" className="block text-xs font-semibold text-[#374151] mb-1.5">
          Combustível
        </label>
        <select
          id="sidebar-fuel"
          value={filters.fuel}
          onChange={(e) =>
            onUpdateFilters({ fuel: e.target.value as SearchFilters['fuel'] })
          }
          className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] bg-white text-sm text-[#111827] focus:outline-none focus:border-[#E30613]"
        >
          <option value="all">Todos os combustíveis</option>
          {FUEL_OPTIONS.map((fuel) => (
            <option key={fuel} value={fuel}>
              {fuel}
            </option>
          ))}
        </select>
      </div>

      {/* Checkboxes */}
      <div className="pt-2 border-t border-[#E4E7EC] space-y-2.5">
        <label className="flex items-center gap-2.5 text-xs font-medium text-[#374151] cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyBelowFipe}
            onChange={(e) => onUpdateFilters({ onlyBelowFipe: e.target.checked })}
            className="w-4 h-4 rounded accent-[#E30613] cursor-pointer"
          />
          <span>Somente abaixo da Tabela FIPE</span>
        </label>

        <label className="flex items-center gap-2.5 text-xs font-medium text-[#374151] cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyZeroKm}
            onChange={(e) => onUpdateFilters({ onlyZeroKm: e.target.checked })}
            className="w-4 h-4 rounded accent-[#E30613] cursor-pointer"
          />
          <span>Somente veículos 0 KM</span>
        </label>

        <label className="flex items-center gap-2.5 text-xs font-medium text-[#374151] cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyFavorites}
            onChange={(e) => onUpdateFilters({ onlyFavorites: e.target.checked })}
            className="w-4 h-4 rounded accent-[#E30613] cursor-pointer"
          />
          <span className="inline-flex items-center gap-1">
            <span>Apenas meus favoritos</span>
            <span className="tabular-nums text-[#6B7280]">({favorites.length})</span>
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="py-6 md:py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-5">
          <button
            type="button"
            onClick={onBackHome}
            className="hover:text-[#E30613] transition-colors cursor-pointer"
          >
            Início
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
          <span className="font-semibold text-[#111827]">
            {filters.query.trim()
              ? `Resultados para "${filters.query.trim()}"`
              : 'Veículos disponíveis'}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Desktop Left Sidebar Filter */}
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-xl border border-[#E4E7EC] p-5 sticky top-20">
            {sidebarForm}
          </aside>

          {/* Mobile Filter Drawer */}
          {mobileFiltersOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Filtros de busca"
              className="fixed inset-0 z-50 lg:hidden flex"
            >
              <div
                className="fixed inset-0 bg-[#111827]/60"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="relative w-80 max-w-[85vw] bg-white h-full overflow-y-auto p-5 z-10 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display font-bold text-base text-[#111827]">
                    Filtrar ofertas
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Fechar filtros"
                    className="p-2 rounded-lg border border-[#E4E7EC] text-[#374151]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {sidebarForm}
                <div className="mt-6 pt-4 border-t border-[#E4E7EC]">
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full h-11 rounded-lg bg-[#E30613] text-white text-sm font-semibold"
                  >
                    Ver {vehicles.length} veículos
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right Main Results Area */}
          <div className="lg:col-span-9 space-y-5">
            {/* Results Header Bar */}
            <div className="bg-white rounded-xl border border-[#E4E7EC] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
                  {filters.query.trim()
                    ? `Ofertas para "${filters.query.trim()}"`
                    : 'Carros e motos disponíveis'}
                </h1>
                <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5 tabular-nums">
                  {vehicles.length}{' '}
                  {vehicles.length === 1 ? 'veículo disponível' : 'veículos disponíveis'}
                  {filters.city !== 'todas' ? ` em ${filters.city}` : ' em todo o Brasil'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E4E7EC] bg-white text-xs font-semibold text-[#111827]"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#E30613]" aria-hidden="true" />
                  <span>
                    Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateFilters({ onlyFavorites: !filters.onlyFavorites })}
                  aria-pressed={filters.onlyFavorites}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    filters.onlyFavorites
                      ? 'bg-[#E30613] text-white border-[#E30613]'
                      : 'bg-white text-[#374151] border-[#E4E7EC] hover:border-[#9CA3AF]'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="tabular-nums">Favoritos ({favorites.length})</span>
                </button>

                <div>
                  <label htmlFor="results-sort" className="sr-only">
                    Ordenar resultados
                  </label>
                  <select
                    id="results-sort"
                    value={filters.sortBy}
                    onChange={(e) =>
                      onUpdateFilters({ sortBy: e.target.value as SortOption })
                    }
                    className="h-9 px-3 rounded-lg border border-[#E4E7EC] bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#E30613] cursor-pointer"
                  >
                    <option value="relevancia">Mais relevantes</option>
                    <option value="menor_preco">Menor preço</option>
                    <option value="maior_preco">Maior preço</option>
                    <option value="menor_km">Menor quilometragem</option>
                    <option value="mais_novos">Ano mais novo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid or Empty State */}
            {vehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    isFavorite={favorites.includes(vehicle.id)}
                    onToggleFavorite={onToggleFavorite}
                    onSelectVehicle={onSelectVehicle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#E4E7EC] p-10 text-center">
                <h2 className="font-display text-lg font-bold text-[#111827]">
                  Nenhum veículo disponível para esta busca
                </h2>
                <p className="text-sm text-[#4B5563] mt-1.5 max-w-md mx-auto">
                  Não encontramos veículos com os critérios selecionados no filtro lateral.
                  Experimente limpar os filtros ou buscar outra marca.
                </p>
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="mt-5 px-5 py-2.5 rounded-lg bg-[#E30613] hover:bg-[#C20510] text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Limpar todos os filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
