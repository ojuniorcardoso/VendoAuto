import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onNavigateSection: (sectionId: string, category?: 'carros' | 'motos' | 'todos') => void;
  onOpenDealerPanel: () => void;
  onOpenPublishModal: () => void;
}

export function Header({
  onNavigateSection,
  onOpenDealerPanel,
  onOpenPublishModal,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string, category?: 'carros' | 'motos' | 'todos') => {
    setMobileMenuOpen(false);
    onNavigateSection(sectionId, category);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E4E7EC]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand logo */}
        <a
          href="#topo"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('topo', 'todos');
          }}
          aria-label="VENDOAUTO.com.br — Início"
          className="shrink-0 flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] rounded-md"
        >
          <img
            src="/assets/aistudio/VendoAuto-logo_a6ab9ab0.png"
            alt="VENDOAUTO.com.br"
            className="h-12 sm:h-13 w-auto object-contain mix-blend-multiply"
          />
        </a>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4B5563]"
        >
          <button
            type="button"
            onClick={() => handleNavClick('catalogo', 'carros')}
            className="hover:text-[#E30613] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] rounded"
          >
            Comprar
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('catalogo', 'motos')}
            className="hover:text-[#E30613] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] rounded"
          >
            Motos
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('fipe')}
            className="hover:text-[#E30613] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] rounded"
          >
            Tabela FIPE
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('cidades')}
            className="hover:text-[#E30613] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] rounded"
          >
            Cidades
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenDealerPanel();
            }}
            className="text-[#111827] font-semibold hover:text-[#E30613] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] rounded"
          >
            Área do Lojista
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenPublishModal}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-[#E30613] hover:bg-[#C20510] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E30613]"
          >
            Anunciar Grátis
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E4E7EC] text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E4E7EC] bg-white px-4 py-3">
          <nav aria-label="Menu móvel" className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => handleNavClick('catalogo', 'carros')}
              className="text-left px-3 py-2.5 text-sm font-medium text-[#111827] hover:bg-[#F7F8FA] rounded-lg"
            >
              Comprar carros
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('catalogo', 'motos')}
              className="text-left px-3 py-2.5 text-sm font-medium text-[#111827] hover:bg-[#F7F8FA] rounded-lg"
            >
              Motos
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('fipe')}
              className="text-left px-3 py-2.5 text-sm font-medium text-[#111827] hover:bg-[#F7F8FA] rounded-lg"
            >
              Tabela FIPE e Financiamento
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('cidades')}
              className="text-left px-3 py-2.5 text-sm font-medium text-[#111827] hover:bg-[#F7F8FA] rounded-lg"
            >
              Buscar por cidade
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDealerPanel();
              }}
              className="text-left px-3 py-2.5 text-sm font-semibold text-[#E30613] hover:bg-[#F7F8FA] rounded-lg"
            >
              Área do Lojista
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
