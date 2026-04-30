 "use client";

import React, { useEffect, useState } from "react";

export function AnimatedCounter({
  end,
  duration = 2000,
  delay = 500,
  suffix = "",
}: {
  end: number;
  duration?: number;
  delay?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted || end === 0) return;

    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [end, duration, hasStarted]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

