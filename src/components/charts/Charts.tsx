import React, { useEffect, useRef } from 'react';
import ChartJS from 'chart.js/auto';
import type { ChartData, ChartOptions } from 'chart.js';

interface LineChartProps {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ data, options, height = 260 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS<'line'> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'line',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              usePointStyle: true,
              font: { family: 'system-ui', size: 12 }
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: { font: { size: 11, family: 'system-ui' }, color: '#64748b' }
          },
          y: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: { font: { size: 11, family: 'system-ui' }, color: '#64748b' }
          }
        },
        ...options
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, options]);

  return (
    <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

interface BarChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, options, height = 260 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS<'bar'> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: 'system-ui', size: 12 }
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: '#64748b' }
          },
          y: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: { font: { size: 11 }, color: '#64748b' }
          }
        },
        ...options
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, options]);

  return (
    <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
