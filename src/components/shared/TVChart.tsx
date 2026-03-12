import { useEffect, useRef } from 'react';
import {
  createChart, ColorType, CrosshairMode,
  AreaSeries, CandlestickSeries, HistogramSeries,
} from 'lightweight-charts';
import type { IChartApi, Time } from 'lightweight-charts';
import type { ChartDataPoint } from '../../types/market';

interface TVChartProps {
  data: ChartDataPoint[];
  chartType?: 'area' | 'candlestick';
  isPositive?: boolean;
}

export function TVChart({ data, chartType = 'area', isPositive = true }: TVChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#666666',
        fontSize: 10,
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      },
      grid: {
        vertLines: { color: '#1a1a1a' },
        horzLines: { color: '#1a1a1a' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#FF6B00', width: 1, style: 2, labelBackgroundColor: '#FF6B00' },
        horzLine: { color: '#FF6B00', width: 1, style: 2, labelBackgroundColor: '#FF6B00' },
      },
      rightPriceScale: {
        borderColor: '#2A2A2A',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: '#2A2A2A',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    chartRef.current = chart;

    // Volume histogram
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#333333',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    // Main price series
    if (chartType === 'candlestick') {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#00FF41',
        downColor: '#FF3131',
        borderUpColor: '#00FF41',
        borderDownColor: '#FF3131',
        wickUpColor: '#00FF41',
        wickDownColor: '#FF3131',
      });

      if (data?.length) {
        candleSeries.setData(data.map(d => ({
          time: d.date as Time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        })));
      }
    } else {
      const lineColor = isPositive ? '#00FF41' : '#FF3131';
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor,
        topColor: isPositive ? 'rgba(0, 255, 65, 0.3)' : 'rgba(255, 49, 49, 0.3)',
        bottomColor: isPositive ? 'rgba(0, 255, 65, 0.0)' : 'rgba(255, 49, 49, 0.0)',
        lineWidth: 2,
      });

      if (data?.length) {
        areaSeries.setData(data.map(d => ({
          time: d.date as Time,
          value: d.close,
        })));
      }
    }

    // Set volume data
    if (data?.length) {
      volumeSeries.setData(data.map(d => ({
        time: d.date as Time,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(0, 255, 65, 0.3)' : 'rgba(255, 49, 49, 0.3)',
      })));
    }

    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    handleResize();

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [chartType, isPositive, data]);

  return <div ref={containerRef} className="w-full h-full" />;
}
