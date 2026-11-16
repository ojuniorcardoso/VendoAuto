import { BRAZILIAN_CITIES } from '../data/vehicles';

interface FooterProps {
  onSelectCity: (city: string) => void;
  onSelectCategory: (category: 'carros' | 'motos' | 'eletricos' | 'zero_km') => void;
  onOpenPublishModal: () => void;
}

export function Footer({ onSelectCity, onSelectCategory, onOpenPublishModal }: FooterProps) {
  return (
    <footer id="cidades" className="bg-[#F7F8FA] border-t border-[#E4E7EC] pt-12 pb-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Chaves na Mão signature city & category directory */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E4E7EC]">
          <div className="md:col-span-1">
            <img
              src="/assets/aistudio/VendoAuto-logo_a6ab9ab0.png"
              alt="VENDOAUTO.com.br"
              className="h-14 w-auto object-contain mix-blend-multiply -ml-1"
            />
            <p className="text-xs text-[#6B7280] leading-relaxed mt-3">
              Portal nacional de classificados automotivos para comprar, comparar na Tabela FIPE e
              anunciar carros, motos e utilitários com transparência.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold text-[#111827] mb-3">
              Carros por cidade
            </h3>
            <ul className="space-y-2">
              {BRAZILIAN_CITIES.slice(0, 4).map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    onClick={() => onSelectCity(city)}
                    className="text-xs text-[#4B5563] hover:text-[#E30613] hover:underline transition-colors cursor-pointer text-left"
                  >
                    Carros em {city}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold text-[#111827] mb-3">
              Mais regiões
            </h3>
            <ul className="space-y-2">
              {BRAZILIAN_CITIES.slice(4).map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    onClick={() => onSelectCity(city)}
                    className="text-xs text-[#4B5563] hover:text-[#E30613] hover:underline transition-colors cursor-pointer text-left"
                  >
                    Veículos em {city}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold text-[#111827] mb-3">
              Atalhos do portal
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('carros')}
                  className="text-xs text-[#4B5563] hover:text-[#E30613] hover:underline transition-colors cursor-pointer"
                >
                  Carros seminovos e usados
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('zero_km')}
                  className="text-xs text-[#4B5563] hover:text-[#E30613] hover:underline transition-colors cursor-pointer"
                >
                  Ofertas 0 KM em estoque
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('eletricos')}
                  className="text-xs text-[#4B5563] hover:text-[#E30613] hover:underline transition-colors cursor-pointer"
                >
                  Carros elétricos e híbridos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('motos')}
                  className="text-xs text-[#4B5563] hover:text-[#E30613] hover:underline transition-colors cursor-pointer"
                >
                  Motos à venda
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenPublishModal}
                  className="text-xs font-semibold text-[#E30613] hover:underline transition-colors cursor-pointer"
                >
                  Anunciar meu veículo
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
          <p>© 2026 VENDOAUTO.com.br — Todos os direitos reservados.</p>
          <p>Preços e disponibilidade sujeitos à confirmação direta com o anunciante.</p>
        </div>
      </div>
    </footer>
  );
}
