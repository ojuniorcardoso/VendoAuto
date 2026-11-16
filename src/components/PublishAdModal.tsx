import { X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { BRAZILIAN_CITIES } from '../data/vehicles';
import { BodyType, SellerType, Vehicle } from '../types/vehicle';

interface PublishAdModalProps {
  isOpen: boolean;
  editingVehicle?: Vehicle | null;
  onClose: () => void;
  onPublish: (vehicle: Vehicle) => void;
}

const IMAGE_BY_BODY: Record<Exclude<BodyType, 'todos'>, string> = {
  suv: '/src/assets/images/car_suv_compass_1794852433809.jpg',
  sedan: '/src/assets/images/car_sedan_civic_1794852433643.jpg',
  hatch: '/src/assets/images/car_hatch_polo_1794852434729.jpg',
  picape: '/src/assets/images/car_pickup_hilux_1794852435836.jpg',
  eletrico: '/src/assets/images/car_electric_dolphin_1794852434400.jpg',
  moto: '/src/assets/images/moto_sport_cb500_1794852435941.jpg',
};

export function PublishAdModal({
  isOpen,
  editingVehicle,
  onClose,
  onPublish,
}: PublishAdModalProps) {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [version, setVersion] = useState('');
  const [yearModel, setYearModel] = useState('2024');
  const [mileage, setMileage] = useState('25000');
  const [price, setPrice] = useState('115000');
  const [cityUf, setCityUf] = useState<string>(BRAZILIAN_CITIES[0]);
  const [bodyType, setBodyType] = useState<Exclude<BodyType, 'todos'>>('suv');
  const [transmission, setTransmission] = useState<Vehicle['transmission']>('Automático');
  const [fuel, setFuel] = useState<Vehicle['fuel']>('Flex');
  const [sellerType, setSellerType] = useState<SellerType>('Particular');
  const [sellerName, setSellerName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingVehicle) {
      setBrand(editingVehicle.brand);
      setModel(editingVehicle.model);
      setVersion(editingVehicle.version);
      setYearModel(String(editingVehicle.yearModel));
      setMileage(String(editingVehicle.mileage));
      setPrice(String(editingVehicle.price));
      const matchedCity = `${editingVehicle.city} - ${editingVehicle.state}`;
      setCityUf(
        BRAZILIAN_CITIES.includes(matchedCity as (typeof BRAZILIAN_CITIES)[number])
          ? matchedCity
          : BRAZILIAN_CITIES[0]
      );
      setBodyType(editingVehicle.bodyType);
      setTransmission(editingVehicle.transmission);
      setFuel(editingVehicle.fuel);
      setSellerType(editingVehicle.sellerType);
      setSellerName(editingVehicle.sellerName);
      setDescription(editingVehicle.description);
    } else {
      setBrand('');
      setModel('');
      setVersion('');
      setYearModel('2024');
      setMileage('25000');
      setPrice('115000');
      setCityUf(BRAZILIAN_CITIES[0]);
      setBodyType('suv');
      setTransmission('Automático');
      setFuel('Flex');
      setSellerType('Loja Parceira');
      setSellerName('');
      setDescription('');
    }
  }, [isOpen, editingVehicle]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numericPrice = Math.max(Number(price) || 85000, 10000);
    const numericKm = Math.max(Number(mileage) || 0, 0);
    const numericYear = Math.min(Math.max(Number(yearModel) || 2024, 1990), 2026);
    const [city, state] = cityUf.split(' - ');

    const vehicleData: Vehicle = {
      id: editingVehicle ? editingVehicle.id : `va-${Date.now()}`,
      brand: brand.trim() || 'Toyota',
      model: model.trim() || 'Corolla Cross',
      version: version.trim() || 'XRE 2.0 Flex',
      yearFabrication: editingVehicle ? editingVehicle.yearFabrication : numericYear - 1,
      yearModel: numericYear,
      mileage: numericKm,
      price: numericPrice,
      fipePrice: editingVehicle ? editingVehicle.fipePrice : Math.round(numericPrice * 1.05),
      transmission,
      fuel,
      color: editingVehicle ? editingVehicle.color : 'Prata Metálico',
      plateEnd: editingVehicle ? editingVehicle.plateEnd : '6',
      bodyType,
      category: bodyType === 'moto' ? 'motos' : 'carros',
      city: city || 'Curitiba',
      state: state || 'PR',
      sellerName: sellerName.trim() || 'Anunciante Direto',
      sellerType,
      imageUrl: editingVehicle ? editingVehicle.imageUrl : IMAGE_BY_BODY[bodyType],
      isZeroKm: numericKm === 0,
      isElectric: bodyType === 'eletrico' || fuel === 'Elétrico',
      status: editingVehicle?.status ?? 'Ativo',
      views: editingVehicle?.views ?? 1,
      leadsCount: editingVehicle?.leadsCount ?? 0,
      features: editingVehicle?.features ?? [
        'Documentação em dia sem multas',
        'IPVA 2026 quitado',
        'Aceita proposta e financiamento',
      ],
      description:
        description.trim() ||
        'Anúncio publicado diretamente no VENDOAUTO.com.br. Veículo disponível para visitação e vistoria cautelar.',
    };

    onPublish(vehicleData);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#E4E7EC] shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E4E7EC] flex items-center justify-between gap-4">
          <div>
            <h2 id="publish-modal-title" className="font-display text-lg font-bold text-[#111827]">
              {editingVehicle
                ? `Editar ${editingVehicle.brand} ${editingVehicle.model}`
                : 'Anunciar veículo no VENDOAUTO.com.br'}
            </h2>
            <p className="text-xs text-[#6B7280]">
              {editingVehicle
                ? 'Atualize as informações e salve as alterações no estoque.'
                : 'Preencha os dados principais para publicar imediatamente no catálogo.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
            className="w-10 h-10 rounded-lg border border-[#E4E7EC] flex items-center justify-center text-[#374151] hover:bg-[#F3F4F6] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ad-brand" className="block text-xs font-medium text-[#374151] mb-1">
                Marca *
              </label>
              <input
                id="ad-brand"
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ex: Toyota, Honda, Jeep"
                className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-sm focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div>
              <label htmlFor="ad-model" className="block text-xs font-medium text-[#374151] mb-1">
                Modelo *
              </label>
              <input
                id="ad-model"
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ex: Corolla, HR-V, Compass"
                className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-sm focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="ad-version" className="block text-xs font-medium text-[#374151] mb-1">
                Versão
              </label>
              <input
                id="ad-version"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="Ex: 2.0 Altis Premium Hybrid"
                className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-sm focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div>
              <label htmlFor="ad-body" className="block text-xs font-medium text-[#374151] mb-1">
                Categoria / Carroceria
              </label>
              <select
                id="ad-body"
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value as Exclude<BodyType, 'todos'>)}
                className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#E30613]"
              >
                <option value="suv">SUV</option>
                <option value="sedan">Sedã</option>
                <option value="hatch">Hatchback</option>
                <option value="picape">Picape</option>
                <option value="eletrico">Elétrico</option>
                <option value="moto">Moto</option>
              </select>
            </div>

            <div>
              <label htmlFor="ad-city" className="block text-xs font-medium text-[#374151] mb-1">
                Cidade e UF
              </label>
              <select
                id="ad-city"
                value={cityUf}
                onChange={(e) => setCityUf(e.target.value)}
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
              <label htmlFor="ad-year" className="block text-xs font-medium text-[#374151] mb-1">
                Ano do modelo
              </label>
              <input
                id="ad-year"
                type="number"
                min={1995}
                max={2026}
                value={yearModel}
                onChange={(e) => setYearModel(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-sm tabular-nums focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div>
              <label htmlFor="ad-km" className="block text-xs font-medium text-[#374151] mb-1">
                Quilometragem (km)
              </label>
              <input
                id="ad-km"
                type="number"
                min={0}
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-sm tabular-nums focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div>
              <label htmlFor="ad-price" className="block text-xs font-medium text-[#374151] mb-1">
                Preço pedido (R$)
              </label>
              <input
                id="ad-price"
                type="number"
                min={5000}
                step={500}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-sm tabular-nums focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div>
              <label htmlFor="ad-trans" className="block text-xs font-medium text-[#374151] mb-1">
                Câmbio
              </label>
              <select
                id="ad-trans"
                value={transmission}
                onChange={(e) => setTransmission(e.target.value as Vehicle['transmission'])}
                className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#E30613]"
              >
                <option value="Automático">Automático</option>
                <option value="CVT">CVT</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div>
              <label htmlFor="ad-fuel" className="block text-xs font-medium text-[#374151] mb-1">
                Combustível
              </label>
              <select
                id="ad-fuel"
                value={fuel}
                onChange={(e) => setFuel(e.target.value as Vehicle['fuel'])}
                className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#E30613]"
              >
                <option value="Flex">Flex</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Diesel">Diesel</option>
                <option value="Elétrico">Elétrico</option>
                <option value="Híbrido Plug-in">Híbrido Plug-in</option>
              </select>
            </div>

            <div>
              <label htmlFor="ad-seller-type" className="block text-xs font-medium text-[#374151] mb-1">
                Tipo de anunciante
              </label>
              <select
                id="ad-seller-type"
                value={sellerType}
                onChange={(e) => setSellerType(e.target.value as SellerType)}
                className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#E30613]"
              >
                <option value="Particular">Particular</option>
                <option value="Loja Parceira">Loja Parceira</option>
                <option value="Concessionária">Concessionária</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="ad-seller-name" className="block text-xs font-medium text-[#374151] mb-1">
                Seu nome ou nome da loja *
              </label>
              <input
                id="ad-seller-name"
                type="text"
                required
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="Ex: Marcos Oliveira ou Batel Veículos"
                className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-sm focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="ad-desc" className="block text-xs font-medium text-[#374151] mb-1">
                Observações do anúncio
              </label>
              <textarea
                id="ad-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Informe estado de conservação, revisões, único dono ou opcionais..."
                className="w-full p-3 rounded-lg border border-[#D1D5DB] text-sm focus:outline-none focus:border-[#E30613] resize-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E4E7EC] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[#E4E7EC] text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#E30613] hover:bg-[#C20510] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {editingVehicle ? 'Salvar alterações' : 'Publicar anúncio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
