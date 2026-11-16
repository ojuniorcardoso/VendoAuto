export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

export function formatKm(km: number): string {
  if (km === 0) {
    return '0 km';
  }
  return `${km.toLocaleString('pt-BR')} km`;
}

export function calculateMonthlyInstallment(
  vehiclePrice: number,
  downPaymentPercent: number,
  months: number,
  monthlyRate = 0.0149
): {
  downPayment: number;
  financedAmount: number;
  monthlyPayment: number;
} {
  const downPayment = Math.round(vehiclePrice * (downPaymentPercent / 100));
  const financedAmount = Math.max(vehiclePrice - downPayment, 0);
  if (financedAmount === 0) {
    return { downPayment, financedAmount: 0, monthlyPayment: 0 };
  }
  const factor = Math.pow(1 + monthlyRate, months);
  const monthlyPayment = Math.round((financedAmount * monthlyRate * factor) / (factor - 1));
  return { downPayment, financedAmount, monthlyPayment };
}
