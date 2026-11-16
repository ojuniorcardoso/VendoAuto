import { ArrowRight, BookOpenCheck, Megaphone } from 'lucide-react';
import { useState } from 'react';
import { FIPE_DIRECTORY } from '../data/vehicles';
import { formatBRL } from '../utils/format';

interface FipeAndSellSectionProps {
  onFilterByBrand: (brand: string) => void;
  onOpenPublishModal: () => void;
  onOpenDealerPanel: () => void;
}

export function FipeAndSellSection({
  onFilterByBrand,
  onOpenPublishModal,
  onOpenDealerPanel,
}: FipeAndSellSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentEntry = FIPE_DIRECTORY[selectedIndex];

  return (
    <section id="fipe" className="py-12 md:py-16 border-t border-[#E4E7EC] bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Interactive Tabela FIPE Lookup */}
          <div className="lg:col-span-7 bg-[#F7F8FA] rounded-2xl border border-[#E4E7EC] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#E30613] mb-2">
                <BookOpenCheck className="w-4 h-4" aria-hidden="true" />
                <span>Tabela FIPE atualizada</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[#111827] tracking-tight">
                Consulte o valor de referência antes de negociar
              </h2>
              <p className="text-sm text-[#4B5563] mt-1.5">
                Compare preços médios nacionais para comprar ou anunciar seu veículo com segurança.
              </p>

              <div className="mt-6">
                <label
                  htmlFor="fipe-model-select"
                  className="block text-xs font-medium text-[#4B5563] mb-1.5"
                >
                  Selecione o modelo para consultar
                </label>
                <select
                  id="fipe-model-select"
                  value={selectedIndex}
                  onChange={(e) => setSelectedIndex(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-lg border border-[#D1D5DB] bg-white text-sm font-medium text-[#111827] focus:outline-none focus:border-[#E30613]"
                >
                  {FIPE_DIRECTORY.map((item, idx) => (
                    <option key={item.fipeCode} value={idx}>
                      {item.brand} {item.model} ({item.year})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#E4E7EC] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs text-[#6B7280] tabular-nums">
                  Código FIPE {currentEntry.fipeCode} · Variação mensal:{' '}
                  <span className="font-semibold text-[#111827]">
                    {currentEntry.monthlyVariation}
                  </span>
                </p>
                <p className="font-display text-3xl font-extrabold text-[#111827] tabular-nums mt-1">
                  {formatBRL(currentEntry.value)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onFilterByBrand(currentEntry.brand)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] hover:bg-[#1F2937] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Ver {currentEntry.brand} à venda</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Right: Sell your vehicle CTA */}
          <div className="lg:col-span-5 bg-[#111827] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#FCA5A5] mb-2">
                <Megaphone className="w-4 h-4" aria-hidden="true" />
                <span>Para particulares e lojistas</span>
              </div>
              <h2
                className="font-display text-2xl font-bold tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Venda seu veículo mais rápido no VENDOAUTO.com.br
              </h2>
              <p className="text-sm text-white/75 mt-2.5 leading-relaxed">
                Publique seu anúncio gratuitamente em menos de dois minutos e receba propostas
                diretas de compradores interessados na sua cidade.
              </p>

              <ul className="mt-5 space-y-2 text-sm text-white/90">
                <li className="flex items-center gap-2">
                  <span className="text-[#E30613] font-bold">01.</span>
                  <span>Cadastro simples com comparativo automático da Tabela FIPE</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#E30613] font-bold">02.</span>
                  <span>Negociação direta sem intermediários ou comissão oculta</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={onOpenPublishModal}
                className="flex-1 h-11 px-4 rounded-lg bg-[#E30613] hover:bg-[#C20510] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Anunciar grátis
              </button>
              <button
                type="button"
                onClick={onOpenDealerPanel}
                className="h-11 px-4 rounded-lg border border-white/25 hover:bg-white/10 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Painel do Lojista
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
