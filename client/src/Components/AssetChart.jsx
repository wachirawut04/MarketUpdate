import React, { useState, useRef, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function AssetChart({ data, interval }) {
  // ✅ Handle empty or invalid data gracefully
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-center text-gray-500 py-10">No data available</div>;
  }

  // ✅ Initial zoom level
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(data.length > 30 ? 30 : data.length - 1);

  const chartRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);

  // ✅ Format X-axis based on interval
  const formatXAxis = (tick) => {
    const d = new Date(tick);
    return (interval === "1d" || interval === "5d")
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
      : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // ✅ Dynamically manage X-axis ticks
  const getXTicks = () => {
    const visibleData = data.slice(startIndex, endIndex + 1);

    // Show all ticks for short datasets
    if (visibleData.length <= 6) {
      return visibleData.map(item => item.date);
    }

    const maxTicks = (interval === "1d" || interval === "5d") ? 4 : 6;
    const step = Math.floor(visibleData.length / maxTicks);

    return visibleData
      .filter((_, idx) => idx % step === 0)
      .map(item => item.date);
  };

  // ✅ Zoom (mouse wheel)
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = Math.sign(e.deltaY) * 2;
    setStartIndex((prev) => Math.max(0, prev + zoomFactor));
    setEndIndex((prev) =>
      Math.min(data.length - 1, prev - zoomFactor)
    );
  };

  // ✅ Drag
  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStartX.current;
    const step = Math.round(deltaX / 10);
    if (step !== 0) {
      setStartIndex((prev) => Math.max(0, Math.min(prev - step, data.length - 1)));
      setEndIndex((prev) =>
        Math.max(0, Math.min(prev - step + (endIndex - startIndex), data.length - 1))
      );
      dragStartX.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // ✅ Add/remove mouse/scroll listeners
  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      chart.addEventListener("wheel", handleWheel, { passive: false });
      chart.addEventListener("mousedown", handleMouseDown);
      chart.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      if (chart) {
        chart.removeEventListener("wheel", handleWheel);
        chart.removeEventListener("mousedown", handleMouseDown);
        chart.removeEventListener("mousemove", handleMouseMove);
      }
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [startIndex, endIndex, data.length]);

  // ✅ Tooltip with OHLC support
  const CustomTooltip = ({ active, payload, label }) => {
    if (
      active &&
      Array.isArray(payload) &&
      payload.length > 0 &&
      payload[0]?.payload
    ) {
      const d = new Date(label);
      const { open, high, low, close } = payload[0].payload;

      return (
        <div style={{
          background: "#ffffff",
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          fontSize: "13px",
          lineHeight: "1.6",
        }}>
          <div>
            <strong>
              {(interval === "1d" || interval === "5d")
                ? d.toLocaleTimeString()
                : d.toLocaleDateString()}
            </strong>
          </div>
          <div>Open: {open.toFixed(2)}</div>
          <div>High: {high.toFixed(2)}</div>
          <div>Low: {low.toFixed(2)}</div>
          <div>Close: {close.toFixed(2)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={chartRef}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data.slice(startIndex, endIndex + 1)}
          margin={{ top: 20, right: 30, bottom: 30, left: 10 }}
        >
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="5 5" />
          <XAxis
            dataKey="date"
            ticks={getXTicks()}
            tickFormatter={formatXAxis}
            height={40}
            tick={{ fontSize: 12, textAnchor: "middle" }}
            interval={0}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 12 }}
            width={50}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
