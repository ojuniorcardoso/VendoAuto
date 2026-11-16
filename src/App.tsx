import { CheckCircle2, Heart, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DealerDashboard } from './components/dealer/DealerDashboard';
import { FipeAndSellSection } from './components/FipeAndSellSection';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { PublishAdModal } from './components/PublishAdModal';
import { SearchResultsPage } from './components/SearchResultsPage';
import { VehicleCard } from './components/VehicleCard';
import { VehicleDetailPage } from './components/VehicleDetailPage';
import {
  DEFAULT_DEALER_PROFILE,
  INITIAL_LEADS,
  INITIAL_VEHICLES,
} from './data/vehicles';
import {
  BodyType,
  DealerLead,
  DealerProfile,
  LeadStatus,
  SearchFilters,
  SortOption,
  Vehicle,
  VehicleStatus,
} from './types/vehicle';

type AppRoute =
  | { page: 'home' }
  | { page: 'search' }
  | { page: 'vehicle'; vehicleId: string }
  | { page: 'dealer' };

const DEFAULT_FILTERS: SearchFilters = {
  category: 'todos',
  bodyType: 'todos',
  query: '',
  city: 'todas',
  priceRange: 'all',
  minPrice: '',
  maxPrice: '',
  minYear: 'all',
  maxKm: 'all',
  transmission: 'all',
  fuel: 'all',
  onlyBelowFipe: false,
  onlyZeroKm: false,
  onlyAutomatic: false,
  onlyFavorites: false,
  sortBy: 'relevancia',
};

function parseHashRoute(): AppRoute {
  const hash = window.location.hash;
  if (hash.startsWith('#/veiculo/')) {
    const vehicleId = decodeURIComponent(hash.replace('#/veiculo/', ''));
    if (vehicleId) return { page: 'vehicle', vehicleId };
  }
  if (hash === '#/buscar') {
    return { page: 'search' };
  }
  if (hash === '#/lojista') {
    return { page: 'dealer' };
  }
  return { page: 'home' };
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => parseHashRoute());
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [leads, setLeads] = useState<DealerLead[]>(INITIAL_LEADS);
  const [dealerProfile, setDealerProfile] = useState<DealerProfile>(DEFAULT_DEALER_PROFILE);

  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vendoauto_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [publishedBanner, setPublishedBanner] = useState<string | null>(null);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHashRoute());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('vendoauto_favorites', JSON.stringify(favorites));
    } catch {
      // Ignore storage quota errors
    }
  }, [favorites]);

  const navigateTo = (nextRoute: AppRoute) => {
    if (nextRoute.page === 'home') {
      window.location.hash = '#/';
    } else if (nextRoute.page === 'search') {
      window.location.hash = '#/buscar';
    } else if (nextRoute.page === 'vehicle') {
      window.location.hash = `#/veiculo/${encodeURIComponent(nextRoute.vehicleId)}`;
    } else if (nextRoute.page === 'dealer') {
      window.location.hash = '#/lojista';
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateFilters = (patch: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenVehiclePage = (vehicle: Vehicle) => {
    setVehicles((prev) =>
      prev.map((item) =>
        item.id === vehicle.id ? { ...item, views: (item.views ?? 0) + 1 } : item
      )
    );
    navigateTo({ page: 'vehicle', vehicleId: vehicle.id });
  };

  const handleOpenSearchPage = () => {
    navigateTo({ page: 'search' });
  };

  const handleHeaderNavigation = (
    sectionId: string,
    category?: 'carros' | 'motos' | 'todos'
  ) => {
    if (category === 'carros' || category === 'motos') {
      setFilters({
        ...DEFAULT_FILTERS,
        category,
        bodyType: category === 'motos' ? 'moto' : 'todos',
      });
      navigateTo({ page: 'search' });
      return;
    }

    if (sectionId === 'topo') {
      navigateTo({ page: 'home' });
      return;
    }

    if (route.page !== 'home') {
      navigateTo({ page: 'home' });
      setTimeout(() => scrollToSection(sectionId), 80);
    } else {
      scrollToSection(sectionId);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const activePublicVehicles = useMemo(
    () => vehicles.filter((v) => (v.status ?? 'Ativo') === 'Ativo'),
    [vehicles]
  );

  const categoryCounts = useMemo<Record<BodyType, number>>(() => {
    const counts: Record<BodyType, number> = {
      todos: activePublicVehicles.length,
      suv: 0,
      sedan: 0,
      hatch: 0,
      picape: 0,
      eletrico: 0,
      moto: 0,
    };
    for (const v of activePublicVehicles) {
      counts[v.bodyType] = (counts[v.bodyType] || 0) + 1;
      if (v.isElectric && v.bodyType !== 'eletrico') {
        counts.eletrico += 1;
      }
    }
    return counts;
  }, [activePublicVehicles]);

  const filteredVehicles = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const minPriceNum = filters.minPrice ? Number(filters.minPrice) : null;
    const maxPriceNum = filters.maxPrice ? Number(filters.maxPrice) : null;
    const minYearNum = filters.minYear !== 'all' ? Number(filters.minYear) : null;
    const maxKmNum = filters.maxKm !== 'all' ? Number(filters.maxKm) : null;

    const list = activePublicVehicles.filter((v) => {
      if (filters.category === 'carros' && v.category !== 'carros') return false;
      if (filters.category === 'motos' && v.category !== 'motos') return false;
      if (filters.category === 'eletricos' && !v.isElectric && v.bodyType !== 'eletrico') {
        return false;
      }
      if (filters.category === 'zero_km' && !v.isZeroKm) return false;

      if (filters.bodyType !== 'todos') {
        if (filters.bodyType === 'eletrico') {
          if (!v.isElectric && v.bodyType !== 'eletrico') return false;
        } else if (v.bodyType !== filters.bodyType) {
          return false;
        }
      }

      if (filters.city !== 'todas') {
        const vehicleCityLabel = `${v.city} - ${v.state}`;
        if (vehicleCityLabel !== filters.city) return false;
      }

      if (filters.priceRange === 'up_to_90' && v.price > 90000) return false;
      if (filters.priceRange === '90_to_180' && (v.price < 90000 || v.price > 180000)) {
        return false;
      }
      if (filters.priceRange === 'above_180' && v.price <= 180000) return false;

      if (minPriceNum !== null && v.price < minPriceNum) return false;
      if (maxPriceNum !== null && v.price > maxPriceNum) return false;
      if (minYearNum !== null && v.yearModel < minYearNum) return false;
      if (maxKmNum !== null && v.mileage > maxKmNum) return false;

      if (filters.transmission === 'automatico' && v.transmission === 'Manual') return false;
      if (filters.transmission === 'manual' && v.transmission !== 'Manual') return false;
      if (filters.fuel !== 'all' && v.fuel !== filters.fuel) return false;

      if (filters.onlyBelowFipe && v.price >= v.fipePrice) return false;
      if (filters.onlyZeroKm && !v.isZeroKm) return false;
      if (filters.onlyAutomatic && v.transmission === 'Manual') return false;
      if (filters.onlyFavorites && !favorites.includes(v.id)) return false;

      if (q) {
        const haystack = `${v.brand} ${v.model} ${v.version} ${v.city} ${v.fuel}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    const sorted = [...list];
    switch (filters.sortBy) {
      case 'menor_preco':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'maior_preco':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'menor_km':
        sorted.sort((a, b) => a.mileage - b.mileage);
        break;
      case 'mais_novos':
        sorted.sort((a, b) => b.yearModel - a.yearModel);
        break;
      default:
        break;
    }

    return sorted;
  }, [activePublicVehicles, filters, favorites]);

  const selectedPageVehicle = useMemo(() => {
    if (route.page !== 'vehicle') return null;
    return vehicles.find((v) => v.id === route.vehicleId) ?? null;
  }, [route, vehicles]);

  const similarVehicles = useMemo(() => {
    if (!selectedPageVehicle) return [];
    return activePublicVehicles
      .filter((v) => v.id !== selectedPageVehicle.id)
      .sort((a, b) => {
        const aSameBody = a.bodyType === selectedPageVehicle.bodyType ? 1 : 0;
        const bSameBody = b.bodyType === selectedPageVehicle.bodyType ? 1 : 0;
        return bSameBody - aSameBody;
      })
      .slice(0, 3);
  }, [activePublicVehicles, selectedPageVehicle]);

  const hasActiveFilters =
    filters.category !== 'todos' ||
    filters.bodyType !== 'todos' ||
    filters.query.trim() !== '' ||
    filters.city !== 'todas' ||
    filters.priceRange !== 'all' ||
    filters.onlyBelowFipe ||
    filters.onlyAutomatic ||
    filters.onlyFavorites;

  const handleSaveVehicle = (savedVehicle: Vehicle) => {
    setVehicles((prev) => {
      const exists = prev.some((v) => v.id === savedVehicle.id);
      if (exists) {
        return prev.map((v) => (v.id === savedVehicle.id ? savedVehicle : v));
      }
      return [savedVehicle, ...prev];
    });
    setPublishModalOpen(false);
    setEditingVehicle(null);
    if (route.page !== 'dealer') {
      setFilters(DEFAULT_FILTERS);
      setPublishedBanner(
        `${savedVehicle.brand} ${savedVehicle.model} publicado com sucesso no catálogo.`
      );
      navigateTo({ page: 'vehicle', vehicleId: savedVehicle.id });
    }
  };

  const handleSubmitLead = (newLead: DealerLead) => {
    setLeads((prev) => [newLead, ...prev]);
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === newLead.vehicleId ? { ...v, leadsCount: (v.leadsCount ?? 0) + 1 } : v
      )
    );
  };

  const handleUpdateVehicleStatus = (id: string, status: VehicleStatus) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
  };

  const handleUpdateVehiclePrice = (id: string, newPrice: number) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, price: newPrice } : v)));
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const handleUpdateLeadStatus = (id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const handleUpdateLeadNotes = (id: string, notes: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes } : l)));
  };

  if (route.page === 'dealer') {
    return (
      <>
        <DealerDashboard
          vehicles={vehicles}
          leads={leads}
          dealerProfile={dealerProfile}
          onExitToPortal={() => navigateTo({ page: 'home' })}
          onOpenNewVehicle={() => {
            setEditingVehicle(null);
            setPublishModalOpen(true);
          }}
          onEditVehicle={(vehicle) => {
            setEditingVehicle(vehicle);
            setPublishModalOpen(true);
          }}
          onPreviewVehicle={(vehicle) => handleOpenVehiclePage(vehicle)}
          onUpdateVehicleStatus={handleUpdateVehicleStatus}
          onUpdateVehiclePrice={handleUpdateVehiclePrice}
          onDeleteVehicle={handleDeleteVehicle}
          onUpdateLeadStatus={handleUpdateLeadStatus}
          onUpdateLeadNotes={handleUpdateLeadNotes}
          onSaveProfile={setDealerProfile}
        />

        <PublishAdModal
          isOpen={publishModalOpen}
          editingVehicle={editingVehicle}
          onClose={() => {
            setPublishModalOpen(false);
            setEditingVehicle(null);
          }}
          onPublish={handleSaveVehicle}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#111827]">
      <Header
        onNavigateSection={handleHeaderNavigation}
        onOpenDealerPanel={() => navigateTo({ page: 'dealer' })}
        onOpenPublishModal={() => {
          setEditingVehicle(null);
          setPublishModalOpen(true);
        }}
      />

      <main className="flex-1">
        {route.page === 'vehicle' && selectedPageVehicle ? (
          <VehicleDetailPage
            vehicle={selectedPageVehicle}
            similarVehicles={similarVehicles}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSubmitLead={handleSubmitLead}
            onSelectVehicle={handleOpenVehiclePage}
            onFilterByBrand={(brand) => {
              setFilters({ ...DEFAULT_FILTERS, query: brand });
              navigateTo({ page: 'search' });
            }}
            onBackToResults={() => navigateTo({ page: 'search' })}
            onBackHome={() => navigateTo({ page: 'home' })}
          />
        ) : route.page === 'search' ? (
          <SearchResultsPage
            vehicles={filteredVehicles}
            filters={filters}
            favorites={favorites}
            onUpdateFilters={updateFilters}
            onResetFilters={() => setFilters(DEFAULT_FILTERS)}
            onToggleFavorite={toggleFavorite}
            onSelectVehicle={handleOpenVehiclePage}
            onBackHome={() => navigateTo({ page: 'home' })}
          />
        ) : (
          <>
            <HeroSearch
              filters={filters}
              availableVehicles={activePublicVehicles}
              onUpdateFilters={updateFilters}
              onSubmitSearch={handleOpenSearchPage}
              onSelectVehicle={handleOpenVehiclePage}
              categoryCounts={categoryCounts}
            />

            {/* Home Showcase Section */}
            <section id="catalogo" className="py-10 md:py-14">
              <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
                {publishedBanner && (
                  <div className="mb-6 p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between gap-4 text-sm text-[#065F46]">
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4.5 h-4.5 shrink-0" aria-hidden="true" />
                      <span>{publishedBanner}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPublishedBanner(null)}
                      className="text-xs font-semibold underline cursor-pointer shrink-0"
                    >
                      Dispensar
                    </button>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 pb-5 border-b border-[#E4E7EC]">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-[#111827] tracking-tight">
                      Ofertas em destaque no Brasil
                    </h2>
                    <p className="text-sm text-[#4B5563] mt-1 tabular-nums">
                      {filteredVehicles.length}{' '}
                      {filteredVehicles.length === 1
                        ? 'veículo disponível'
                        : 'veículos disponíveis'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateFilters({ onlyBelowFipe: !filters.onlyBelowFipe })}
                      aria-pressed={filters.onlyBelowFipe}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        filters.onlyBelowFipe
                          ? 'bg-[#111827] text-white border-[#111827]'
                          : 'bg-white text-[#374151] border-[#E4E7EC] hover:border-[#9CA3AF]'
                      }`}
                    >
                      Abaixo da FIPE
                    </button>

                    <button
                      type="button"
                      onClick={() => updateFilters({ onlyAutomatic: !filters.onlyAutomatic })}
                      aria-pressed={filters.onlyAutomatic}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        filters.onlyAutomatic
                          ? 'bg-[#111827] text-white border-[#111827]'
                          : 'bg-white text-[#374151] border-[#E4E7EC] hover:border-[#9CA3AF]'
                      }`}
                    >
                      Câmbio Automático
                    </button>

                    <button
                      type="button"
                      onClick={() => updateFilters({ onlyFavorites: !filters.onlyFavorites })}
                      aria-pressed={filters.onlyFavorites}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        filters.onlyFavorites
                          ? 'bg-[#E30613] text-white border-[#E30613]'
                          : 'bg-white text-[#374151] border-[#E4E7EC] hover:border-[#9CA3AF]'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="tabular-nums">Favoritos ({favorites.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenSearchPage}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#E4E7EC] bg-white text-[#111827] hover:border-[#E30613] hover:text-[#E30613] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Busca avançada</span>
                    </button>

                    <div>
                      <label htmlFor="sort-select" className="sr-only">
                        Ordenar ofertas
                      </label>
                      <select
                        id="sort-select"
                        value={filters.sortBy}
                        onChange={(e) =>
                          updateFilters({ sortBy: e.target.value as SortOption })
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

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-[#E30613] hover:bg-[#E30613]/8 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Limpar</span>
                      </button>
                    )}
                  </div>
                </div>

                {filteredVehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle) => (
                      <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        isFavorite={favorites.includes(vehicle.id)}
                        onToggleFavorite={toggleFavorite}
                        onSelectVehicle={handleOpenVehiclePage}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-[#E4E7EC] p-10 text-center max-w-lg mx-auto my-6">
                    <h3 className="font-display text-lg font-bold text-[#111827]">
                      Nenhum veículo encontrado com esses filtros
                    </h3>
                    <p className="text-sm text-[#4B5563] mt-1.5">
                      Tente ampliar a faixa de preço, escolher outra cidade ou limpar os filtros
                      ativos.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFilters(DEFAULT_FILTERS)}
                      className="mt-5 px-5 py-2.5 rounded-lg bg-[#E30613] hover:bg-[#C20510] text-white text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Mostrar todos os veículos
                    </button>
                  </div>
                )}
              </div>
            </section>

            <FipeAndSellSection
              onFilterByBrand={(brand) => {
                setFilters({ ...DEFAULT_FILTERS, query: brand });
                navigateTo({ page: 'search' });
              }}
              onOpenPublishModal={() => {
                setEditingVehicle(null);
                setPublishModalOpen(true);
              }}
              onOpenDealerPanel={() => navigateTo({ page: 'dealer' })}
            />
          </>
        )}
      </main>

      <Footer
        onSelectCity={(city) => {
          setFilters({ ...DEFAULT_FILTERS, city });
          navigateTo({ page: 'search' });
        }}
        onSelectCategory={(category) => {
          setFilters({
            ...DEFAULT_FILTERS,
            category,
            bodyType: category === 'motos' ? 'moto' : 'todos',
          });
          navigateTo({ page: 'search' });
        }}
        onOpenPublishModal={() => {
          setEditingVehicle(null);
          setPublishModalOpen(true);
        }}
      />

      <PublishAdModal
        isOpen={publishModalOpen}
        editingVehicle={editingVehicle}
        onClose={() => {
          setPublishModalOpen(false);
          setEditingVehicle(null);
        }}
        onPublish={handleSaveVehicle}
      />
    </div>
  );
}
