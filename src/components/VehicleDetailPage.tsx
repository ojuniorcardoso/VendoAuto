import {
  ArrowLeft,
  Calculator,
  Car,
  Check,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { DealerLead, Vehicle } from '../types/vehicle';
import { calculateMonthlyInstallment, formatBRL, formatKm } from '../utils/format';
import { VehicleCard } from './VehicleCard';

interface VehicleDetailPageProps {
  vehicle: Vehicle;
  similarVehicles: Vehicle[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSubmitLead: (lead: DealerLead) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onFilterByBrand: (brand: string) => void;
  onBackToResults: () => void;
  onBackHome: () => void;
}

export function VehicleDetailPage({
  vehicle,
  similarVehicles,
  favorites,
  onToggleFavorite,
  onSubmitLead,
  onSelectVehicle,
  onFilterByBrand,
  onBackToResults,
  onBackHome,
}: VehicleDetailPageProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(30);
  const [months, setMonths] = useState(48);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerMessage, setBuyerMessage] = useState('');
  const [proposalSent, setProposalSent] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isFavorite = favorites.includes(vehicle.id);

  useEffect(() => {
    setProposalSent(false);
    setImgError(false);
    setBuyerMessage(
      `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.yearFabrication}/${vehicle.yearModel} anunciado no VENDOAUTO.com.br.`
    );
  }, [vehicle]);

  const financing = calculateMonthlyInstallment(vehicle.price, downPaymentPercent, months);
  const fipeDiff = vehicle.fipePrice - vehicle.price;
  const fipeDiffPercent = Math.round((Math.abs(fipeDiff) / vehicle.fipePrice) * 100);

  const handleSubmitProposal = (e: FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerPhone.trim()) return;
    onSubmitLead({
      id: `lead-${Date.now()}`,
      vehicleId: vehicle.id,
      vehicleTitle: `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.yearFabrication}/${vehicle.yearModel}`,
      vehiclePrice: vehicle.price,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      message: buyerMessage.trim(),
      createdAt: 'Agora',
      status: 'Novo',
      origin: 'Portal Web',
    });
    setProposalSent(true);
  };

  return (
    <div className="py-6 md:py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Top Breadcrumb + Back button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-[#6B7280]">
            <button
              type="button"
              onClick={onBackHome}
              className="hover:text-[#E30613] transition-colors cursor-pointer"
            >
              Início
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
            <button
              type="button"
              onClick={onBackToResults}
              className="hover:text-[#E30613] transition-colors cursor-pointer"
            >
              {vehicle.category === 'motos' ? 'Motos' : 'Carros'}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
            <button
              type="button"
              onClick={() => onFilterByBrand(vehicle.brand)}
              className="hover:text-[#E30613] transition-colors cursor-pointer"
            >
              {vehicle.brand}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
            <span className="font-semibold text-[#111827]">
              {vehicle.model} {vehicle.yearModel}
            </span>
          </nav>

          <button
            type="button"
            onClick={onBackToResults}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#374151] hover:text-[#E30613] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Voltar para a listagem</span>
          </button>
        </div>

        {/* Contiguous PDP Layout: Left Gallery + Specs, Right Sticky Purchase/Financing Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Hero Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#E4E7EC]">
              {!imgError ? (
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.brand} ${vehicle.model} ${vehicle.version}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#9CA3AF]">
                  <Car className="w-14 h-14 mb-2" />
                  <span className="text-sm font-medium">
                    {vehicle.brand} {vehicle.model}
                  </span>
                </div>
              )}

              {vehicle.isZeroKm ? (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-md bg-[#111827]/85 text-white text-xs font-semibold">
                  0 KM
                </span>
              ) : fipeDiff > 0 ? (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-md bg-[#059669] text-white text-xs font-semibold">
                  Abaixo da FIPE
                </span>
              ) : null}

              <button
                type="button"
                onClick={() => onToggleFavorite(vehicle.id)}
                aria-label={isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                aria-pressed={isFavorite}
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/95 hover:bg-white text-xs font-semibold text-[#111827] shadow-sm transition-colors cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite ? 'fill-[#E30613] text-[#E30613]' : 'text-[#4B5563]'
                  }`}
                />
                <span>{isFavorite ? 'Salvo' : 'Favoritar'}</span>
              </button>
            </div>

            {/* Title & Specs Card */}
            <div className="bg-white rounded-2xl border border-[#E4E7EC] p-5 sm:p-6 space-y-6">
              <div>
                <p className="text-xs font-semibold text-[#E30613]">
                  {vehicle.brand} · {vehicle.sellerType}
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight mt-1">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <p className="text-base text-[#4B5563] mt-0.5">{vehicle.version}</p>
              </div>

              <div>
                <h2 className="font-display text-base font-bold text-[#111827] mb-3">
                  Ficha técnica e detalhes
                </h2>
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3.5 p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E7EC]">
                  <div>
                    <dt className="text-xs text-[#6B7280]">Ano</dt>
                    <dd className="text-sm font-semibold text-[#111827] tabular-nums">
                      {vehicle.yearFabrication}/{vehicle.yearModel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#6B7280]">Quilometragem</dt>
                    <dd className="text-sm font-semibold text-[#111827] tabular-nums">
                      {formatKm(vehicle.mileage)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#6B7280]">Câmbio</dt>
                    <dd className="text-sm font-semibold text-[#111827]">
                      {vehicle.transmission}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#6B7280]">Combustível</dt>
                    <dd className="text-sm font-semibold text-[#111827]">{vehicle.fuel}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#6B7280]">Cor</dt>
                    <dd className="text-sm font-semibold text-[#111827]">{vehicle.color}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#6B7280]">Final da placa</dt>
                    <dd className="text-sm font-semibold text-[#111827] tabular-nums">
                      Final {vehicle.plateEnd}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="pt-4 border-t border-[#F0F2F5]">
                <h2 className="font-display text-base font-bold text-[#111827] mb-2">
                  Sobre este veículo
                </h2>
                <p className="text-sm text-[#4B5563] leading-relaxed">{vehicle.description}</p>
              </div>

              <div className="pt-4 border-t border-[#F0F2F5]">
                <h2 className="font-display text-base font-bold text-[#111827] mb-3">
                  Itens e diferenciais
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {vehicle.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[#374151]">
                      <Check
                        className="w-4 h-4 text-[#059669] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Sticky Purchase, Simulator & Contact Module */}
          <aside className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
            {/* Price & FIPE Comparison */}
            <div className="p-5 sm:p-6 rounded-2xl border border-[#E4E7EC] bg-white">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-3xl font-extrabold text-[#111827] tabular-nums">
                  {formatBRL(vehicle.price)}
                </span>
                <span className="text-xs font-medium text-[#6B7280]">{vehicle.sellerType}</span>
              </div>

              <div className="mt-3 pt-3 border-t border-[#F0F2F5] flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[#4B5563] tabular-nums">
                  Tabela FIPE:{' '}
                  <strong className="text-[#111827]">{formatBRL(vehicle.fipePrice)}</strong>
                </span>
                {fipeDiff > 0 ? (
                  <span className="font-semibold text-[#059669] tabular-nums">
                    {fipeDiffPercent}% abaixo da FIPE ({formatBRL(fipeDiff)} de economia)
                  </span>
                ) : (
                  <span className="font-medium text-[#4B5563]">Na média de mercado</span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-[#6B7280]">
                <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
                <span>
                  {vehicle.city} - {vehicle.state} · {vehicle.sellerName}
                </span>
              </div>
            </div>

            {/* Interactive Financing Simulator */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E4E7EC]">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-[#E30613]" aria-hidden="true" />
                <h2 className="font-display text-sm font-bold text-[#111827]">
                  Simular financiamento
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <label htmlFor="pdp-down-payment" className="text-[#4B5563] font-medium">
                      Entrada ({downPaymentPercent}%)
                    </label>
                    <span className="font-semibold text-[#111827] tabular-nums">
                      {formatBRL(financing.downPayment)}
                    </span>
                  </div>
                  <input
                    id="pdp-down-payment"
                    type="range"
                    min={10}
                    max={70}
                    step={5}
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full accent-[#E30613] cursor-pointer"
                  />
                </div>

                <div>
                  <span className="block text-xs text-[#4B5563] font-medium mb-1.5">
                    Parcelas
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[12, 24, 36, 48, 60].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setMonths(term)}
                        className={`py-2 rounded-lg text-xs font-semibold tabular-nums transition-colors cursor-pointer ${
                          months === term
                            ? 'bg-[#111827] text-white'
                            : 'bg-[#F7F8FA] border border-[#E4E7EC] text-[#374151] hover:border-[#9CA3AF]'
                        }`}
                      >
                        {term}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E4E7EC] flex items-baseline justify-between">
                  <span className="text-xs text-[#4B5563]">Parcela estimada (1,49% a.m.)</span>
                  <span className="font-display text-lg font-extrabold text-[#E30613] tabular-nums">
                    {months}x de {formatBRL(financing.monthlyPayment)}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Contact Form */}
            <div className="p-5 sm:p-6 rounded-2xl border border-[#E4E7EC] bg-white">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-[#E30613]" aria-hidden="true" />
                <h2 className="font-display text-sm font-bold text-[#111827]">
                  Enviar mensagem ao anunciante
                </h2>
              </div>

              {proposalSent ? (
                <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-sm text-[#065F46] space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Proposta enviada com sucesso</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    Recebemos seus dados ({buyerName}) para o{' '}
                    <strong>
                      {vehicle.brand} {vehicle.model}
                    </strong>
                    . O anunciante <strong>{vehicle.sellerName}</strong> responderá pelo WhatsApp{' '}
                    <span className="tabular-nums">{buyerPhone}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setProposalSent(false)}
                    className="text-xs font-semibold underline cursor-pointer pt-1"
                  >
                    Enviar nova mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitProposal} className="space-y-3">
                  <div>
                    <label htmlFor="pdp-buyer-name" className="sr-only">
                      Seu nome completo
                    </label>
                    <input
                      id="pdp-buyer-name"
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E30613]"
                    />
                  </div>
                  <div>
                    <label htmlFor="pdp-buyer-phone" className="sr-only">
                      WhatsApp ou telefone
                    </label>
                    <input
                      id="pdp-buyer-phone"
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="WhatsApp (DDD + número)"
                      className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E30613]"
                    />
                  </div>
                  <div>
                    <label htmlFor="pdp-buyer-msg" className="sr-only">
                      Mensagem
                    </label>
                    <textarea
                      id="pdp-buyer-msg"
                      rows={3}
                      value={buyerMessage}
                      onChange={(e) => setBuyerMessage(e.target.value)}
                      className="w-full p-3 rounded-lg border border-[#D1D5DB] text-sm text-[#111827] focus:outline-none focus:border-[#E30613] resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-11 rounded-lg bg-[#E30613] hover:bg-[#C20510] text-white text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E30613]"
                  >
                    Enviar proposta agora
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>

        {/* Similar Vehicles Section */}
        {similarVehicles.length > 0 && (
          <section className="mt-12 pt-10 border-t border-[#E4E7EC]">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-[#111827]">
                Outros veículos disponíveis que podem interessar
              </h2>
              <button
                type="button"
                onClick={onBackToResults}
                className="text-xs font-semibold text-[#E30613] hover:underline cursor-pointer"
              >
                Ver todo o catálogo
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarVehicles.map((item) => (
                <VehicleCard
                  key={item.id}
                  vehicle={item}
                  isFavorite={favorites.includes(item.id)}
                  onToggleFavorite={onToggleFavorite}
                  onSelectVehicle={onSelectVehicle}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
