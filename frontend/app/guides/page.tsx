import Link from "next/link";

const guides = [
  ["Big purchases", "How much car can I afford?", "A practical way to think about the car price, EMI, down payment, and safety buffer that fit your life."],
  ["Everyday money", "How much should I spend on a phone?", "A phone can be useful, joyful, and still not deserve a payment plan that follows you for years."],
  ["Financial foundations", "How much emergency fund do I need?", "Understand runway in months, what counts as essential, and how risk tolerance changes the target."],
  ["Borrowing", "What does an EMI really cost?", "The monthly number is only part of the story. Learn how rate, tenure, and principal interact."],
  ["Planning", "Buy now or wait? A simple framework", "Use cash flow, optionality, and your future self to make timing decisions less emotional."],
  ["Privacy", "Why we do not need your login", "Financial tools can be useful without collecting more data than the job requires."]
];

export const metadata = { title: "Money guides", description: "Plain-language guides for car budgets, emergency funds, EMIs, and more." };

export default function GuidesPage() {
  return <main><div className="page-hero"><p className="eyebrow">Useful, human-sized reading</p><h1>Good money decisions start with <em>better questions.</em></h1><p>Short guides for the moments when a spreadsheet is too much, a rule of thumb is too little, and you want to understand the trade-off.</p></div><div className="guide-grid">{guides.map(([tag, title, description]) => <article className="guide-card" key={title}><span className="guide-tag">{tag}</span><h2>{title}</h2><p>{description}</p><Link href="/#calculator" className="tool-link">Use the calculator →</Link></article>)}</div></main>;
}
