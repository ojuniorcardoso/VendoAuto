import {
  ArrowLeft,
  BarChart3,
  Car,
  Check,
  Edit3,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { BRAZILIAN_CITIES } from '../../data/vehicles';
import {
  DealerLead,
  DealerProfile,
  LeadStatus,
  Vehicle,
  VehicleStatus,
} from '../../types/vehicle';
import { formatBRL, formatKm } from '../../utils/format';

type DealerTab = 'overview' | 'inventory' | 'leads' | 'settings';

interface DealerDashboardProps {
  vehicles: Vehicle[];
  leads: DealerLead[];
  dealerProfile: DealerProfile;
  onExitToPortal: () => void;
  onOpenNewVehicle: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onPreviewVehicle: (vehicle: Vehicle) => void;
  onUpdateVehicleStatus: (id: string, status: VehicleStatus) => void;
  onUpdateVehiclePrice: (id: string, newPrice: number) => void;
  onDeleteVehicle: (id: string) => void;
  onUpdateLeadStatus: (id: string, status: LeadStatus) => void;
  onUpdateLeadNotes: (id: string, notes: string) => void;
  onSaveProfile: (profile: DealerProfile) => void;
}

const TAB_LABELS: Record<DealerTab, string> = {
  overview: 'Visão Geral',
  inventory: 'Meu Estoque',
  leads: 'Propostas e Leads',
  settings: 'Configurações da Loja',
};

const BODY_LABELS: Record<Vehicle['bodyType'], string> = {
  suv: 'SUVs',
  sedan: 'Sedãs',
  hatch: 'Hatches',
  picape: 'Picapes',
  eletrico: 'Elétricos',
  moto: 'Motos',
};

export function DealerDashboard({
  vehicles,
  leads,
  dealerProfile,
  onExitToPortal,
  onOpenNewVehicle,
  onEditVehicle,
  onPreviewVehicle,
  onUpdateVehicleStatus,
  onUpdateVehiclePrice,
  onDeleteVehicle,
  onUpdateLeadStatus,
  onUpdateLeadNotes,
  onSaveProfile,
}: DealerDashboardProps) {
  const [activeTab, setActiveTab] = useState<DealerTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Inventory filters & inline price editing
  const [inventoryQuery, setInventoryQuery] = useState('');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<'Todos' | VehicleStatus>('Todos');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Leads filters & selection
  const [leadStatusFilter, setLeadStatusFilter] = useState<'Todos' | LeadStatus>('Todos');
  const [leadQuery, setLeadQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.id ?? null);

  // Settings form state
  const [profileForm, setProfileForm] = useState<DealerProfile>(dealerProfile);
  const [profileSaved, setProfileSaved] = useState(false);

  // Computed metrics
  const metrics = useMemo(() => {
    const activeVehicles = vehicles.filter((v) => (v.status ?? 'Ativo') === 'Ativo');
    const pausedVehicles = vehicles.filter((v) => v.status === 'Pausado');
    const soldVehicles = vehicles.filter((v) => v.status === 'Vendido');
    const totalStockValue = activeVehicles.reduce((acc, v) => acc + v.price, 0);
    const totalViews = vehicles.reduce((acc, v) => acc + (v.views ?? 0), 0);
    const newLeadsCount = leads.filter((l) => l.status === 'Novo').length;
    const convertedLeads = leads.filter((l) => l.status === 'Convertido').length;

    return {
      activeCount: activeVehicles.length,
      pausedCount: pausedVehicles.length,
      soldCount: soldVehicles.length,
      totalStockValue,
      totalViews,
      totalLeads: leads.length,
      newLeadsCount,
      convertedLeads,
    };
  }, [vehicles, leads]);

  const bodyBreakdown = useMemo(() => {
    const counts: Record<Vehicle['bodyType'], number> = {
      suv: 0,
      sedan: 0,
      hatch: 0,
      picape: 0,
      eletrico: 0,
      moto: 0,
    };
    for (const v of vehicles) {
      counts[v.bodyType] = (counts[v.bodyType] || 0) + 1;
    }
    const max = Math.max(...Object.values(counts), 1);
    return (Object.keys(counts) as Vehicle['bodyType'][]).map((key) => ({
      key,
      label: BODY_LABELS[key],
      count: counts[key],
      percent: Math.round((counts[key] / max) * 100),
    }));
  }, [vehicles]);

  const filteredInventory = useMemo(() => {
    const q = inventoryQuery.trim().toLowerCase();
    return vehicles.filter((v) => {
      const status = v.status ?? 'Ativo';
      if (inventoryStatusFilter !== 'Todos' && status !== inventoryStatusFilter) return false;
      if (!q) return true;
      return `${v.brand} ${v.model} ${v.version} ${v.city}`.toLowerCase().includes(q);
    });
  }, [vehicles, inventoryQuery, inventoryStatusFilter]);

  const filteredLeads = useMemo(() => {
    const q = leadQuery.trim().toLowerCase();
    return leads.filter((l) => {
      if (leadStatusFilter !== 'Todos' && l.status !== leadStatusFilter) return false;
      if (!q) return true;
      return `${l.buyerName} ${l.vehicleTitle} ${l.message}`.toLowerCase().includes(q);
    });
  }, [leads, leadStatusFilter, leadQuery]);

  const activeLead = useMemo(() => {
    return (
      leads.find((l) => l.id === selectedLeadId) ??
      filteredLeads[0] ??
      leads[0] ??
      null
    );
  }, [leads, filteredLeads, selectedLeadId]);

  const handleSaveInlinePrice = (id: string) => {
    const parsed = Number(editingPriceValue.replace(/\D/g, ''));
    if (parsed >= 5000) {
      onUpdateVehiclePrice(id, parsed);
    }
    setEditingPriceId(null);
  };

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveProfile(profileForm);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 4000);
  };

  const renderStatusText = (status: VehicleStatus) => {
    switch (status) {
      case 'Ativo':
        return <span className="font-semibold text-[#16A34A]">Ativo</span>;
      case 'Pausado':
        return <span className="font-semibold text-[#D97706]">Pausado</span>;
      case 'Vendido':
        return <span className="font-semibold text-[#4B5563]">Vendido</span>;
    }
  };

  const renderLeadStatusText = (status: LeadStatus) => {
    switch (status) {
      case 'Novo':
        return <span className="font-semibold text-[#E30613]">Novo</span>;
      case 'Em atendimento':
        return <span className="font-semibold text-[#D97706]">Em atendimento</span>;
      case 'Convertido':
        return <span className="font-semibold text-[#16A34A]">Convertido</span>;
      case 'Arquivado':
        return <span className="font-medium text-[#6B7280]">Arquivado</span>;
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E4E7EC]">
      {/* Brand + Dealer header */}
      <div className="px-5 h-16 border-b border-[#E4E7EC] flex items-center justify-between">
        <button
          type="button"
          onClick={onExitToPortal}
          aria-label="Voltar ao portal VENDOAUTO.com.br"
          className="flex items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] rounded-md"
        >
          <img
            src="/assets/aistudio/VendoAuto-logo_a6ab9ab0.png"
            alt="VENDOAUTO.com.br"
            className="h-11 w-auto object-contain mix-blend-multiply"
          />
        </button>
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Fechar menu lateral"
          className="lg:hidden p-1.5 rounded-lg text-[#4B5563] hover:bg-[#F3F4F6]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Store Identity Block */}
      <div className="px-5 py-4 border-b border-[#E4E7EC] bg-[#F7F8FA]">
        <p className="text-xs font-medium text-[#6B7280]">Conta lojista</p>
        <p className="font-display text-sm font-bold text-[#111827] truncate mt-0.5">
          {dealerProfile.storeName}
        </p>
        <p className="text-xs text-[#4B5563] truncate">{dealerProfile.cityUf}</p>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Menu do painel do lojista" className="flex-1 p-3 space-y-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab('overview');
            setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#111827] text-white'
              : 'text-[#374151] hover:bg-[#F3F4F6]'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <LayoutDashboard className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Visão Geral</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('inventory');
            setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-[#111827] text-white'
              : 'text-[#374151] hover:bg-[#F3F4F6]'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <Car className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Meu Estoque</span>
          </span>
          <span
            className={`text-xs tabular-nums ${
              activeTab === 'inventory' ? 'text-white/80' : 'text-[#6B7280]'
            }`}
          >
            {vehicles.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('leads');
            setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'leads'
              ? 'bg-[#111827] text-white'
              : 'text-[#374151] hover:bg-[#F3F4F6]'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <Inbox className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Propostas e Leads</span>
          </span>
          {metrics.newLeadsCount > 0 && (
            <span
              className={`text-xs font-bold tabular-nums ${
                activeTab === 'leads' ? 'text-[#FCA5A5]' : 'text-[#E30613]'
              }`}
            >
              {metrics.newLeadsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('settings');
            setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-[#111827] text-white'
              : 'text-[#374151] hover:bg-[#F3F4F6]'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Configurações da Loja</span>
          </span>
        </button>
      </nav>

      {/* Bottom return to portal */}
      <div className="p-3 border-t border-[#E4E7EC]">
        <button
          type="button"
          onClick={onExitToPortal}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Voltar ao Portal Público</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menu do painel"
        >
          <div
            className="fixed inset-0 bg-[#111827]/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10">{sidebarContent}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar Contract (Breadcrumb left, 1-2 actions right) */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E4E7EC] px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Abrir navegação do painel"
              className="lg:hidden w-10 h-10 rounded-lg border border-[#E4E7EC] flex items-center justify-center text-[#111827] hover:bg-[#F3F4F6] shrink-0 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm truncate">
              <span className="text-[#6B7280] font-medium hidden sm:inline">
                Painel do Lojista
              </span>
              <span className="text-[#D1D5DB] hidden sm:inline" aria-hidden="true">
                /
              </span>
              <h1 className="font-display font-bold text-[#111827] truncate">
                {TAB_LABELS[activeTab]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onExitToPortal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E4E7EC] text-xs font-semibold text-[#374151] hover:bg-[#F3F4F6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ver Portal</span>
            </button>

            <button
              type="button"
              onClick={onOpenNewVehicle}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E30613] hover:bg-[#C20510] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Novo Veículo</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1200px] w-full mx-auto space-y-6">
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'overview' && (
            <>
              {/* 4-Column Flat KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-[#E4E7EC] p-5">
                  <p className="text-xs font-medium text-[#6B7280]">Veículos em estoque</p>
                  <p className="font-display text-2xl font-extrabold text-[#111827] tabular-nums mt-1.5">
                    {metrics.activeCount} ativos
                  </p>
                  <p className="text-xs text-[#4B5563] mt-1 tabular-nums">
                    {metrics.pausedCount} pausados · {metrics.soldCount} vendidos
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-[#E4E7EC] p-5">
                  <p className="text-xs font-medium text-[#6B7280]">Valor total do estoque</p>
                  <p className="font-display text-2xl font-extrabold text-[#111827] tabular-nums mt-1.5">
                    {formatBRL(metrics.totalStockValue)}
                  </p>
                  <p className="text-xs text-[#4B5563] mt-1">
                    Soma dos anúncios publicados
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-[#E4E7EC] p-5">
                  <p className="text-xs font-medium text-[#6B7280]">Propostas recebidas</p>
                  <p className="font-display text-2xl font-extrabold text-[#111827] tabular-nums mt-1.5">
                    {metrics.totalLeads}
                  </p>
                  <p className="text-xs text-[#E30613] font-medium mt-1 tabular-nums">
                    {metrics.newLeadsCount} aguardando retorno · {metrics.convertedLeads} convertidas
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-[#E4E7EC] p-5">
                  <p className="text-xs font-medium text-[#6B7280]">Visualizações acumuladas</p>
                  <p className="font-display text-2xl font-extrabold text-[#111827] tabular-nums mt-1.5">
                    {metrics.totalViews.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-[#16A34A] font-medium mt-1">
                    Tráfego orgânico do portal
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Recent Leads Table */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-[#E4E7EC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E4E7EC] flex items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-base font-bold text-[#111827]">
                        Propostas recentes
                      </h2>
                      <p className="text-xs text-[#6B7280]">
                        Interessados que enviaram contato pelo portal ou simulador
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('leads')}
                      className="text-xs font-semibold text-[#E30613] hover:underline whitespace-nowrap cursor-pointer"
                    >
                      Ver todas
                    </button>
                  </div>

                  {leads.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#E4E7EC] bg-[#F7F8FA] text-xs font-semibold text-[#4B5563]">
                            <th className="py-2.5 px-5">Comprador</th>
                            <th className="py-2.5 px-4">Veículo de interesse</th>
                            <th className="py-2.5 px-4">Status</th>
                            <th className="py-2.5 px-5 text-right">Recebido</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F2F5] text-sm">
                          {leads.slice(0, 5).map((lead) => (
                            <tr
                              key={lead.id}
                              onClick={() => {
                                setSelectedLeadId(lead.id);
                                setActiveTab('leads');
                              }}
                              className="hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                            >
                              <td className="py-3 px-5">
                                <p className="font-semibold text-[#111827]">{lead.buyerName}</p>
                                <p className="text-xs text-[#6B7280] tabular-nums">
                                  {lead.buyerPhone}
                                </p>
                              </td>
                              <td className="py-3 px-4 max-w-[260px]">
                                <p className="text-xs font-medium text-[#111827] truncate">
                                  {lead.vehicleTitle}
                                </p>
                                <p className="text-xs text-[#6B7280] tabular-nums">
                                  {formatBRL(lead.vehiclePrice)} · {lead.origin}
                                </p>
                              </td>
                              <td className="py-3 px-4 text-xs whitespace-nowrap">
                                {renderLeadStatusText(lead.status)}
                              </td>
                              <td className="py-3 px-5 text-xs text-[#6B7280] text-right tabular-nums whitespace-nowrap">
                                {lead.createdAt}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-sm text-[#6B7280]">
                      Nenhuma proposta registrada ainda.
                    </div>
                  )}
                </div>

                {/* Stock Distribution by Body Type */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-[#E4E7EC] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-base font-bold text-[#111827]">
                      Distribuição do estoque
                    </h2>
                    <BarChart3 className="w-4 h-4 text-[#6B7280]" aria-hidden="true" />
                  </div>

                  <div className="space-y-3.5">
                    {bodyBreakdown.map((item) => (
                      <div key={item.key}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-[#374151]">{item.label}</span>
                          <span className="font-semibold text-[#111827] tabular-nums">
                            {item.count} {item.count === 1 ? 'unidade' : 'unidades'}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                          <div
                            className="h-full bg-[#E30613] rounded-full transition-all duration-300"
                            style={{ width: `${item.count === 0 ? 0 : Math.max(item.percent, 8)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#F0F2F5] flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">Total catalogado</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('inventory')}
                      className="font-semibold text-[#111827] hover:text-[#E30613] cursor-pointer"
                    >
                      Gerenciar estoque →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: MEU ESTOQUE */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-xl border border-[#E4E7EC] overflow-hidden">
              {/* Filter Toolbar */}
              <div className="p-4 sm:p-5 border-b border-[#E4E7EC] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search
                    className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={inventoryQuery}
                    onChange={(e) => setInventoryQuery(e.target.value)}
                    placeholder="Buscar veículo por marca, modelo ou cidade..."
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#D1D5DB] text-sm focus:outline-none focus:border-[#E30613]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 bg-[#F7F8FA] p-1 rounded-lg border border-[#E4E7EC]">
                  {(['Todos', 'Ativo', 'Pausado', 'Vendido'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setInventoryStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        inventoryStatusFilter === status
                          ? 'bg-white text-[#111827] shadow-xs'
                          : 'text-[#6B7280] hover:text-[#111827]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {filteredInventory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E4E7EC] bg-[#F7F8FA] text-xs font-semibold text-[#4B5563]">
                        <th className="py-3 px-5">Veículo</th>
                        <th className="py-3 px-4">Ano / KM</th>
                        <th className="py-3 px-4 text-right">Preço anunciado</th>
                        <th className="py-3 px-4 text-right">Acessos / Leads</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F2F5] text-sm">
                      {filteredInventory.map((vehicle) => {
                        const status = vehicle.status ?? 'Ativo';
                        const isEditingPrice = editingPriceId === vehicle.id;
                        const isConfirmingDelete = confirmDeleteId === vehicle.id;

                        return (
                          <tr
                            key={vehicle.id}
                            className="hover:bg-[#F7F8FA]/80 transition-colors"
                          >
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-3 min-w-[220px]">
                                <img
                                  src={vehicle.imageUrl}
                                  alt={`${vehicle.brand} ${vehicle.model}`}
                                  referrerPolicy="no-referrer"
                                  className="w-14 h-10 rounded-md object-cover bg-[#F3F4F6] border border-[#E4E7EC] shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="font-semibold text-[#111827] truncate">
                                    {vehicle.brand} {vehicle.model}
                                  </p>
                                  <p className="text-xs text-[#6B7280] truncate">
                                    {vehicle.version} · {vehicle.city}-{vehicle.state}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-xs text-[#374151] tabular-nums whitespace-nowrap">
                              <p className="font-semibold">
                                {vehicle.yearFabrication}/{vehicle.yearModel}
                              </p>
                              <p className="text-[#6B7280]">{formatKm(vehicle.mileage)}</p>
                            </td>

                            <td className="py-3 px-4 text-right tabular-nums whitespace-nowrap">
                              {isEditingPrice ? (
                                <div className="inline-flex items-center gap-1 justify-end">
                                  <input
                                    type="number"
                                    value={editingPriceValue}
                                    onChange={(e) => setEditingPriceValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveInlinePrice(vehicle.id);
                                      if (e.key === 'Escape') setEditingPriceId(null);
                                    }}
                                    aria-label="Editar preço"
                                    className="w-28 h-8 px-2 text-xs text-right rounded border border-[#E30613] focus:outline-none"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveInlinePrice(vehicle.id)}
                                    aria-label="Salvar novo preço"
                                    className="p-1.5 rounded bg-[#16A34A] text-white cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPriceId(vehicle.id);
                                    setEditingPriceValue(String(vehicle.price));
                                  }}
                                  title="Clique para ajustar o preço rapidamente"
                                  className="text-right group cursor-pointer"
                                >
                                  <p className="font-bold text-[#111827] group-hover:text-[#E30613] transition-colors">
                                    {formatBRL(vehicle.price)}
                                  </p>
                                  <p className="text-xs text-[#6B7280]">
                                    FIPE {formatBRL(vehicle.fipePrice)}
                                  </p>
                                </button>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right text-xs tabular-nums whitespace-nowrap">
                              <p className="font-semibold text-[#111827]">
                                {(vehicle.views ?? 0).toLocaleString('pt-BR')} views
                              </p>
                              <p className="text-[#6B7280]">{vehicle.leadsCount ?? 0} propostas</p>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <label htmlFor={`status-${vehicle.id}`} className="sr-only">
                                  Status do anúncio
                                </label>
                                <select
                                  id={`status-${vehicle.id}`}
                                  value={status}
                                  onChange={(e) =>
                                    onUpdateVehicleStatus(
                                      vehicle.id,
                                      e.target.value as VehicleStatus
                                    )
                                  }
                                  className="h-8 px-2.5 rounded-md border border-[#E4E7EC] bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#E30613] cursor-pointer"
                                >
                                  <option value="Ativo">Ativo</option>
                                  <option value="Pausado">Pausado</option>
                                  <option value="Vendido">Vendido</option>
                                </select>
                                <span className="hidden xl:inline text-xs">
                                  {renderStatusText(status)}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-5 text-right whitespace-nowrap">
                              {isConfirmingDelete ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDeleteVehicle(vehicle.id);
                                      setConfirmDeleteId(null);
                                    }}
                                    className="px-2.5 py-1 rounded bg-[#DC2626] text-white text-xs font-semibold cursor-pointer"
                                  >
                                    Excluir
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-1 rounded border border-[#E4E7EC] text-xs font-medium text-[#4B5563] cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => onPreviewVehicle(vehicle)}
                                    title="Visualizar ficha pública"
                                    aria-label={`Visualizar ${vehicle.brand} ${vehicle.model}`}
                                    className="p-2 rounded-lg text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] cursor-pointer"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onEditVehicle(vehicle)}
                                    title="Editar veículo"
                                    aria-label={`Editar ${vehicle.brand} ${vehicle.model}`}
                                    className="p-2 rounded-lg text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] cursor-pointer"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(vehicle.id)}
                                    title="Remover do estoque"
                                    aria-label={`Remover ${vehicle.brand} ${vehicle.model}`}
                                    className="p-2 rounded-lg text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="font-display text-base font-bold text-[#111827]">
                    Nenhum veículo encontrado neste filtro
                  </p>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Ajuste a busca ou cadastre um novo veículo para publicar no portal.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenNewVehicle}
                    className="mt-4 px-4 py-2 rounded-lg bg-[#E30613] text-white text-sm font-semibold hover:bg-[#C20510] cursor-pointer"
                  >
                    Cadastrar novo veículo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROPOSTAS E LEADS */}
          {activeTab === 'leads' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Lead Queue */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-[#E4E7EC] overflow-hidden">
                <div className="p-4 border-b border-[#E4E7EC] space-y-3">
                  <div className="relative">
                    <Search
                      className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={leadQuery}
                      onChange={(e) => setLeadQuery(e.target.value)}
                      placeholder="Buscar comprador ou veículo..."
                      className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#E30613]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(['Todos', 'Novo', 'Em atendimento', 'Convertido'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setLeadStatusFilter(status)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                          leadStatusFilter === status
                            ? 'bg-[#111827] text-white'
                            : 'bg-[#F7F8FA] text-[#4B5563] hover:text-[#111827]'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredLeads.length > 0 ? (
                  <div className="divide-y divide-[#F0F2F5] max-h-[560px] overflow-y-auto">
                    {filteredLeads.map((lead) => {
                      const selected = activeLead?.id === lead.id;
                      return (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => setSelectedLeadId(lead.id)}
                          className={`w-full text-left p-4 transition-colors cursor-pointer ${
                            selected ? 'bg-[#F7F8FA]' : 'hover:bg-[#F7F8FA]/60'
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="font-semibold text-sm text-[#111827] truncate">
                              {lead.buyerName}
                            </p>
                            <span className="text-xs text-[#6B7280] tabular-nums shrink-0">
                              {lead.createdAt}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-[#374151] truncate mt-0.5">
                            {lead.vehicleTitle}
                          </p>
                          <p className="text-xs text-[#6B7280] line-clamp-1 mt-1">
                            {lead.message}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            {renderLeadStatusText(lead.status)}
                            <span className="text-[#6B7280]">{lead.origin}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-[#6B7280]">
                    Nenhuma proposta encontrada para este filtro.
                  </div>
                )}
              </div>

              {/* Right Lead Detail Panel */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-[#E4E7EC] p-5 sm:p-6">
                {activeLead ? (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#E4E7EC]">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                          <span>{activeLead.origin}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{activeLead.createdAt}</span>
                        </div>
                        <h2 className="font-display text-xl font-bold text-[#111827] mt-1">
                          {activeLead.buyerName}
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-[#374151] mt-1 tabular-nums">
                          <Phone className="w-3.5 h-3.5 text-[#6B7280]" aria-hidden="true" />
                          <span>{activeLead.buyerPhone}</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <label
                          htmlFor="lead-status-select"
                          className="block text-xs font-medium text-[#6B7280] mb-1"
                        >
                          Etapa do atendimento
                        </label>
                        <select
                          id="lead-status-select"
                          value={activeLead.status}
                          onChange={(e) =>
                            onUpdateLeadStatus(activeLead.id, e.target.value as LeadStatus)
                          }
                          className="h-9 px-3 rounded-lg border border-[#D1D5DB] bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#E30613] cursor-pointer"
                        >
                          <option value="Novo">Novo</option>
                          <option value="Em atendimento">Em atendimento</option>
                          <option value="Convertido">Convertido</option>
                          <option value="Arquivado">Arquivado</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E7EC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-[#6B7280]">Veículo consultado</p>
                        <p className="text-sm font-bold text-[#111827]">
                          {activeLead.vehicleTitle}
                        </p>
                      </div>
                      <p className="font-display text-lg font-extrabold text-[#111827] tabular-nums">
                        {formatBRL(activeLead.vehiclePrice)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#374151] mb-2">
                        <MessageSquare className="w-3.5 h-3.5 text-[#E30613]" aria-hidden="true" />
                        <span>Mensagem do comprador</span>
                      </div>
                      <p className="text-sm text-[#111827] leading-relaxed p-4 rounded-xl border border-[#E4E7EC] bg-white">
                        {activeLead.message}
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="lead-notes"
                        className="block text-xs font-semibold text-[#374151] mb-1.5"
                      >
                        Anotações internas da equipe
                      </label>
                      <textarea
                        id="lead-notes"
                        rows={3}
                        value={activeLead.notes ?? ''}
                        onChange={(e) => onUpdateLeadNotes(activeLead.id, e.target.value)}
                        placeholder="Registre retornos, avaliação de veículo na troca ou agendamento de visita..."
                        className="w-full p-3 rounded-lg border border-[#D1D5DB] text-sm focus:outline-none focus:border-[#E30613] resize-none"
                      />
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateLeadStatus(activeLead.id, 'Em atendimento')}
                        className="px-4 py-2 rounded-lg bg-[#111827] hover:bg-[#1F2937] text-white text-xs font-semibold cursor-pointer"
                      >
                        Assumir atendimento
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateLeadStatus(activeLead.id, 'Convertido')}
                        className="px-4 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold cursor-pointer"
                      >
                        Marcar venda convertida
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-sm text-[#6B7280]">
                    Selecione uma proposta na lista ao lado para visualizar os detalhes.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CONFIGURAÇÕES DA LOJA */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl border border-[#E4E7EC] max-w-3xl">
              <div className="px-6 py-4 border-b border-[#E4E7EC]">
                <h2 className="font-display text-base font-bold text-[#111827]">
                  Dados cadastrais da concessionária ou loja
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Essas informações aparecem nos seus anúncios e nas propostas recebidas.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
                {profileSaved && (
                  <div className="p-3.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#065F46]">
                    Configurações da loja atualizadas com sucesso.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="store-name"
                      className="block text-xs font-medium text-[#374151] mb-1"
                    >
                      Nome fantasia da loja
                    </label>
                    <input
                      id="store-name"
                      type="text"
                      required
                      value={profileForm.storeName}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, storeName: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-sm focus:outline-none focus:border-[#E30613]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="store-cnpj"
                      className="block text-xs font-medium text-[#374151] mb-1"
                    >
                      CNPJ
                    </label>
                    <input
                      id="store-cnpj"
                      type="text"
                      value={profileForm.cnpj}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, cnpj: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-sm tabular-nums focus:outline-none focus:border-[#E30613]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="store-city"
                      className="block text-xs font-medium text-[#374151] mb-1"
                    >
                      Cidade principal
                    </label>
                    <select
                      id="store-city"
                      value={profileForm.cityUf}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, cityUf: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#E30613]"
                    >
                      {BRAZILIAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="store-whatsapp"
                      className="block text-xs font-medium text-[#374151] mb-1"
                    >
                      WhatsApp comercial
                    </label>
                    <input
                      id="store-whatsapp"
                      type="tel"
                      value={profileForm.whatsapp}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, whatsapp: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-sm tabular-nums focus:outline-none focus:border-[#E30613]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="store-email"
                      className="block text-xs font-medium text-[#374151] mb-1"
                    >
                      E-mail para recebimento de leads
                    </label>
                    <input
                      id="store-email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-sm focus:outline-none focus:border-[#E30613]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="store-hours"
                      className="block text-xs font-medium text-[#374151] mb-1"
                    >
                      Horário de atendimento
                    </label>
                    <input
                      id="store-hours"
                      type="text"
                      value={profileForm.hours}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, hours: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-sm focus:outline-none focus:border-[#E30613]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="store-about"
                      className="block text-xs font-medium text-[#374151] mb-1"
                    >
                      Apresentação da loja
                    </label>
                    <textarea
                      id="store-about"
                      rows={3}
                      value={profileForm.about}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, about: e.target.value }))
                      }
                      className="w-full p-3 rounded-lg border border-[#D1D5DB] text-sm focus:outline-none focus:border-[#E30613] resize-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E4E7EC] flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#E30613] hover:bg-[#C20510] text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Salvar alterações
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
