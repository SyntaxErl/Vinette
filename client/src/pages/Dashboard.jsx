import { useState } from "react";

export default function Hi() {
  const [message, setMessage] = useState("I love you so much 💖");
  const [hearts, setHearts] = useState([]);

  const messages = [
    "I love you so much 💖",
    "You make my world brighter ✨",
    "Mwehehe you're the cutest 😆",
    "Sending you hugs 🤗",
    "Forever my mahal 💕",
  ];

  const handleClick = () => {
    const random = messages[Math.floor(Math.random() * messages.length)];
    setMessage(random);

    const newHeart = {
      id: Date.now(),
      left: Math.random() * 100,
    };

    setHearts((prev) => [...prev, newHeart]);

    setTimeout(() => {
      setHearts((prev) => prev.slice(1));
    }, 2000);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* animation defined locally */}
      <style>
        {`
          @keyframes floatUp {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-200px); opacity: 0; }
          }
        `}
      </style>

      <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-sm z-10">
        <h1 className="text-3xl font-bold text-pink-500 mb-2">
          Hi mahal 💖
        </h1>

        <p className="text-gray-600 mb-5 transition-all duration-300">
          {message}
        </p>

        <button
          onClick={handleClick}
          className="px-5 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 active:scale-95 transition"
        >
          Click me 😚
        </button>
      </div>

      {/* floating hearts */}
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className="absolute bottom-0 text-2xl"
          style={{
            left: `${heart.left}%`,
            animation: "floatUp 2s linear forwards",
          }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}