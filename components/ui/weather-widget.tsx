"use client"; 
import { useState, ChangeEvent, FormEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudIcon, MapPinIcon, ThermometerIcon, WindIcon, DropletIcon } from "lucide-react";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Dancing_Script } from 'next/font/google';
import React from "react";

const dancingScript = Dancing_Script({ subsets: ['latin'], weight: ['400', '700'] });
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface WeatherData {
  temperature: number; // Store temperature in Celsius
  description: string;
  location: string;
  unit: string; // Store unit as 'C' or 'F'
  wind: number;
  humidity: number;
}

export default function WeatherWidget() {
  const [location, setLocation] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showChart, setShowChart] = useState<boolean>(false);
  const [isFahrenheit, setIsFahrenheit] = useState<boolean>(false);
  const [isNightMode, setIsNightMode] = useState<boolean>(true);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedLocation = location.trim();
    if (trimmedLocation === "") {
      setError("Please enter a valid location.");
      setWeather(null);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${trimmedLocation}`
      );
      if (!response.ok) {
        throw new Error("City not found");
      }
      const data = await response.json();
      const weatherData: WeatherData = {
        temperature: data.current.temp_c, // Store temperature in Celsius
        description: data.current.condition.text,
        location: data.location.name,
        unit: "C", // Initial unit is Celsius
        wind: data.current.wind_kph,
        humidity: data.current.humidity,
      };
      setWeather(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("City not found. Please try again.");
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUnit = () => {
    if (weather) {
      const newTemp = isFahrenheit 
        ? (weather.temperature - 32) * (5 / 9) // Convert Fahrenheit to Celsius
        : (weather.temperature * 9 / 5) + 32; // Convert Celsius to Fahrenheit
      setWeather({ ...weather, temperature: newTemp, unit: isFahrenheit ? "C" : "F" });
      setIsFahrenheit(!isFahrenheit);
    }
  };

  const toggleDayNightMode = () => {
    setIsNightMode(!isNightMode);
  };

  const toggleChart = () => {
    setShowChart(!showChart);
  };

  const getTemperatureMessage = (temperature: number, unit: string): string => {
    if (unit === "C") {
      if (temperature < 0) return `It's freezing at ${temperature}°C! Bundle up!`;
      if (temperature < 10) return `It's quite cold at ${temperature}°C. Wear warm clothes.`;
      if (temperature < 20) return `The temperature is ${temperature}°C. Comfortable for a light jacket.`;
      if (temperature < 30) return `It's a pleasant ${temperature}°C. Enjoy the nice weather!`;
      return `It's hot at ${temperature}°C. Stay hydrated!`;
    } else {
      if (temperature < 32) return `It's freezing at ${temperature}°F! Bundle up!`;
      if (temperature < 50) return `It's quite cold at ${temperature}°F. Wear warm clothes.`;
      if (temperature < 68) return `The temperature is ${temperature}°F. Comfortable for a light jacket.`;
      if (temperature < 86) return `It's a pleasant ${temperature}°F. Enjoy the nice weather!`;
      return `It's hot at ${temperature}°F. Stay hydrated!`;
    }
  };

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: `Temperature in °${weather?.unit}`,
        data: weather ? [weather.temperature, weather.temperature + 2, weather.temperature - 1, weather.temperature + 3, weather.temperature - 2, weather.temperature + 1, weather.temperature] : [],
        fill: false,
        borderColor: isNightMode ? '#FF6347' : '#4B0082',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className={`flex justify-center items-center h-screen ${isNightMode ? 'bg-black' : 'bg-yellow-200'} transition-all duration-500`}>
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle className={`text-4xl ${dancingScript.className}`}>Weather Widget</CardTitle>
          <CardDescription>
            Search for the current weather conditions in your city.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Enter a city name"
              value={location}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading} className={`${isNightMode ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
              {isLoading ? "Loading..." : "Search"}
            </Button>
          </form>
          {error && <div className="mt-4 text-red-500">{error}</div>}
          {weather && (
            <>
              <div className="mt-4 grid gap-2">
                <div className="flex items-center gap-2">
                  <ThermometerIcon className="w-6 h-6" />
                  {getTemperatureMessage(weather.temperature, weather.unit)}
                </div>
                <div className="flex items-center gap-2">
                  <CloudIcon className="w-6 h-6" />
                  {weather.description}
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-6 h-6" />
                  {weather.location}
                </div>
                <div className="flex items-center gap-2">
                  <WindIcon className="w-6 h-6" />
                  {`Wind: ${weather.wind} kph`}
                </div>
                <div className="flex items-center gap-2">
                  <DropletIcon className="w-6 h-6" />
                  {`Humidity: ${weather.humidity}%`}
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <Button onClick={toggleUnit} className={`${isNightMode ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
                  {isFahrenheit ? "Switch to °C" : "Switch to °F"}
                </Button>
                <Button onClick={toggleChart} className={`${isNightMode ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
                  {showChart ? "Hide Chart" : "Show Chart"}
                </Button>
                <Button onClick={toggleDayNightMode} className={`${isNightMode ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
                  {isNightMode ? "Switch to Day" : "Switch to Night"}
                </Button>
              </div>
              {showChart && (
                <div className="mt-4">
                  <Line data={chartData} />
                </div>
              )}
              
            </>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
}
