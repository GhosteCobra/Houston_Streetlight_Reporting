import Link from "next/link";
import { ArrowRight, Map } from "lucide-react";
export default function HomePage() {
  return (
    <main id="main" className="home-hero">
      <div className="hero-copy">
        <h1>
          Help keep
          <br />
          our streets lit
        </h1>
        <p>
          Report streetlights that are out or damaged so our neighborhoods stay
          safe and bright.
        </p>
        <div className="hero-actions">
          <Link href="/report" className="button primary">
            Get started <ArrowRight />
          </Link>
          <Link href="/map" className="button secondary">
            <Map /> Explore the map
          </Link>
        </div>
      </div>
    </main>
  );
}
