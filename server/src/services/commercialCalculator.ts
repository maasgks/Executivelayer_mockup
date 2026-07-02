import { prisma } from '../db';

// Ports aiGenCommercial() from js/pages.js: fixed ratios against the pay amount.
// If a country_rate_rules row exists for the contract's country, that should take
// over in a later pass — kept as fixed ratios for parity with the current mockup.
export async function computeCommercial(payAmount: number | null | undefined, country?: string | null) {
  const p = Number(payAmount) || 50000;
  const scale = (mult: number) => Number(((p * mult) / 1_000_000).toFixed(2));

  const rates = country
    ? await prisma.countryRateRule.findMany({ where: { countryCode: country } })
    : [];

  if (rates.length === 0) {
    return {
      adtFee: 549,
      annualGross: scale(12),
      baseGross: scale(1),
      holidayBonus: scale(0.08),
      month13: scale(1),
      monthlyGrossNet: scale(0.7),
      monthlyInvoice: scale(1.2),
      monthlySalary12: scale(0.9),
      monthlySalary1392: scale(1),
      netPay: scale(1.3),
      socialPremAmt: scale(0.26),
      socialPremPct: 26.02,
      totalMonthlyGross: scale(1),
    };
  }

  const socialPct = rates
    .filter((r) => r.kind === 'social' && r.rate)
    .reduce((sum, r) => sum + Number(r.rate), 0);
  const socialPremAmt = scale(socialPct);

  return {
    adtFee: 549,
    annualGross: scale(12),
    baseGross: scale(1),
    holidayBonus: scale(0.08),
    month13: scale(1),
    monthlyGrossNet: scale(0.7),
    monthlyInvoice: scale(1.2),
    monthlySalary12: scale(0.9),
    monthlySalary1392: scale(1),
    netPay: scale(1.3),
    socialPremAmt,
    socialPremPct: Number((socialPct * 100).toFixed(2)),
    totalMonthlyGross: scale(1),
  };
}
