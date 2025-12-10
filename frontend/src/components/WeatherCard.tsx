import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cloud, Sun, CloudRain, Wind, Droplets, CloudSun, CloudLightning, Snowflake, Eye, Thermometer } from 'lucide-react';

interface WeatherCardProps {
    percentages: {
        Clear: number;
        Shadow: number;
        "Thin Cloud": number;
        "Thick Cloud": number;
    } | null;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ percentages }) => {
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                },
                () => {
                    setLocation({ lat: 51.5074, lon: -0.1278 }); // Default to London
                }
            );
        } else {
            setLocation({ lat: 51.5074, lon: -0.1278 });
        }
    }, []);

    useEffect(() => {
        if (location) {
            const fetchWeather = async () => {
                try {
                    const response = await axios.get(
                        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation`
                    );
                    setWeather(response.data.current);
                } catch (err) {
                    console.error("Error fetching weather", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchWeather();
        }
    }, [location]);

    // === AI VISUAL NOWCAST LOGIC ===
    const getVisualNowcast = () => {
        if (!percentages) return { condition: "Analyzing...", icon: <Cloud className="h-10 w-10 text-gray-400 animate-pulse" />, precipProb: 0, solarPotential: 0 };

        const thickCloud = percentages["Thick Cloud"];
        const thinCloud = percentages["Thin Cloud"];
        const shadow = percentages.Shadow;
        const clear = percentages.Clear;
        const totalCloud = thickCloud + thinCloud;

        // Precipitation Probability (heuristic based on thick cloud coverage)
        // Thick clouds > 60% = high rain probability
        let precipProb = 0;
        if (thickCloud > 70) precipProb = 85;
        else if (thickCloud > 50) precipProb = 60;
        else if (thickCloud > 30) precipProb = 35;
        else if (totalCloud > 50) precipProb = 20;
        else precipProb = 5;

        // Solar Potential (inverse of cloud coverage)
        const solarPotential = Math.max(0, 100 - totalCloud - (shadow * 0.5));

        // Condition determination
        if (thickCloud > 70) {
            return {
                condition: "Heavy Overcast",
                description: "High probability of precipitation",
                icon: <CloudRain className="h-10 w-10 text-blue-400 animate-bounce" />,
                precipProb,
                solarPotential,
                color: "text-blue-400"
            };
        } else if (thickCloud > 40) {
            return {
                condition: "Overcast",
                description: "Cloudy with possible showers",
                icon: <Cloud className="h-10 w-10 text-gray-300 animate-pulse" />,
                precipProb,
                solarPotential,
                color: "text-gray-300"
            };
        } else if (totalCloud > 50) {
            return {
                condition: "Mostly Cloudy",
                description: "Variable cloud cover",
                icon: <CloudSun className="h-10 w-10 text-gray-400" />,
                precipProb,
                solarPotential,
                color: "text-gray-400"
            };
        } else if (totalCloud > 20) {
            return {
                condition: "Partly Cloudy",
                description: "Good visibility with scattered clouds",
                icon: <CloudSun className="h-10 w-10 text-yellow-300" />,
                precipProb,
                solarPotential,
                color: "text-yellow-300"
            };
        } else {
            return {
                condition: "Clear Sky",
                description: "Excellent visibility and solar potential",
                icon: <Sun className="h-10 w-10 text-yellow-400 animate-spin" style={{ animationDuration: '8s' }} />,
                precipProb,
                solarPotential,
                color: "text-yellow-400"
            };
        }
    };

    // === LIVE WEATHER CODE INTERPRETATION ===
    const getLiveCondition = (code: number) => {
        if (!code) return { text: "Unknown", icon: <Cloud className="h-6 w-6" /> };

        // WMO Weather interpretation codes
        if (code === 0) return { text: "Clear", icon: <Sun className="h-6 w-6 text-yellow-400" /> };
        if (code <= 3) return { text: "Partly Cloudy", icon: <CloudSun className="h-6 w-6 text-yellow-300" /> };
        if (code <= 49) return { text: "Foggy", icon: <Cloud className="h-6 w-6 text-gray-400" /> };
        if (code <= 59) return { text: "Drizzle", icon: <Droplets className="h-6 w-6 text-blue-300" /> };
        if (code <= 69) return { text: "Rain", icon: <CloudRain className="h-6 w-6 text-blue-400" /> };
        if (code <= 79) return { text: "Snow", icon: <Snowflake className="h-6 w-6 text-white" /> };
        if (code <= 99) return { text: "Storm", icon: <CloudLightning className="h-6 w-6 text-purple-400" /> };
        return { text: "Unknown", icon: <Cloud className="h-6 w-6" /> };
    };

    const nowcast = getVisualNowcast();
    const liveCondition = weather ? getLiveCondition(weather.weather_code) : null;

    if (!percentages) {
        return (
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="text-center text-gray-400">
                    <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Upload an image to see weather analysis</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 px-4 py-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs font-mono text-gray-300">DUAL-SOURCE WEATHER SYSTEM</span>
                </div>
            </div>

            {/* AI Visual Nowcast Section */}
            <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-2 mb-3">
                    <div className="px-2 py-0.5 bg-purple-500/20 rounded text-xs font-mono text-purple-300">AI NOWCAST</div>
                    <span className="text-xs text-gray-500">Based on Image Analysis</span>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className={`text-2xl font-bold ${nowcast.color}`}>{nowcast.condition}</h3>
                        <p className="text-xs text-gray-400 mt-1">{nowcast.description}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        {nowcast.icon}
                    </div>
                </div>

                {/* AI Metrics */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                        <div className="flex items-center gap-2 text-blue-300">
                            <Droplets className="h-4 w-4" />
                            <span className="text-xs font-mono">PRECIP PROB</span>
                        </div>
                        <div className="text-xl font-bold text-white mt-1">{nowcast.precipProb}%</div>
                    </div>
                    <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                        <div className="flex items-center gap-2 text-yellow-300">
                            <Sun className="h-4 w-4" />
                            <span className="text-xs font-mono">SOLAR POT</span>
                        </div>
                        <div className="text-xl font-bold text-white mt-1">{nowcast.solarPotential.toFixed(0)}%</div>
                    </div>
                </div>
            </div>

            {/* Live Forecast Section */}
            <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="px-2 py-0.5 bg-cyan-500/20 rounded text-xs font-mono text-cyan-300">LIVE FORECAST</div>
                    <span className="text-xs text-gray-500">Open-Meteo API</span>
                </div>

                {loading ? (
                    <div className="animate-pulse bg-slate-700/30 rounded-lg h-16"></div>
                ) : weather ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Thermometer className="h-5 w-5 text-red-400" />
                                <span className="text-2xl font-bold text-white">{weather.temperature_2m}°C</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-300">
                                {liveCondition?.icon}
                                <span>{liveCondition?.text}</span>
                            </div>
                        </div>
                        <div className="flex gap-3 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                                <Wind className="h-3 w-3" />
                                {weather.wind_speed_10m} km/h
                            </div>
                            <div className="flex items-center gap-1">
                                <Droplets className="h-3 w-3" />
                                {weather.relative_humidity_2m}%
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500 text-sm">Weather data unavailable</div>
                )}
            </div>

            {/* Data Fusion Insight */}
            {weather && percentages && (
                <div className="px-4 pb-4">
                    <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg p-3 border border-white/5">
                        <div className="flex items-center gap-2 text-xs">
                            <Eye className="h-4 w-4 text-purple-400" />
                            <span className="text-gray-300 font-medium">Fusion Insight:</span>
                            <span className="text-gray-400">
                                {nowcast.precipProb > 50 && weather.weather_code > 50
                                    ? "AI and Live data both indicate precipitation likely."
                                    : nowcast.precipProb > 50
                                        ? "AI detects heavy clouds, but live data shows different conditions."
                                        : nowcast.solarPotential > 70
                                            ? "Excellent solar energy harvesting conditions."
                                            : "Moderate conditions for outdoor activities."}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherCard;
