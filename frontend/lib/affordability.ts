export type Risk = "conservative" | "balanced" | "aggressive";
export type PaymentMethod = "cash" | "emi" | "part";

export type AffordabilityInput = {
  monthlyIncome: number;
  essentialExpenses: number;
  discretionaryExpenses: number;
  existingEmi: number;
  otherDebt: number;
  savings: number;
  emergencyFund: number;
  monthlySavingsTarget: number;
  targetPrice: number;
  downPayment: number;
  interestRate: number;
  tenureMonths: number;
  paymentMethod: PaymentMethod;
  risk: Risk;
};

export type AffordabilityResult = {
  score: number;
  verdict: "comfortable" | "affordable" | "borderline" | "risky" | "not-affordable";
  verdictLabel: string;
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
  monthlyBuffer: number;
  postPurchaseSavings: number;
  emergencyCoverage: number;
  recommendedEmergencyFund: number;
  maxPrice: number;
  maxEmi: number;
  difference: number;
  debtRatio: number;
  savingsRate: number;
  purchaseToIncome: number;
  waitMonths: number;
  reasons: { text: string; positive?: boolean }[];
};

const riskSettings: Record<Risk, { maxDebtRatio: number; emergencyMonths: number; bufferMonths: number }> = {
  conservative: { maxDebtRatio: 0.3, emergencyMonths: 6, bufferMonths: 1.5 },
  balanced: { maxDebtRatio: 0.4, emergencyMonths: 4, bufferMonths: 1 },
  aggressive: { maxDebtRatio: 0.5, emergencyMonths: 3, bufferMonths: 0.6 }
};

export function calculateEmi(principal: number, annualRate: number, tenureMonths: number) {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRate <= 0) return principal / tenureMonths;
  const monthlyRate = annualRate / 100 / 12;
  return principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
}

export function formatInr(value: number, compact = false) {
  const amount = Math.max(0, Math.round(value || 0));
  if (compact && amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (compact && amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${new Intl.NumberFormat("en-IN").format(amount)}`;
}

export function parseInr(value: string) { return Math.max(0, Number(value.replace(/[^0-9.]/g, "")) || 0); }

export function calculateAffordability(raw: AffordabilityInput): AffordabilityResult {
  const input = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, typeof value === "number" ? Math.max(0, value) : value])) as AffordabilityInput;
  const risk = riskSettings[input.risk];
  const loanAmount = input.paymentMethod === "cash" ? 0 : Math.max(0, input.targetPrice - (input.paymentMethod === "part" ? input.downPayment : 0));
  const monthlyEmi = calculateEmi(loanAmount, input.interestRate, input.tenureMonths);
  const totalRepayment = monthlyEmi * (input.paymentMethod === "cash" ? 0 : input.tenureMonths);
  const totalInterest = Math.max(0, totalRepayment - loanAmount);
  const purchaseOutflow = input.paymentMethod === "cash" ? input.targetPrice : input.paymentMethod === "part" ? input.downPayment : 0;
  const monthlyBuffer = input.monthlyIncome - input.essentialExpenses - input.discretionaryExpenses - input.existingEmi - input.otherDebt - monthlyEmi;
  const postPurchaseSavings = Math.max(0, input.savings - purchaseOutflow);
  const recommendedEmergencyFund = input.essentialExpenses * risk.emergencyMonths;
  const emergencyCoverage = input.essentialExpenses > 0 ? postPurchaseSavings / input.essentialExpenses : postPurchaseSavings > 0 ? 99 : 0;
  const totalDebt = input.existingEmi + input.otherDebt + monthlyEmi;
  const debtRatio = input.monthlyIncome > 0 ? totalDebt / input.monthlyIncome : totalDebt > 0 ? 99 : 0;
  const savingsRate = input.monthlyIncome > 0 ? Math.max(0, input.monthlyIncome - input.essentialExpenses - input.discretionaryExpenses - input.existingEmi - input.otherDebt) / input.monthlyIncome : 0;
  const purchaseToIncome = input.monthlyIncome > 0 ? input.targetPrice / (input.monthlyIncome * 12) : 99;
  const bufferNeed = input.essentialExpenses * risk.bufferMonths;
  let score = 100;
  score -= Math.min(35, debtRatio * 100 * 0.75);
  score -= Math.min(22, Math.max(0, -monthlyBuffer) / Math.max(1, input.monthlyIncome) * 100);
  score -= Math.min(22, Math.max(0, recommendedEmergencyFund - postPurchaseSavings) / Math.max(1, recommendedEmergencyFund) * 22);
  score -= Math.min(16, Math.max(0, input.targetPrice - Math.max(input.savings, input.monthlyIncome * 6)) / Math.max(1, input.monthlyIncome * 12) * 16);
  if (monthlyBuffer >= bufferNeed) score += 4;
  if (emergencyCoverage >= risk.emergencyMonths) score += 4;
  score = Math.max(0, Math.min(100, Math.round(score)));
  const verdict = score >= 80 ? "comfortable" : score >= 65 ? "affordable" : score >= 50 ? "borderline" : score >= 30 ? "risky" : "not-affordable";
  const verdictLabel = { comfortable: "Comfortable", affordable: "Affordable", borderline: "Borderline", risky: "Risky", "not-affordable": "Not affordable" }[verdict];
  const maxEmi = Math.max(0, input.monthlyIncome * risk.maxDebtRatio - input.existingEmi - input.otherDebt);
  const maxCashPrice = Math.max(0, input.savings - recommendedEmergencyFund);
  const maxFinancedPrincipal = maxEmi > 0 ? input.tenureMonths > 0 ? maxEmi * (1 - Math.pow(1 + input.interestRate / 100 / 12, -input.tenureMonths)) / Math.max(0.000001, input.interestRate / 100 / 12) : 0 : 0;
  const maxPrice = Math.max(0, Math.min(input.targetPrice || 0, input.paymentMethod === "cash" ? maxCashPrice : maxCashPrice + maxFinancedPrincipal));
  const monthlySavingsCapacity = Math.max(0, input.monthlyIncome - input.essentialExpenses - input.discretionaryExpenses - input.existingEmi - input.otherDebt);
  const savingsGap = Math.max(0, input.targetPrice - input.savings + recommendedEmergencyFund);
  const waitMonths = monthlySavingsCapacity > 0 ? Math.ceil(savingsGap / monthlySavingsCapacity) : 0;
  const reasons: { text: string; positive?: boolean }[] = [];
  if (input.monthlyIncome > 0 && monthlyBuffer >= bufferNeed) reasons.push({ text: "Your monthly cash flow leaves room after this purchase.", positive: true });
  else reasons.push({ text: "The new commitment would leave a thin monthly buffer." });
  if (emergencyCoverage >= risk.emergencyMonths) reasons.push({ text: `${emergencyCoverage.toFixed(1)} months of essential expenses stay covered.`, positive: true });
  else reasons.push({ text: `Your emergency fund would cover ${emergencyCoverage.toFixed(1)} months, below your ${risk.emergencyMonths}-month ${input.risk} target.` });
  if (debtRatio <= risk.maxDebtRatio) reasons.push({ text: `Total debt payments are ${(debtRatio * 100).toFixed(0)}% of monthly income.`, positive: true });
  else reasons.push({ text: `Debt payments reach ${(debtRatio * 100).toFixed(0)}% of monthly income.` });
  if (input.paymentMethod !== "cash" && totalInterest > 0) reasons.push({ text: `Financing adds ${formatInr(totalInterest)} in interest over the term.` });
  return { score, verdict, verdictLabel, monthlyEmi, totalInterest, totalRepayment, monthlyBuffer, postPurchaseSavings, emergencyCoverage, recommendedEmergencyFund, maxPrice, maxEmi, difference: Math.max(0, input.targetPrice - maxPrice), debtRatio, savingsRate, purchaseToIncome, waitMonths, reasons };
}
