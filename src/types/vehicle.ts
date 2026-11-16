export type VehicleCategory = 'todos' | 'carros' | 'motos' | 'eletricos' | 'zero_km';

export type BodyType = 'todos' | 'suv' | 'sedan' | 'hatch' | 'picape' | 'eletrico' | 'moto';

export type SellerType = 'Concessionária' | 'Loja Parceira' | 'Particular';

export type VehicleStatus = 'Ativo' | 'Pausado' | 'Vendido';

export type LeadStatus = 'Novo' | 'Em atendimento' | 'Convertido' | 'Arquivado';

export type SortOption = 'relevancia' | 'menor_preco' | 'maior_preco' | 'menor_km' | 'mais_novos';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string;
  yearFabrication: number;
  yearModel: number;
  mileage: number;
  price: number;
  fipePrice: number;
  transmission: 'Automático' | 'Manual' | 'CVT' | 'Automático 10 marchas';
  fuel: 'Flex' | 'Gasolina' | 'Diesel' | 'Elétrico' | 'Híbrido Plug-in';
  color: string;
  plateEnd: string;
  bodyType: Exclude<BodyType, 'todos'>;
  category: 'carros' | 'motos';
  city: string;
  state: string;
  sellerName: string;
  sellerType: SellerType;
  imageUrl: string;
  features: string[];
  description: string;
  isZeroKm?: boolean;
  isElectric?: boolean;
  status?: VehicleStatus;
  views?: number;
  leadsCount?: number;
}

export interface DealerLead {
  id: string;
  vehicleId: string;
  vehicleTitle: string;
  vehiclePrice: number;
  buyerName: string;
  buyerPhone: string;
  message: string;
  createdAt: string;
  status: LeadStatus;
  origin: 'Portal Web' | 'Simulador de Financiamento' | 'WhatsApp Direto';
  notes?: string;
}

export interface DealerProfile {
  storeName: string;
  cnpj: string;
  cityUf: string;
  whatsapp: string;
  email: string;
  hours: string;
  about: string;
}

export interface SearchFilters {
  category: VehicleCategory;
  bodyType: BodyType;
  query: string;
  city: string;
  priceRange: 'all' | 'up_to_90' | '90_to_180' | 'above_180';
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxKm: string;
  transmission: 'all' | 'automatico' | 'manual';
  fuel: 'all' | Vehicle['fuel'];
  onlyBelowFipe: boolean;
  onlyZeroKm: boolean;
  onlyAutomatic: boolean;
  onlyFavorites: boolean;
  sortBy: SortOption;
}

export interface FipeReference {
  brand: string;
  model: string;
  year: string;
  fipeCode: string;
  value: number;
  monthlyVariation: string;
}
