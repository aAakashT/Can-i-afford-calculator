"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "../components/Icons";
import { calculateAffordability, formatInr, parseInr, type PaymentMethod, type Risk } from "../lib/affordability";

type Category = { name: string; slug: string; icon: string; note: string };

const categories: Category[] = [
  { name: "Car", slug: "car", icon: "car", note: "On-road budget" },
  { name: "Home", slug: "home", icon: "home", note: "Down payment" },
  { name: "Phone", slug: "phone", icon: "phone", note: "Cash or EMI" },
  { name: "Laptop", slug: "laptop", icon: "laptop", note: "Work & study" },
  { name: "Vacation", slug: "vacation", icon: "plane", note: "Plan the escape" },
  { name: "Education", slug: "student-loan", icon: "graduation", note: "Invest in you" }
];

const initialInput = {
  monthlyIncome: 100000,
  essentialExpenses: 35000,
  discretionaryExpenses: 10000,
  existingEmi: 10000,
  otherDebt: 0,
  savings: 300000,
  emergencyFund: 300000,
  monthlySavingsTarget: 15000,
  targetPrice: 1000000,
  downPayment: 200000,
  interestRate: 9,
  tenureMonths: 60,
  paymentMethod: "part" as PaymentMethod,
  risk: "balanced" as Risk
};

function CurrencyField({ label, value, onChange, hint }: { label: string; value: number; onChange: (value: number) => void; hint?: string }) {
  return <div className="field">
    <label>{label}</label>
    <div className="input-with-prefix"><span>₹</span><input inputMode="decimal" value={value ? formatInr(value).replace("₹", "") : ""} onChange={(event) => onChange(parseInr(event.target.value))} aria-label={label} /></div>
    {hint && <p className="field-hint">{hint}</p>}
  </div>;
}

function CategoryCards() {
  return <section className="section section-soft" id="tools">
    <div className="section-heading"><div><p className="eyebrow">Start with a category</p><h2>One tool for the<br /><em>big decisions.</em></h2></div><p>From your first phone to your next home, get a clear view of the money around the purchase—not just the price tag.</p></div>
    <div className="category-grid">{categories.map((category) => <Link href={`/#calculator?category=${category.slug}`} className="category-card" key={category.slug}><span className="category-icon"><Icon name={category.icon} size={20} /></span><span><strong>{category.name}</strong><small>{category.note}</small></span></Link>)}</div>
  </section>;
}

function Calculator() {
  const [input, setInput] = useState(initialInput);
  const [shareMessage, setShareMessage] = useState("");
  const result = useMemo(() => calculateAffordability(input), [input]);
  const set = <K extends keyof typeof input>(key: K, value: (typeof input)[K]) => setInput((current) => ({ ...current, [key]: value }));
  const updateCategory = (category: string) => {
    const priceByCategory: Record<string, number> = { car: 1000000, home: 4500000, phone: 65000, laptop: 90000, vacation: 150000, "student-loan": 600000 };
    set("targetPrice", priceByCategory[category] || 1000000);
  };
  const shareResult = async () => {
    const token = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    const url = `${window.location.origin}/result/${token}`;
    try {
      if (navigator.share) await navigator.share({ title: "My affordability result", text: `My affordability score is ${result.score}/100.`, url });
      else await navigator.clipboard.writeText(url);
      setShareMessage("Share link copied");
    } catch { setShareMessage("Ready to share whenever you are"); }
    window.setTimeout(() => setShareMessage(""), 2800);
  };
  const scrollToResult = () => document.getElementById("result-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const verdictClass = `verdict verdict-${result.verdict}`;
  return <section className="calculator-wrap" id="calculator">
    <div className="calculator-head"><div><p className="eyebrow">Your private money check</p><h2>Can you afford it?</h2><p>Answer the essentials. We’ll do the maths and show our working.</p></div><span className="privacy-chip"><Icon name="lock" size={12} /> Runs in your browser</span></div>
    <div className="calculator-layout">
      <div className="calc-panel">
        <div className="panel-title"><div><h3>Tell us about your money</h3><p>Monthly numbers are easiest. Estimates are okay.</p></div><span className="panel-number">01</span></div>
        <div className="field-row"><CurrencyField label="Monthly take-home income" value={input.monthlyIncome} onChange={(value) => set("monthlyIncome", value)} /><CurrencyField label="Current savings" value={input.savings} onChange={(value) => set("savings", value)} hint="Include money you could actually use." /></div>
        <div className="field-row"><CurrencyField label="Essential expenses / month" value={input.essentialExpenses} onChange={(value) => set("essentialExpenses", value)} hint="Rent, food, bills, transport." /><CurrencyField label="Discretionary / month" value={input.discretionaryExpenses} onChange={(value) => set("discretionaryExpenses", value)} hint="Shopping, dining, subscriptions." /></div>
        <div className="field-row"><CurrencyField label="Existing EMIs / month" value={input.existingEmi} onChange={(value) => set("existingEmi", value)} /><CurrencyField label="Other debt payments" value={input.otherDebt} onChange={(value) => set("otherDebt", value)} /></div>
        <div className="section-rule" />
        <div className="panel-title"><div><h3>What are you buying?</h3><p>Pick a starting point—we’ll keep the assumptions visible.</p></div><span className="panel-number">02</span></div>
        <div className="category-picker" aria-label="Purchase category">{categories.map((category) => <button type="button" key={category.slug} className={input.targetPrice === ({ car: 1000000, home: 4500000, phone: 65000, laptop: 90000, vacation: 150000, "student-loan": 600000 } as Record<string, number>)[category.slug] ? "active" : ""} onClick={() => updateCategory(category.slug)}><Icon name={category.icon} size={14} /> {category.name}</button>)}</div>
        <CurrencyField label="Target buying price" value={input.targetPrice} onChange={(value) => set("targetPrice", value)} hint="The full price, before financing." />
        <label>How will you pay?</label>
        <div className="segmented" role="group" aria-label="Payment method"><button type="button" className={input.paymentMethod === "cash" ? "active" : ""} onClick={() => set("paymentMethod", "cash")}>Full cash</button><button type="button" className={input.paymentMethod === "part" ? "active" : ""} onClick={() => set("paymentMethod", "part")}>Part + EMI</button><button type="button" className={input.paymentMethod === "emi" ? "active" : ""} onClick={() => set("paymentMethod", "emi")}>Full EMI</button></div>
        {input.paymentMethod !== "cash" && <div className="field-row" style={{ marginTop: 18 }}><CurrencyField label="Down payment" value={input.paymentMethod === "emi" ? 0 : input.downPayment} onChange={(value) => set("downPayment", value)} /><div className="field"><label>Interest rate / year</label><div className="input-with-prefix"><input inputMode="decimal" value={input.interestRate} onChange={(event) => set("interestRate", Math.max(0, Number(event.target.value) || 0))} /><span style={{ left: "auto", right: 13 }}>%</span></div></div></div>}
        {input.paymentMethod !== "cash" && <div className="field"><label>Loan tenure</label><select value={input.tenureMonths} onChange={(event) => set("tenureMonths", Number(event.target.value))}><option value={12}>12 months</option><option value={24}>24 months</option><option value={36}>36 months</option><option value={48}>48 months</option><option value={60}>60 months</option><option value={84}>84 months</option><option value={120}>120 months</option></select></div>}
        <div className="section-rule" />
        <div className="panel-title"><div><h3>How much wiggle room feels right?</h3><p>These are transparent thresholds, not financial advice.</p></div><span className="panel-number">03</span></div>
        <div className="risk-row" role="radiogroup" aria-label="Risk tolerance"><button type="button" className={`risk-option ${input.risk === "conservative" ? "active" : ""}`} onClick={() => set("risk", "conservative")}><strong>Conservative</strong><small>More buffer, less stress</small></button><button type="button" className={`risk-option ${input.risk === "balanced" ? "active" : ""}`} onClick={() => set("risk", "balanced")}><strong>Balanced</strong><small>Room for real life</small></button><button type="button" className={`risk-option ${input.risk === "aggressive" ? "active" : ""}`} onClick={() => set("risk", "aggressive")}><strong>Aggressive</strong><small>Higher flexibility</small></button></div>
        <button type="button" className="button button-primary calc-submit" onClick={scrollToResult}>See my result <Icon name="arrow" size={16} /></button>
        <p className="assumption">We use your inputs only in this browser. Results are estimates, not professional financial advice.</p>
      </div>
      <div className="result-panel" id="result-summary" aria-live="polite">
        <div className="panel-title"><div><h3>Your first read</h3><p>Updates as you adjust the numbers.</p></div><span className="api-status">Private</span></div>
        <p className="result-label">Affordability score</p><p className="result-score">{result.score}<small> / 100</small></p>
        <div className={verdictClass}><span className="verdict-dot" /> {result.verdictLabel.toUpperCase()}</div>
        <p className="result-copy">{result.verdict === "comfortable" || result.verdict === "affordable" ? "This purchase fits your current numbers with a reasonable buffer. Keep your emergency fund intact as you decide." : "You may be able to make this purchase work, but it would put more pressure on your cash flow or safety buffer than we’d like."}</p>
        <div className="result-highlight"><div><small>Monthly {input.paymentMethod === "cash" ? "outflow" : "EMI"}</small><strong>{formatInr(result.monthlyEmi || (input.paymentMethod === "cash" ? 0 : input.targetPrice / Math.max(1, input.tenureMonths)))}</strong></div><div><small>Recommended max</small><strong>{formatInr(result.maxPrice, true)}</strong></div></div>
        <div className="dark-stats"><div className="dark-stat"><small>Cash buffer after</small><strong>{formatInr(result.monthlyBuffer)}/mo</strong></div><div className="dark-stat"><small>Emergency runway</small><strong>{result.emergencyCoverage.toFixed(1)} months</strong></div><div className="dark-stat"><small>Total interest</small><strong>{formatInr(result.totalInterest)}</strong></div><div className="dark-stat"><small>Debt-to-income</small><strong>{(result.debtRatio * 100).toFixed(0)}%</strong></div></div>
        <button type="button" className="button" style={{ width: "100%", marginTop: 24, background: "var(--lime)", color: "var(--deep)" }} onClick={shareResult}><span>↗</span> Share this result</button>
        {shareMessage && <p style={{ color: "#c8ed66", fontSize: 11, textAlign: "center", margin: "12px 0 0" }}>{shareMessage}</p>}
      </div>
    </div>
    <InsightArea result={result} input={input} />
  </section>;
}

function InsightArea({ result, input }: { result: ReturnType<typeof calculateAffordability>; input: typeof initialInput }) {
  const [savings, setSavings] = useState(input.monthlySavingsTarget);
  const waitMonths = savings > 0 ? Math.ceil(Math.max(0, input.targetPrice - input.savings + result.recommendedEmergencyFund) / savings) : 0;
  const products = input.targetPrice <= 100000 ? [{ name: "Everyday essentials", price: Math.min(input.targetPrice, 65000), icon: "📱" }, { name: "Practical upgrade", price: Math.min(input.targetPrice, 78000), icon: "💻" }, { name: "Comfort pick", price: Math.min(input.targetPrice, 95000), icon: "✨" }] : [{ name: "Safe budget option", price: Math.round(result.maxPrice * .82), icon: "🚗" }, { name: "Balanced pick", price: Math.round(result.maxPrice * .94), icon: "🛵" }, { name: "Stretch option", price: Math.round(Math.min(input.targetPrice, result.maxPrice * 1.08)), icon: "⭐" }];
  return <div className="insights-home">
    <div className="section-rule" />
    <div className="result-layout">
      <div className="insight-card"><h2>Why this result?</h2><div className="reason-list">{result.reasons.map((reason, index) => <div className={`reason ${reason.positive ? "" : "negative"}`} key={index}><span className="reason-mark">{reason.positive ? "✓" : "!"}</span><span>{reason.text}</span></div>)}</div></div>
      <div className="insight-card"><h2>How to make it safer</h2><div className="action-list"><div className="action"><div><span className="action-icon">↓</span><span><strong>Keep more cash upfront</strong><small>Protect {formatInr(result.recommendedEmergencyFund)} as a safety floor</small></span></div><span>{formatInr(result.difference, true)} gap</span></div><div className="action"><div><span className="action-icon">◷</span><span><strong>Give it a little time</strong><small>Build your buffer before buying</small></span></div><span>{result.waitMonths || 1} mo</span></div><div className="action"><div><span className="action-icon">−</span><span><strong>Trim optional spending</strong><small>Small changes can lower the wait</small></span></div><span>Explore</span></div></div></div>
      <div className="insight-card"><div className="card-header-line"><h2>When can I afford it?</h2><span className="demo-label">Adjustable estimate</span></div><p style={{ color: "#7d8a83", fontSize: 12, lineHeight: 1.5, marginTop: 0 }}>If you’re short today, try a monthly saving amount and see the finish line move.</p><div className="field" style={{ marginBottom: 8 }}><label>Save each month: {formatInr(savings)}</label><input type="range" min="1000" max="100000" step="1000" value={savings} onChange={(event) => setSavings(Number(event.target.value))} style={{ accentColor: "var(--purple)" }} /></div><p style={{ fontSize: 23, letterSpacing: "-.05em", fontWeight: 750, margin: "20px 0 4px" }}>{waitMonths ? `${waitMonths} months` : "Not yet"}</p><p style={{ color: "#8a9790", fontSize: 11, margin: 0 }}>to protect your emergency fund and reach this target.</p><div className="projection">{Array.from({ length: 8 }).map((_, index) => <div className={`projection-bar ${index === Math.min(7, Math.max(0, waitMonths - 1)) ? "highlight" : ""}`} key={index} style={{ height: `${30 + Math.min(66, ((index + 1) / Math.max(1, Math.min(waitMonths, 8))) * 66)}%` }}><small>{index + 1}</small></div>)}</div></div>
      <div className="insight-card"><div className="card-header-line"><h2>Fits your safe budget</h2><span className="demo-label">Illustrative catalogue</span></div><p style={{ color: "#7d8a83", fontSize: 12, lineHeight: 1.5, marginTop: 0 }}>A placeholder for curated or affiliate inventory. Verify live prices before buying.</p><div className="product-grid">{products.map((product) => <div className="product-card" key={product.name}><div className="product-visual">{product.icon}</div><h3>{product.name}</h3><p>Example {input.targetPrice > 100000 ? "vehicle" : "upgrade"}</p><strong>{formatInr(Math.max(0, product.price), true)}</strong></div>)}</div></div>
      <div className="insight-card full"><div className="card-header-line"><h2>Compare your next move</h2><span className="demo-label">Side-by-side view</span></div><div style={{ overflowX: "auto" }}><table className="comparison-table"><thead><tr><th>Metric</th><th>Buy now</th><th>Wait {waitMonths || 6} months</th><th>Choose a lower price</th></tr></thead><tbody><tr><td>Purchase price</td><td>{formatInr(input.targetPrice, true)}</td><td>{formatInr(input.targetPrice, true)}</td><td>{formatInr(result.maxPrice, true)}</td></tr><tr><td>Monthly EMI</td><td>{formatInr(result.monthlyEmi)}</td><td>{formatInr(result.monthlyEmi)}</td><td>{formatInr(result.maxEmi)}</td></tr><tr><td>Monthly buffer</td><td>{formatInr(result.monthlyBuffer)}</td><td>{formatInr(result.monthlyBuffer + savings)}</td><td>{formatInr(result.monthlyBuffer + result.monthlyEmi - result.maxEmi)}</td></tr><tr><td>Score / verdict</td><td><strong>{result.score}</strong> · {result.verdictLabel}</td><td><strong>{Math.min(100, result.score + 8)}</strong> · More room</td><td><strong>{Math.min(100, result.score + 13)}</strong> · Safer</td></tr></tbody></table></div></div>
    </div>
  </div>;
}

function HomePage() {
  return <main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "Can I Afford This?", applicationCategory: "FinanceApplication", operatingSystem: "Any", description: "A private affordability calculator for big purchases." }) }} /><section className="hero"><div><p className="eyebrow">A calmer way to spend</p><h1>Know what you can afford <em>before</em> you buy.</h1><p className="hero-subtitle">A clear, private affordability check for the purchases that deserve a little more thought. No accounts. No judgement. Just the useful numbers.</p><div className="hero-actions"><Link className="button button-primary" href="#calculator">Start the calculator <Icon name="arrow" size={16} /></Link><p className="hero-caption">Takes about 2 minutes</p></div></div><div className="hero-art" aria-hidden="true"><div className="hero-orbit" /><div className="money-card"><div className="money-card-head"><span>your money, understood</span><span className="card-dots"><i /><i /><i /></span></div><div className="money-card-amount">₹10,00,000</div><div className="money-card-foot"><span>Comfortable budget</span><strong>₹8.5L – ₹10L</strong></div></div><div className="floating-sticker">+ clarity<small>before you commit</small></div><div className="floating-check">✓</div></div></section><div className="trusted-strip"><span>Made for real-life decisions</span><div className="trust-badges"><span>100% private by default</span><span>India · INR</span><span>Explainable maths</span></div></div><CategoryCards /><section className="section"><div className="how-grid"><div><p className="eyebrow">A better way to decide</p><div className="section-heading" style={{ marginBottom: 27 }}><h2>Less guesswork.<br /><em>More confidence.</em></h2></div><div className="numbered-list"><div className="numbered-item"><span>01</span><div><h3>Tell us about your money</h3><p>Income, essentials, savings, and the commitments already on your plate.</p></div></div><div className="numbered-item"><span>02</span><div><h3>Tell us about the purchase</h3><p>Cash or EMI, price, down payment, and the details that change the real cost.</p></div></div><div className="numbered-item"><span>03</span><div><h3>Get the full picture</h3><p>A verdict you can understand, plus safer alternatives if the timing is off.</p></div></div></div></div><div className="mini-dashboard"><div className="mini-dash-head"><span>Your affordability snapshot</span><span>Balanced · Updated now</span></div><div className="mini-score"><div className="score-ring"><span>72</span></div><div><h4>Affordable, with room to improve</h4><p>Good cash flow and an intact buffer.<br />A larger down payment would help.</p></div></div><div className="mini-metrics"><div className="mini-metric"><small>Monthly buffer</small><strong>₹33,400</strong></div><div className="mini-metric"><small>Emergency runway</small><strong>4.8 mo</strong></div><div className="mini-metric"><small>New EMI</small><strong>₹16,600</strong></div></div></div></div></section><section className="section section-soft"><div className="section-heading"><div><p className="eyebrow">Built for trust</p><h2>Useful answers,<br /><em>no false certainty.</em></h2></div><p>Your inputs stay in your browser by default. We show assumptions, explain trade-offs, and leave the final call with you.</p></div><div className="feature-row"><div className="feature-card"><div className="feature-icon"><Icon name="shield" size={24} /></div><h3>Private by design</h3><p>No login, no mandatory email, and no raw financial data stored for a calculation.</p></div><div className="feature-card"><div className="feature-icon"><Icon name="chart" size={24} /></div><h3>More than a yes or no</h3><p>See your score, emergency runway, cash buffer, financing cost, and the levers you can actually change.</p></div><div className="feature-card"><div className="feature-icon"><Icon name="spark" size={24} /></div><h3>Made for real life</h3><p>Compare buying now, waiting, and choosing a safer budget without needing a spreadsheet.</p></div></div></section><section className="section"><div className="section-heading"><div><p className="eyebrow">Questions, answered</p><h2>A little more<br /><em>peace of mind.</em></h2></div><p>Good decisions start with honest assumptions. Here’s what this tool can—and can’t—tell you.</p></div><div className="faq-grid"><details className="faq-item"><summary>Does this tell me if I should buy something?</summary><p>It gives you a transparent estimate of how the purchase fits your income, expenses, debt, savings, and chosen safety level. It cannot know your full life or make the decision for you.</p></details><details className="faq-item"><summary>Will you save my salary or expenses?</summary><p>No. The calculator is designed to run in your browser. We do not need an account or raw financial inputs to give you a result.</p></details><details className="faq-item"><summary>What does my risk profile change?</summary><p>It changes the buffers used in the estimate: how much debt is considered reasonable and how many months of essential expenses you should keep accessible.</p></details><details className="faq-item"><summary>Are EMI rates and product prices live?</summary><p>Loan terms and product prices change. Always verify the final terms with a lender or merchant before committing.</p></details></div></section><Calculator /></main>;
}

export default HomePage;
