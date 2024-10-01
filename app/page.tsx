import WeatherWidget from "@/components/ui/weather-widget";
import { Colors } from "chart.js";

export default function Home() {
  return (
    <div>
      <WeatherWidget />
      <div className="absolute bottom-4 right-4 text-white"  style={{ fontFamily: 'FancyScript Bold Italic' }}>
        Made with <span className="text-red-950"> ♥</span> by Ayesha Mughal
      </div>
    </div>
  );
}