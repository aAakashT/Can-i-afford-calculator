import Link from "next/link";
import { Icon } from "../../components/Icons";

const tools = [
  ["car", "Car affordability calculator", "Work out the true monthly cost of a car, including EMI, fuel, insurance, and a sensible buffer.", "car"],
  ["home", "Home affordability calculator", "Understand a comfortable home price and down payment without stretching your monthly life.", "home"],
  ["phone", "Phone affordability calculator", "Cash or EMI? Check if your next phone belongs in your budget—or if waiting feels better.", "phone"],
  ["laptop", "Laptop affordability calculator", "Find a work or study laptop budget that respects your savings and monthly cash flow.", "laptop"],
  ["plane", "Vacation budget calculator", "Plan travel, hotel, food, activities, and a little emergency room into one honest number.", "vacation"],
  ["graduation", "Student loan calculator", "Explore course costs, repayment timelines, and the monthly commitment behind a loan.", "student-loan"],
  ["spark", "Personal loan calculator", "See the repayment and interest cost before a personal loan becomes part of your plan.", "personal-loan"],
  ["chart", "General purchase check", "For furniture, electronics, weddings, or anything else that needs a second look.", "general"]
];

export const metadata = { title: "Affordability tools", description: "Explore private affordability calculators for cars, homes, phones, laptops, travel, and more." };

export default function ToolsPage() {
  return <main className="tool-page-shell"><div className="page-hero"><p className="eyebrow">Tools for the next step</p><h1>Give a big purchase a <em>reality check.</em></h1><p>Every calculator starts with the same honest question: what does this decision do to your monthly life, your safety net, and your future options?</p></div><div className="tool-grid">{tools.map(([icon, title, description, slug]) => <Link className="tool-card" href={slug === "general" ? "/#calculator" : `/tools/${slug}`} key={slug}><div><span className="category-icon"><Icon name={icon} size={21} /></span><h2>{title}</h2><p>{description}</p></div><span className="tool-link">Open calculator →</span></Link>)}</div></main>;
}
