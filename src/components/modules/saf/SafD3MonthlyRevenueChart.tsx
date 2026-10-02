import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  Download,
  Info,
  Sparkles,
  Landmark,
  Coins
} from 'lucide-react';
import { TerrainPaymentRecord } from '../../../types';

export interface MonthlyRevenueData {
  monthKey: string; // e.g. "2026-01"
  monthLabel: string; // e.g. "Janvier"
  shortLabel: string; // e.g. "Jan"
  totalAmount: number;
  shareTresor: number; // 70%
  shareRegie: number; // 30%
  count: number;
}

interface SafD3MonthlyRevenueChartProps {
  payments: TerrainPaymentRecord[];
}

export const SafD3MonthlyRevenueChart: React.FC<SafD3MonthlyRevenueChartProps> = ({ payments }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [viewMode, setViewMode] = useState<'STACKED' | 'GROUPED' | 'AREA'>('STACKED');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [hoveredData, setHoveredData] = useState<MonthlyRevenueData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Month names in French
  const MONTH_NAMES = [
    { key: '01', full: 'Janvier', short: 'Jan' },
    { key: '02', full: 'Février', short: 'Fév' },
    { key: '03', full: 'Mars', short: 'Mar' },
    { key: '04', full: 'Avril', short: 'Avr' },
    { key: '05', full: 'Mai', short: 'Mai' },
    { key: '06', full: 'Juin', short: 'Juin' },
    { key: '07', full: 'Juillet', short: 'Juil' },
    { key: '08', full: 'Août', short: 'Aoû' },
    { key: '09', full: 'Septembre', short: 'Sep' },
    { key: '10', full: 'Octobre', short: 'Oct' },
    { key: '11', full: 'Novembre', short: 'Nov' },
    { key: '12', full: 'Décembre', short: 'Déc' },
  ];

  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Aggregate monthly data
  const monthlyData: MonthlyRevenueData[] = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();

    // Initialize all 12 months for the selected year
    MONTH_NAMES.forEach(m => {
      map.set(`${selectedYear}-${m.key}`, { total: 0, count: 0 });
    });

    // Populate from actual payments
    payments.forEach(p => {
      const pDate = p.record_date || '2026-09-01';
      const [year, month] = pDate.split('-');
      if (year === selectedYear && month) {
        const key = `${year}-${month}`;
        const current = map.get(key) || { total: 0, count: 0 };
        current.total += p.amount_paid;
        current.count += 1;
        map.set(key, current);
      }
    });

    // If certain months have 0 but we want realistic administrative continuity demonstration for PTA 2026,
    // let's ensure the graph has real records and baseline projection
    return MONTH_NAMES.map(m => {
      const key = `${selectedYear}-${m.key}`;
      const item = map.get(key) || { total: 0, count: 0 };
      const total = item.total;
      const shareTresor = Math.round(total * 0.7);
      const shareRegie = total - shareTresor;

      return {
        monthKey: key,
        monthLabel: m.full,
        shortLabel: m.short,
        totalAmount: total,
        shareTresor,
        shareRegie,
        count: item.count
      };
    });
  }, [payments, selectedYear]);

  // High-level KPIs
  const totalYearPaid = useMemo(() => monthlyData.reduce((acc, m) => acc + m.totalAmount, 0), [monthlyData]);
  const totalYearTresor = useMemo(() => Math.round(totalYearPaid * 0.7), [totalYearPaid]);
  const totalYearRegie = useMemo(() => totalYearPaid - totalYearTresor, [totalYearPaid, totalYearTresor]);
  const bestMonth = useMemo(() => {
    return [...monthlyData].sort((a, b) => b.totalAmount - a.totalAmount)[0];
  }, [monthlyData]);
  const activeMonthsCount = useMemo(() => monthlyData.filter(m => m.totalAmount > 0).length || 1, [monthlyData]);
  const monthlyAverage = useMemo(() => Math.round(totalYearPaid / activeMonthsCount), [totalYearPaid, activeMonthsCount]);

  // Render D3 SVG Chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth || 750;
    const height = 320;
    const margin = { top: 30, right: 30, bottom: 50, left: 65 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Defs for gradients & shadow
    const defs = svg.append('defs');

    // Trésor gradient (Emerald to Green Congo)
    const tresorGrad = defs.append('linearGradient')
      .attr('id', 'd3-grad-tresor')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    tresorGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981');
    tresorGrad.append('stop').attr('offset', '100%').attr('stop-color', '#006d2f');

    // Régie gradient (Blue to Navy)
    const regieGrad = defs.append('linearGradient')
      .attr('id', 'd3-grad-regie')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    regieGrad.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8');
    regieGrad.append('stop').attr('offset', '100%').attr('stop-color', '#022448');

    // Area curve gradient
    const areaGrad = defs.append('linearGradient')
      .attr('id', 'd3-grad-area')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    areaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#006d2f').attr('stop-opacity', 0.45);
    areaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#006d2f').attr('stop-opacity', 0.0);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const x0 = d3.scaleBand()
      .domain(monthlyData.map(d => d.shortLabel))
      .range([0, innerWidth])
      .padding(0.28);

    // Max Y
    const maxVal = d3.max(monthlyData, d => d.totalAmount) || 1000000;
    const yMax = maxVal === 0 ? 1000000 : maxVal * 1.15;

    // Y Scale
    const y = d3.scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([innerHeight, 0]);

    // Horizontal grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-dasharray', '3 3');

    g.select('.grid .domain').remove();

    // Bottom X-Axis
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0).tickSizeOuter(0));

    xAxis.select('.domain').attr('stroke', '#94a3b8');
    xAxis.selectAll('text')
      .attr('fill', '#475569')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('dy', '1em');

    // Left Y-Axis
    const yAxis = g.append('g')
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickFormat(d => {
            const num = Number(d);
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
            return `${num}`;
          })
      );

    yAxis.select('.domain').attr('stroke', '#94a3b8');
    yAxis.selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // Y-Axis Label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text('Recettes Encaissées (FCFA)');

    // ==========================================
    // RENDER BASED ON VIEW MODE
    // ==========================================

    if (viewMode === 'STACKED') {
      // Stacked Bar: Bottom = Trésor (70%), Top = Régie (30%)
      const barGroups = g.selectAll('.month-bar-group')
        .data(monthlyData)
        .enter()
        .append('g')
        .attr('class', 'month-bar-group')
        .attr('transform', d => `translate(${x0(d.shortLabel) || 0}, 0)`)
        .style('cursor', 'pointer')
        .on('mouseenter', (event, d) => {
          setHoveredData(d);
          const [xPos, yPos] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x: xPos, y: yPos });
        })
        .on('mousemove', (event) => {
          const [xPos, yPos] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x: xPos, y: yPos });
        })
        .on('mouseleave', () => {
          setHoveredData(null);
          setTooltipPos(null);
        });

      // Bottom Bar: Part Trésor (70%)
      barGroups.append('rect')
        .attr('x', 0)
        .attr('width', x0.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('fill', 'url(#d3-grad-tresor)')
        .attr('rx', 2)
        .transition()
        .duration(600)
        .attr('y', d => y(d.shareTresor))
        .attr('height', d => Math.max(0, innerHeight - y(d.shareTresor)));

      // Top Bar: Part Régie (30%)
      barGroups.append('rect')
        .attr('x', 0)
        .attr('width', x0.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('fill', 'url(#d3-grad-regie)')
        .attr('rx', 4)
        .transition()
        .duration(600)
        .delay(150)
        .attr('y', d => y(d.totalAmount))
        .attr('height', d => Math.max(0, y(d.shareTresor) - y(d.totalAmount)));

      // Total label on top of bar
      barGroups.filter(d => d.totalAmount > 0)
        .append('text')
        .attr('x', x0.bandwidth() / 2)
        .attr('y', d => y(d.totalAmount) - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#022448')
        .attr('font-size', '9.5px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'monospace')
        .text(d => `${(d.totalAmount / 1000).toFixed(0)}k`);
    } else if (viewMode === 'GROUPED') {
      // Grouped Bars side by side: Trésor (70%) and Régie (30%)
      const xSub = d3.scaleBand()
        .domain(['tresor', 'regie'])
        .range([0, x0.bandwidth()])
        .padding(0.1);

      const barGroups = g.selectAll('.month-bar-group')
        .data(monthlyData)
        .enter()
        .append('g')
        .attr('class', 'month-bar-group')
        .attr('transform', d => `translate(${x0(d.shortLabel) || 0}, 0)`)
        .style('cursor', 'pointer')
        .on('mouseenter', (event, d) => {
          setHoveredData(d);
          const [xPos, yPos] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x: xPos, y: yPos });
        })
        .on('mousemove', (event) => {
          const [xPos, yPos] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x: xPos, y: yPos });
        })
        .on('mouseleave', () => {
          setHoveredData(null);
          setTooltipPos(null);
        });

      // Trésor sub-bar
      barGroups.append('rect')
        .attr('x', xSub('tresor') || 0)
        .attr('width', xSub.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('fill', 'url(#d3-grad-tresor)')
        .attr('rx', 3)
        .transition()
        .duration(600)
        .attr('y', d => y(d.shareTresor))
        .attr('height', d => Math.max(0, innerHeight - y(d.shareTresor)));

      // Régie sub-bar
      barGroups.append('rect')
        .attr('x', xSub('regie') || 0)
        .attr('width', xSub.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('fill', 'url(#d3-grad-regie)')
        .attr('rx', 3)
        .transition()
        .duration(600)
        .delay(100)
        .attr('y', d => y(d.shareRegie))
        .attr('height', d => Math.max(0, innerHeight - y(d.shareRegie)));
    } else {
      // Area & Line Trend Curve
      const lineGen = d3.line<MonthlyRevenueData>()
        .x(d => (x0(d.shortLabel) || 0) + x0.bandwidth() / 2)
        .y(d => y(d.totalAmount))
        .curve(d3.curveMonotoneX);

      const areaGen = d3.area<MonthlyRevenueData>()
        .x(d => (x0(d.shortLabel) || 0) + x0.bandwidth() / 2)
        .y0(innerHeight)
        .y1(d => y(d.totalAmount))
        .curve(d3.curveMonotoneX);

      // Gradient filled area
      g.append('path')
        .datum(monthlyData)
        .attr('fill', 'url(#d3-grad-area)')
        .attr('d', areaGen);

      // Trend Line
      const path = g.append('path')
        .datum(monthlyData)
        .attr('fill', 'none')
        .attr('stroke', '#006d2f')
        .attr('stroke-width', 3)
        .attr('d', lineGen);

      // Animate line stroke
      const totalLength = path.node()?.getTotalLength() || 1000;
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(900)
        .attr('stroke-dashoffset', 0);

      // Dots on points
      g.selectAll('.trend-dot')
        .data(monthlyData)
        .enter()
        .append('circle')
        .attr('class', 'trend-dot')
        .attr('cx', d => (x0(d.shortLabel) || 0) + x0.bandwidth() / 2)
        .attr('cy', d => y(d.totalAmount))
        .attr('r', 5)
        .attr('fill', '#ffd700')
        .attr('stroke', '#022448')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', (event, d) => {
          setHoveredData(d);
          const [xPos, yPos] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x: xPos, y: yPos });
        })
        .on('mousemove', (event) => {
          const [xPos, yPos] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x: xPos, y: yPos });
        })
        .on('mouseleave', () => {
          setHoveredData(null);
          setTooltipPos(null);
        });
    }

  }, [monthlyData, viewMode, windowWidth]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      {/* Header with Title and Mode Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#006d2f] flex items-center justify-center font-bold shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-[#022448] text-sm">
                Visualisation Dynamique des Entrées Mensuelles SAA (D3.js)
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-mono-ref">
                Ventilation 70% / 30%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Évolution chronologique des recouvrements in situ et guichet régie pour l'exercice {selectedYear}
            </p>
          </div>
        </div>

        {/* View mode toggle & year selector */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="text-xs bg-slate-100 border border-slate-300 font-bold text-slate-700 rounded-lg px-2.5 py-1.5 cursor-pointer"
          >
            <option value="2026">Exercice 2026</option>
            <option value="2025">Exercice 2025</option>
          </select>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('STACKED')}
              className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                viewMode === 'STACKED' ? 'bg-[#022448] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Graphique en barres empilées (Trésor 70% + Régie 30%)"
            >
              Empilé
            </button>
            <button
              onClick={() => setViewMode('GROUPED')}
              className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                viewMode === 'GROUPED' ? 'bg-[#022448] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Comparaison côte-à-côte Trésor Public vs Régie DDL"
            >
              Groupé
            </button>
            <button
              onClick={() => setViewMode('AREA')}
              className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                viewMode === 'AREA' ? 'bg-[#022448] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Courbe de tendance mensuelle continue"
            >
              Tendance
            </button>
          </div>
        </div>
      </div>

      {/* KPI Mini-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Annuel {selectedYear}</span>
          <span className="font-mono-ref font-black text-sm text-[#022448] mt-0.5 block">
            {totalYearPaid.toLocaleString('fr-FR')} FCFA
          </span>
          <span className="text-[10px] text-slate-500">100% des flux régie SAA</span>
        </div>

        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Trésor Public (70%)</span>
          <span className="font-mono-ref font-black text-sm text-[#006d2f] mt-0.5 block">
            {totalYearTresor.toLocaleString('fr-FR')} FCFA
          </span>
          <span className="text-[10px] text-emerald-700">Trésorier Payeur Général</span>
        </div>

        <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
          <span className="text-[10px] font-bold text-blue-800 uppercase block">Régie DDL-PN (30%)</span>
          <span className="font-mono-ref font-black text-sm text-[#022448] mt-0.5 block">
            {totalYearRegie.toLocaleString('fr-FR')} FCFA
          </span>
          <span className="text-[10px] text-blue-700">Fonctionnement & Tournées</span>
        </div>

        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
          <span className="text-[10px] font-bold text-amber-900 uppercase block">Pic d'Encaissement</span>
          <span className="font-mono-ref font-black text-sm text-amber-950 mt-0.5 block">
            {bestMonth ? `${bestMonth.monthLabel} (${(bestMonth.totalAmount / 1000).toFixed(0)}k)` : '—'}
          </span>
          <span className="text-[10px] text-amber-800">Moyenne : {monthlyAverage.toLocaleString('fr-FR')} F/m</span>
        </div>
      </div>

      {/* SVG Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden bg-slate-50/60 p-2 rounded-xl border border-slate-200">
        <svg ref={svgRef} className="w-full h-80 block" />

        {/* Floating Tooltip */}
        {hoveredData && tooltipPos && (
          <div
            className="absolute pointer-events-none z-30 bg-slate-950/95 text-white p-3 rounded-xl shadow-2xl border border-slate-700 text-xs transform -translate-x-1/2 -translate-y-full mb-2 animate-in fade-in"
            style={{
              left: `${Math.max(80, Math.min(containerRef.current?.clientWidth || 700 - 80, tooltipPos.x))}px`,
              top: `${Math.max(10, tooltipPos.y - 10)}px`
            }}
          >
            <div className="border-b border-slate-700 pb-1.5 mb-1.5 flex items-center justify-between gap-4">
              <span className="font-extrabold text-amber-300 uppercase tracking-wider text-[11px]">
                {hoveredData.monthLabel} {selectedYear}
              </span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono-ref">
                {hoveredData.count} quittance{hoveredData.count > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-1 font-mono-ref text-[11px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Total Encaissé :</span>
                <span className="font-bold text-white">
                  {hoveredData.totalAmount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-emerald-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  Trésor Public (70%) :
                </span>
                <span className="font-bold">
                  {hoveredData.shareTresor.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sky-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                  Régie DDL-PN (30%) :
                </span>
                <span className="font-bold">
                  {hoveredData.shareRegie.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Caption */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
            <span className="font-semibold text-slate-700">Part Trésor Public (70%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#022448] inline-block" />
            <span className="font-semibold text-slate-700">Part Régie DDL-PN (30%)</span>
          </div>
          {viewMode === 'AREA' && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#006d2f] inline-block" />
              <span className="font-semibold text-slate-700">Courbe de Tendance</span>
            </div>
          )}
        </div>

        <span className="italic text-slate-400">
          Source : Registre centralisé des quittances SAA / SAF DDL-PN
        </span>
      </div>
    </div>
  );
};
