"use client";

import { useMemo } from "react";
import type { ChartPoint } from "@/lib/marks/results";
import { formatExamDate } from "@/lib/marks/results";

/*
  A clean, dependency-free performance line chart (pure SVG).
  X = exam date (chronological), Y = percentage.

  Responsive: viewBox scales to its container width. Only real
  saved data is plotted — never synthetic points.
*/

const WIDTH = 720;
const HEIGHT = 240;
const PAD_X = 40;
const PAD_TOP = 16;
const PAD_BOTTOM = 36;

export function PerformanceChart({ points }: { points: ChartPoint[] }) {
  const { linePath, areaPath, ticks, plots } = useMemo(() => {
    if (points.length === 0) {
      return { linePath: "", areaPath: "", ticks: [], plots: [] };
    }

    const innerWidth = WIDTH - PAD_X - PAD_X;
    const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
    const n = points.length;

    const xFor = (index: number) =>
      n === 1 ? PAD_X + innerWidth / 2 : PAD_X + (index / (n - 1)) * innerWidth;
    const yFor = (percent: number) =>
      PAD_TOP + innerHeight - (percent / 100) * innerHeight;

    const plots = points.map((point, index) => ({
      x: xFor(index),
      y: yFor(point.percent),
      point,
    }));

    const linePath = plots
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    const baseY = PAD_TOP + innerHeight;
    const areaPath =
      plots.length > 0
        ? `M ${plots[0].x.toFixed(1)} ${baseY} ` +
          plots
            .map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
            .join(" ") +
          ` L ${plots[plots.length - 1].x.toFixed(1)} ${baseY} Z`
        : "";

    const ticks = [0, 25, 50, 75, 100];

    return { linePath, areaPath, ticks, plots };
  }, [points]);

  if (points.length === 0) return null;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Performance over time"
      >
        {/* Y gridlines + labels */}
        {ticks.map((tick) => {
          const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
          const y = PAD_TOP + innerHeight - (tick / 100) * innerHeight;
          return (
            <g key={tick}>
              <line
                x1={PAD_X}
                y1={y}
                x2={WIDTH - PAD_X}
                y2={y}
                stroke="var(--color-line)"
                strokeWidth="1"
                strokeDasharray={tick === 0 ? "0" : "3 4"}
              />
              <text
                x={PAD_X - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--color-ink-muted)"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* area fill */}
        {areaPath && (
          <path d={areaPath} fill="var(--color-pine-600)" opacity="0.08" />
        )}

        {/* line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--color-pine-600)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* points */}
        {plots.map((plot) => (
          <g key={plot.point.result.id}>
            <circle
              cx={plot.x}
              cy={plot.y}
              r="4"
              fill="var(--color-surface)"
              stroke="var(--color-pine-600)"
              strokeWidth="2.5"
            />
            {/* hover/tooltip via <title> */}
            <title>
              {`${formatExamDate(plot.point.result.examDate)} — ${
                plot.point.percent
              }% (${plot.point.result.subject})`}
            </title>
          </g>
        ))}

        {/* first + last x-axis labels (keeps it readable on mobile) */}
        {plots.length > 0 && (
          <>
            <text
              x={plots[0].x}
              y={HEIGHT - 12}
              textAnchor={plots.length === 1 ? "middle" : "start"}
              fontSize="11"
              fill="var(--color-ink-muted)"
            >
              {formatExamDate(plots[0].point.result.examDate)}
            </text>
            {plots.length > 1 && (
              <text
                x={plots[plots.length - 1].x}
                y={HEIGHT - 12}
                textAnchor="end"
                fontSize="11"
                fill="var(--color-ink-muted)"
              >
                {formatExamDate(
                  plots[plots.length - 1].point.result.examDate,
                )}
              </text>
            )}
          </>
        )}
      </svg>
    </div>
  );
}
