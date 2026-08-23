import type { Metadata } from "next";
import { PortfolioView } from "@/components/portfolio/portfolio-view";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Your Class 12 academic journey, organized in one profile.",
};

export default function PortfolioPage() {
  return <PortfolioView />;
}
