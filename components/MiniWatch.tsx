"use client";

import { useEffect, useState } from "react";

type HandAngles = {
  hour: number;
  minute: number;
  second: number;
};

function getAngles(): HandAngles {
  const now = new Date();
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();

  return {
    hour: (h / 12) * 360 + (m / 60) * 30,
    minute: (m / 60) * 360 + (s / 60) * 6,
    second: (s / 60) * 360
  };
}

export function MiniWatch() {
  const [angles, setAngles] = useState<HandAngles>({
    hour: 305,
    minute: 58,
    second: 180
  });

  useEffect(() => {
    setAngles(getAngles());
    const timer = window.setInterval(() => setAngles(getAngles()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  const handStyle = (angle: number) => ({
    transform: `rotate(${angle}deg)`,
    transformOrigin: "23px 23px"
  });

  return (
    <div className="h-9 w-9 shrink-0 md:h-[46px] md:w-[46px]" aria-hidden="true">
      <svg viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <circle cx="23" cy="23" r="22" fill="#1a0a0f" stroke="#8b2038" strokeWidth="1.5" />
        <circle cx="23" cy="23" r="18" fill="#0d0508" stroke="#3a1020" strokeWidth="0.8" />
        <g stroke="#8b2038" strokeWidth="1.2">
          {Array.from({ length: 12 }).map((_, index) => (
            <line
              key={index}
              x1="23"
              y1="6"
              x2="23"
              y2="9"
              transform={`rotate(${index * 30} 23 23)`}
            />
          ))}
        </g>
        <line
          x1="23"
          y1="23"
          x2="23"
          y2="13"
          stroke="#e8e8e8"
          strokeWidth="2"
          strokeLinecap="round"
          style={handStyle(angles.hour)}
        />
        <line
          x1="23"
          y1="23"
          x2="23"
          y2="9"
          stroke="#cccccc"
          strokeWidth="1.4"
          strokeLinecap="round"
          style={handStyle(angles.minute)}
        />
        <line
          x1="23"
          y1="26"
          x2="23"
          y2="7"
          stroke="#8b2038"
          strokeWidth="0.9"
          strokeLinecap="round"
          style={handStyle(angles.second)}
        />
        <circle cx="23" cy="23" r="1.5" fill="#8b2038" />
        <rect x="43" y="20.5" width="2.5" height="5" rx="1" fill="#3a1020" stroke="#8b2038" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
