'use client'

import React, { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Settings,
  TrendingUp,
  Activity,
  Server,
  Users,
  DollarSign,
  LineChart as LineChartIcon,
  Menu,
  Gauge,
  Zap,
  BarChart2,
  Layers,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ----------------------------------------
// Helpers & Dummy Data
// ----------------------------------------
const fmtCurrency = (n) =>
  n?.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtCompact = (n) =>
  Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);
const fmtPct = (n) => `${(n * 100).toFixed(1)}%`;

// Simple deterministic pseudo-random for repeatability
const prng = (seed) => () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

const monthsBack = (m) => {
  const d = new Date();
  d.setMonth(d.getMonth() - m);
  return d;
};

function genMonthlySeries(label, seed = 1) {
  const rand = prng(seed);
  return Array.from({ length: 12 }).map((_, i) => {
    const d = monthsBack(11 - i);
    const date = d.toISOString().slice(0, 7); // YYYY-MM
    return {
      date,
      roi: 0.05 + rand() * 0.45, // 5% - 50%
      savings: 50000 + rand() * 300000,
      spend: 20000 + rand() * 120000,
      tokens: 2_000_000 + rand() * 6_000_000,
      tokenCost: 4000 + rand() * 16000,
      computeHours: 400 + rand() * 1200,
      activeUsers: 500 + rand() * 5000,
      sessions: 2000 + rand() * 20000,
      containment: 0.40 + rand() * 0.45,
      csat: 3.8 + rand() * 1.2, // out of 5
      winrate: 0.50 + rand() * 0.30,
    };
  });
}

const DATA = {
  projects: [
    {
      id: "chatbot",
      name: "Customer Support Chatbot",
      series: genMonthlySeries("chatbot", 3),
      reliability: { uptime: 0.9992, errorRate: 0.009, p50: 950, p95: 2100, retrievalLatency: 380 },
      throughput: { rps: 13.5, tps: 42000, nodes: 18, gpuUtil: 0.74 },
      deployments: [
        { model: "gpt-4o-mini", version: "2025.08", deployed: "2025-09-21", ttdDays: 6, monitoring: true },
        { model: "reranker-xl", version: "2025.07", deployed: "2025-08-05", ttdDays: 9, monitoring: true },
        { model: "embeddings-2-large", version: "2025.06", deployed: "2025-07-15", ttdDays: 11, monitoring: true },
      ],
      quality: {
        pointwise: { coherence: 4.3, fluency: 4.5, safety: 4.6, groundedness: 4.1, instruction: 4.4, verbosity: 4.2, text: 4.3, summarization: 4.1 },
        pairwise: { winrate: 0.64 },
      },
    },
    {
      id: "docai",
      name: "Intelligent Document Processing",
      series: genMonthlySeries("docai", 7),
      reliability: { uptime: 0.9996, errorRate: 0.006, p50: 720, p95: 1600, retrievalLatency: 290 },
      throughput: { rps: 9.3, tps: 56000, nodes: 12, gpuUtil: 0.68 },
      deployments: [
        { model: "ocr-transformer", version: "2025.08", deployed: "2025-09-09", ttdDays: 7, monitoring: true },
        { model: "extractor-multimodal", version: "2025.07", deployed: "2025-07-29", ttdDays: 10, monitoring: true },
      ],
      quality: {
        pointwise: { coherence: 4.0, fluency: 4.2, safety: 4.7, groundedness: 4.6, instruction: 4.1, verbosity: 4.0, text: 4.3, summarization: 4.5 },
        pairwise: { winrate: 0.58 },
      },
    },
    {
      id: "recs",
      name: "Product Recommendations",
      series: genMonthlySeries("recs", 13),
      reliability: { uptime: 0.9989, errorRate: 0.012, p50: 600, p95: 1400, retrievalLatency: 230 },
      throughput: { rps: 26.8, tps: 82000, nodes: 30, gpuUtil: 0.80 },
      deployments: [
        { model: "recsys-pro", version: "2025.09", deployed: "2025-10-01", ttdDays: 5, monitoring: true },
        { model: "vector-search", version: "2025.07", deployed: "2025-07-18", ttdDays: 8, monitoring: true },
      ],
      quality: {
        pointwise: { coherence: 4.4, fluency: 4.6, safety: 4.5, groundedness: 4.0, instruction: 4.2, verbosity: 4.1, text: 4.3, summarization: 3.9 },
        pairwise: { winrate: 0.69 },
      },
    },
  ],
};

function useProject(projectId) {
  return useMemo(() => DATA.projects.find((p) => p.id === projectId) ?? DATA.projects[0], [projectId]);
}

function calcKPIs(project) {
  const series = project.series;
  const last = series[series.length - 1];
  const spendMTD = last.tokenCost;
  const savingsMTD = last.savings;
  const roiNow = (savingsMTD - spendMTD) / Math.max(spendMTD, 1);
  const adoptionRate = last.activeUsers / Math.max(last.sessions, 1);
  return {
    roiNow,
    savingsMTD,
    spendMTD,
    uptime: project.reliability.uptime,
    errorRate: project.reliability.errorRate,
    latencyP50: project.reliability.p50,
    adoptionRate,
    containment: last.containment,
  };
}

// ----------------------------------------
// Reusable UI bits
// ----------------------------------------
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={'flex items-center gap-3 w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 transition ' + (active ? 'bg-slate-100 font-semibold' : 'text-slate-700')}
  >
    <Icon className="h-4 w-4" /> {label}
  </button>
);

const MetricCard = ({ icon: Icon, label, value, sublabel }) => (
  <Card className="shadow-sm">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm text-slate-500 font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl md:text-3xl font-bold tracking-tight">{value}</div>
      {sublabel && <div className="text-xs text-slate-500 mt-1">{sublabel}</div>}
    </CardContent>
  </Card>
);

const Section = ({ title, icon: Icon, actions, children }) => (
  <section className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-slate-500" />}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
    {children}
  </section>
);

// ----------------------------------------
// Sections
// ----------------------------------------
function Overview({ project }) {
  const kpi = calcKPIs(project);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={TrendingUp} label="Current ROI" value={fmtPct(kpi.roiNow)} sublabel="(Savings – Spend) / Spend" />
        <MetricCard icon={DollarSign} label="Run‑Rate Savings (MTD)" value={fmtCurrency(kpi.savingsMTD)} sublabel="Estimated total value unlocked" />
        <MetricCard icon={Activity} label="Token Spend (MTD)" value={fmtCurrency(kpi.spendMTD)} sublabel="Across model + retrieval calls" />
        <MetricCard icon={Users} label="Adoption Rate" value={fmtPct(kpi.adoptionRate)} sublabel="Active users / sessions" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ROI Over Time */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">ROI Over Time</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={project.series} margin={{ left: 10, right: 10 }}>
                <defs>
                  <linearGradient id="roi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v)=>`${(v*100).toFixed(0)}%`} width={40}/>
                <Tooltip formatter={(v, n)=> n === 'roi' ? fmtPct(v) : v} />
                <Area type="monotone" dataKey="roi" stroke="#8884d8" fill="url(#roi)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spend & Compute */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Token & Compute (Monthly)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={project.series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tickFormatter={(v)=>fmtCompact(v)} width={40} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v)=>fmtCompact(v)} width={40} />
                <Tooltip formatter={(v, n)=> n==='tokens' ? fmtCompact(v) + ' tok' : fmtCurrency(v)} />
                <Legend />
                <Bar yAxisId="left" dataKey="tokens" name="Tokens" />
                <Line yAxisId="right" type="monotone" dataKey="tokenCost" name="Token Cost" stroke="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Adoption */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Adoption & Containment</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={project.series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tickFormatter={(v)=>fmtCompact(v)} width={40}/>
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v)=>`${(v*100).toFixed(0)}%`} width={40}/>
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="activeUsers" name="Active Users" />
                <Line yAxisId="left" type="monotone" dataKey="sessions" name="Sessions" />
                <Line yAxisId="right" type="monotone" dataKey="containment" name="Containment" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quality */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Model Quality (Pairwise Win‑Rate)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={project.series} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v)=>`${(v*100).toFixed(0)}%`} width={40}/>
                <Tooltip formatter={(v)=>fmtPct(v)} />
                <Area type="monotone" dataKey="winrate" name="Win‑Rate" stroke="#82ca9d" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reliability */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Reliability Snapshot</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border p-3"><div className="text-slate-500">Uptime</div><div className="text-xl font-semibold">{fmtPct(project.reliability.uptime)}</div></div>
            <div className="rounded-xl border p-3"><div className="text-slate-500">Error Rate</div><div className="text-xl font-semibold">{fmtPct(project.reliability.errorRate)}</div></div>
            <div className="rounded-xl border p-3"><div className="text-slate-500">Model P50</div><div className="text-xl font-semibold">{project.reliability.p50} ms</div></div>
            <div className="rounded-xl border p-3"><div className="text-slate-500">Retrieval</div><div className="text-xl font-semibold">{project.reliability.retrievalLatency} ms</div></div>
          </CardContent>
        </Card>
      </div>

      <Recommendations project={project} />
    </div>
  );
}

function ModelQuality({ project }) {
  const q = project.quality.pointwise;
  const rows = Object.entries(q).map(([k, v]) => ({ name: k, score: v }));
  return (
    <div className="space-y-6">
      <Section title="Pointwise Metrics (0‑5 rubric)" icon={Gauge}>
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="capitalize">{r.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-40 bg-slate-100 h-2 rounded-full">
                          <div className="h-2 rounded-full bg-slate-400" style={{ width: `${(r.score/5)*100}%` }} />
                        </div>
                        <span className="font-semibold">{r.score.toFixed(1)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Section>

      <Section title="Pairwise Evaluation (A/B vs Baseline)" icon={Layers}>
        <Card className="shadow-sm">
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={project.series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v)=>`${(v*100).toFixed(0)}%`} width={40}/>
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="winrate" name="Win‑Rate vs Baseline" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}

function SystemQuality({ project }) {
  const t = project.throughput;
  return (
    <div className="space-y-6">
      <Section title="Deployments & Governance" icon={Server}>
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Deployed</TableHead>
                  <TableHead>Time‑to‑Deploy</TableHead>
                  <TableHead>Monitoring</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.deployments.map((d) => (
                  <TableRow key={d.model + d.version}>
                    <TableCell className="font-medium">{d.model}</TableCell>
                    <TableCell>{d.version}</TableCell>
                    <TableCell>{d.deployed}</TableCell>
                    <TableCell>{d.ttdDays} days</TableCell>
                    <TableCell>{d.monitoring ? <Badge className="bg-emerald-100 text-emerald-700">On</Badge> : <Badge variant="secondary">Off</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Section>

      <Section title="Reliability & Responsiveness" icon={ShieldCheck}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Latency Distribution</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border p-3"><div className="text-slate-500">P50 Model</div><div className="text-xl font-semibold">{project.reliability.p50} ms</div></div>
              <div className="rounded-xl border p-3"><div className="text-slate-500">P95 Model</div><div className="text-xl font-semibold">{project.reliability.p95} ms</div></div>
              <div className="rounded-xl border p-3"><div className="text-slate-500">Retrieval</div><div className="text-xl font-semibold">{project.reliability.retrievalLatency} ms</div></div>
              <div className="rounded-xl border p-3"><div className="text-slate-500">Error Rate</div><div className="text-xl font-semibold">{fmtPct(project.reliability.errorRate)}</div></div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Throughput & Utilization</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border p-3"><div className="text-slate-500">Request Throughput</div><div className="text-xl font-semibold">{t.rps} rps</div></div>
              <div className="rounded-xl border p-3"><div className="text-slate-500">Token Throughput</div><div className="text-xl font-semibold">{fmtCompact(t.tps)} tok/s</div></div>
              <div className="rounded-xl border p-3"><div className="text-slate-500">Serving Nodes</div><div className="text-xl font-semibold">{t.nodes}</div></div>
              <div className="rounded-xl border p-3"><div className="text-slate-500">GPU/TPU Utilization</div><div className="text-xl font-semibold">{fmtPct(t.gpuUtil)}</div></div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </div>
  );
}

function Adoption({ project }) {
  return (
    <div className="space-y-6">
      <Section title="Usage & Engagement" icon={Users}>
        <Card className="shadow-sm">
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={project.series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v)=>fmtCompact(v)} width={40} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="activeUsers" name="Active Users" />
                <Line type="monotone" dataKey="sessions" name="Sessions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Section>

      <Section title="Feedback & Satisfaction" icon={BarChart2}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">CSAT (out of 5)</CardTitle></CardHeader>
            <CardContent className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={project.series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0,5]} width={40}/>
                  <Tooltip />
                  <Area type="monotone" dataKey="csat" name="CSAT" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Containment</CardTitle></CardHeader>
            <CardContent className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={project.series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v)=>`${(v*100).toFixed(0)}%`} width={40}/>
                  <Tooltip />
                  <Line type="monotone" dataKey="containment" name="Containment" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </Section>
    </div>
  );
}

function BusinessValue({ project }) {
  const last = project.series.at(-1);
  const productivity = last.savings * 0.55;
  const costSavings = last.savings * 0.35;
  const growth = last.savings * 0.10;
  const pieData = [
    { name: "Productivity", value: productivity },
    { name: "Cost Savings", value: costSavings },
    { name: "Innovation/Growth", value: growth },
  ];
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"]; // default palette
  return (
    <div className="space-y-6">
      <Section title="Value Breakdown (Example)" icon={DollarSign}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Savings vs Spend</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={project.series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v)=>fmtCompact(v)} width={40}/>
                  <Tooltip formatter={(v)=>fmtCurrency(v)} />
                  <Legend />
                  <Bar dataKey="savings" name="Savings" />
                  <Bar dataKey="spend" name="Spend" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Business Value Mix</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v)=>fmtCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Recommendations project={project} />
    </div>
  );
}

function Recommendations() {
  return (
    <Section title="AI Recommendations (Sample)" icon={Zap}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          {
            title: "Boost containment by 5‑8%",
            body:
              "Introduce retrieval cache and top‑K reranking for repetitive intents. Expect lower latency and fewer model tokens.",
          },
          {
            title: "Trim token spend ~12%",
            body:
              "Adopt tighter system prompts + dynamic context sizing; truncate long user histories beyond meaningful context.",
          },
          {
            title: "Improve reliability",
            body:
              "Enable canary deploys with automated rollback on error rate >1.5% or P95 latency >2.5s.",
          },
        ].map((rec, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">{rec.title}</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-600">{rec.body}</CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function WhatIfSimulator() {
  const [volume, setVolume] = useState(250000); // monthly interactions
  const [containment, setContainment] = useState(0.55);
  const [avgTokens, setAvgTokens] = useState(900);
  const [pricePer1k, setPricePer1k] = useState(0.6);
  const [agentCost, setAgentCost] = useState(6.5); // blended $ per ticket
  const [minutesSaved, setMinutesSaved] = useState(6); // per contained case
  const [revPerCase, setRevPerCase] = useState(1.2); // uplift proxy
  const [upliftPct, setUpliftPct] = useState(0.02);

  const contained = Math.round(volume * containment);
  const tokenCost = (contained * avgTokens * pricePer1k) / 1000; // $ per month
  const savings = contained * (agentCost + (minutesSaved / 60) * 25); // assume $25/hr labor
  const revenue = contained * revPerCase * upliftPct;
  const spend = tokenCost;
  const benefit = savings + revenue;
  const roi = (benefit - spend) / Math.max(spend, 1);

  return (
    <div className="space-y-6">
      <Section title="What‑If Scenario Builder" icon={LineChartIcon}>
        <div className="grid grid-cols-1 2xl:grid-cols-3 gap-4">
          <Card className="shadow-sm 2xl:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Inputs</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <SliderRow label="Monthly interactions" value={volume} onChange={setVolume} min={10_000} max={1_000_000} step={1000} format={(v)=>fmtCompact(v)} />
              <SliderRow label="Containment" value={containment} onChange={setContainment} min={0.1} max={0.95} step={0.01} format={(v)=>fmtPct(v)} />
              <SliderRow label="Avg tokens per interaction" value={avgTokens} onChange={setAvgTokens} min={200} max={4000} step={10} />
              <SliderRow label="Price per 1K tokens ($)" value={pricePer1k} onChange={setPricePer1k} min={0.05} max={3} step={0.05} />
              <SliderRow label="Human agent cost ($/case)" value={agentCost} onChange={setAgentCost} min={2} max={25} step={0.5} />
              <SliderRow label="Minutes saved per contained case" value={minutesSaved} onChange={setMinutesSaved} min={1} max={30} step={1} />
              <SliderRow label="Revenue / case ($)" value={revPerCase} onChange={setRevPerCase} min={0} max={10} step={0.1} />
              <SliderRow label="Uplift %" value={upliftPct} onChange={setUpliftPct} min={0} max={0.2} step={0.005} format={(v)=>fmtPct(v)} />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Results</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <KV label="Contained cases" value={fmtCompact(contained)} />
              <KV label="Token spend / mo" value={fmtCurrency(spend)} />
              <KV label="Cost savings / mo" value={fmtCurrency(savings)} />
              <KV label="Revenue uplift / mo" value={fmtCurrency(revenue)} />
              <Separator />
              <div className="flex items-center justify-between">
                <div className="text-slate-600 font-medium">ROI</div>
                <div className="text-2xl font-bold">{fmtPct(roi)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </div>
  );
}

const KV = ({ label, value }) => (
  <div className="flex items-center justify-between"><div className="text-slate-600">{label}</div><div className="font-semibold">{value}</div></div>
);

const SliderRow = ({ label, value, onChange, min, max, step, format }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <Label className="text-slate-600">{label}</Label>
      <span className="font-medium">{format ? format(value) : value}</span>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onChange(v[0])}
    />
  </div>
);

// ----------------------------------------
// Main Layout (exported page)
// ----------------------------------------
export default function Page() {
  const [active, setActive] = useState("overview");
  const [projectId, setProjectId] = useState(DATA.projects[0].id);
  const [mobileNav, setMobileNav] = useState(false);
  const project = useProject(projectId);

  const nav = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "model", label: "Model Quality", icon: Activity },
    { id: "system", label: "System Quality", icon: Server },
    { id: "adoption", label: "Adoption", icon: Users },
    { id: "value", label: "Business Value", icon: DollarSign },
    { id: "sim", label: "What‑If", icon: LineChartIcon },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="flex items-center gap-3 px-3 md:px-6 h-14">
          <Sheet open={mobileNav} onOpenChange={setMobileNav}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="p-4 border-b">
                <div className="font-bold">AI Value & ROI Optimizer</div>
                <div className="text-xs text-slate-500">Executive dashboard</div>
              </div>
              <div className="p-3 space-y-1">
                {nav.map((n) => (
                  <NavItem key={n.id} icon={n.icon} label={n.label} active={active===n.id} onClick={()=>{setActive(n.id); setMobileNav(false);}} />
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden md:block font-semibold">AI Value & ROI Optimizer</div>
          <div className="ml-auto flex items-center gap-2">
            {/* Project selector */}
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="w-[230px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {DATA.projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Search metrics, use cases…" className="hidden md:block w-64" />
            <Button variant="outline" className="hidden md:inline-flex">Export CSV</Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-r min-h-[calc(100dvh-3.5rem)] p-3 space-y-1 bg-white">
          {nav.map((n) => (
            <NavItem key={n.id} icon={n.icon} label={n.label} active={active===n.id} onClick={()=>setActive(n.id)} />
          ))}
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border">
            <div className="text-xs text-slate-500 mb-1">Governance</div>
            <div className="flex items-center justify-between text-sm">
              <span>PII Redaction</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span>Safety Filters</span>
              <Switch defaultChecked />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-3 md:p-6 space-y-6">
          <Tabs value={active} onValueChange={setActive} className="space-y-6">
            <TabsList className="hidden md:flex flex-wrap w-full">
              {nav.map((n) => (
                <TabsTrigger key={n.id} value={n.id} className="gap-2">
                  <n.icon className="h-4 w-4" /> {n.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview"><Overview project={project} /></TabsContent>
            <TabsContent value="model"><ModelQuality project={project} /></TabsContent>
            <TabsContent value="system"><SystemQuality project={project} /></TabsContent>
            <TabsContent value="adoption"><Adoption project={project} /></TabsContent>
            <TabsContent value="value"><BusinessValue project={project} /></TabsContent>
            <TabsContent value="sim"><WhatIfSimulator /></TabsContent>
            <TabsContent value="settings">
              <Card className="shadow-sm">
                <CardHeader><CardTitle>Workspace Settings (Demo)</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Currency</Label>
                    <Select defaultValue="USD"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select>
                  </div>
                  <div>
                    <Label>Default Time Range</Label>
                    <Select defaultValue="90d"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="30d">Last 30 days</SelectItem><SelectItem value="90d">Last 90 days</SelectItem><SelectItem value="180d">Last 180 days</SelectItem></SelectContent></Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Connected Providers (Demo)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { name: "OpenAI Billing", on: true },
                        { name: "Vertex AI", on: false },
                        { name: "AWS Bedrock", on: true },
                        { name: "Datadog", on: true },
                        { name: "Snowflake", on: false },
                        { name: "Salesforce", on: false },
                      ].map((i) => (
                        <div key={i.name} className="flex items-center justify-between p-3 rounded-xl border bg-white">
                          <span className="text-sm">{i.name}</span>
                          <Switch defaultChecked={i.on} />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <footer className="text-xs text-slate-500 pt-2">
            Demo prototype with dummy data. All figures are illustrative only.
          </footer>
        </main>
      </div>
    </div>
  );
}
