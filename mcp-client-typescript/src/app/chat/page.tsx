"use client";
import { useEffect, useState } from "react";

import { geocoding, Map, MapStyle } from "@maptiler/sdk";

export default function Chat() {
  useEffect(() => {
    const mapContainer = document.getElementById("my-container-div");

    if (mapContainer == null) {
      return;
    }
    // Instantiate the map
    const map = new Map({
      container: mapContainer,
      apiKey: process.env.NEXT_PUBLIC_MAPTILER_API_KEY ?? "",
      style: MapStyle.BASIC,
    });

    map.on("click", async function (e) {
      const result = await geocoding.reverse([e.lngLat.lng, e.lngLat.lat]);
      console.log(result.features);

      const feature = result.features.find((feature) => {
        const placeType = feature.place_type[0];
        return [
          "country",
          "region",
          "subregion",
          "county",
          "joint_municipality",
        ].includes(placeType);
      });
      const placeName = feature != null ? feature.place_name : undefined;
      if (placeName != null) {
        sendChat(placeName);
      }
    });
  }, []);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ id: string; role: string; content: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  async function sendChat(input: string) {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    console.log("sending ", input);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ content: input }] }),
      });

      const data = await response.json();
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.hello || "No response",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendChat(input);
  };

  return (
    <div className="flex h-screen">
      <div
        id="my-container-div"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <div
        className="flex flex-col w-110 py-4 px-4 bg-opacity-20 backdrop-blur-md"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className="whitespace-pre-wrap mb-4 p-3 rounded-lg bg-gray-100"
          >
            <strong>{m.role === "user" ? "User: " : "AI: "}</strong>
            {m.content}
          </div>
        ))}

        <form onSubmit={handleSubmit} className="mt-auto">
          <input
            className="w-full p-2 border border-gray-300 rounded shadow-xl"
            value={input}
            placeholder="Say something..."
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
        </form>
      </div>
    </div>
  );
}
