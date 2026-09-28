"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Camera, MapPin, Smartphone } from "lucide-react";
import Brand from "./Brand";

export default function Welcome() {
  const router = useRouter();
  useEffect(() => {
    if (window.matchMedia("(max-width: 999px)").matches) router.replace("/report");
  }, [router]);
  return <div className="welcome-page">
    <Brand />
    <main className="welcome-main">
      <div className="welcome-copy">
        <span className="welcome-eyebrow"><Smartphone size={17} /> Made for your mobile browser</span>
        <h1>A little light.<br />A safer way home.</h1>
        <p className="welcome-intro">See a streetlight that needs attention? Start with your phone. Take a photo, find the right light, and prepare your report right where you are.</p>
        <div className="welcome-features">
          <p><Camera /><span><strong>Capture it on your phone</strong>Open this website on your phone to use its camera. No app download needed.</span></p>
          <p><MapPin /><span><strong>Find the right streetlight</strong>Use your location, search an address, or tap a light on the map.</span></p>
        </div>
        <Link className="primary welcome-continue" href="/report">Continue on this computer <ArrowRight size={19} /></Link>
        <p className="welcome-desktop-note">On a laptop? Upload a photo and choose its location on the map. Photos alone don’t establish the location.</p>
        <p className="welcome-phone-link">On your phone, visit <a href="https://houston-streetlight-reporting.vercel.app/report">houston-streetlight-reporting.vercel.app</a></p>
        <p className="welcome-disclaimer">An independent community project. Drafts stay in your browser; sending a report to CenterPoint happens on its official website.</p>
      </div>
      <figure className="welcome-preview">
        <div className="welcome-orbit" />
        <div className="phone-frame"><img src="/images/mobile-report-preview.png" width="390" height="844" alt="The mobile reporting screen with Camera and Gallery options, photo preview, and Map, Report and Saved navigation." /></div>
        <figcaption>The real mobile web experience.<br /><span>Camera, map, and your saved drafts in one place.</span></figcaption>
      </figure>
    </main>
  </div>;
}
