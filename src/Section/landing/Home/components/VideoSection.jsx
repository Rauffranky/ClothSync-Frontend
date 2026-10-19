import { Play } from "lucide-react";
import Reveal from "./Reveal";

const embedUrl = "https://drive.google.com/file/d/1NrPNQkXebtGtAD4hkqOn-AacZAhHkrX0/preview";

export default function VideoSection() {
  return (
    <section id="overview" className="home-container home-section" aria-labelledby="video-title">
      <Reveal>
        <div className="home-centered-heading">
          <p className="home-eyebrow"><Play size={14} /> THE BIG PICTURE</p>
          <h2 id="video-title">Discover Trackly.</h2>
          <p>Watch the video and get to know Trackly.</p>
        </div>
        <div className="home-video-shell">
          <iframe src={embedUrl} title="Trackly overview video" className="block aspect-video w-full border-0" loading="lazy" allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        </div>
      </Reveal>
    </section>
  );
}
