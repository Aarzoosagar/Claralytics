import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Cpu, Sparkles, FileText, Database, Check } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="16" width="3" height="6" fill="white" />
                <rect x="8" y="11" width="3" height="11" fill="white" />
                <rect x="14" y="6" width="3" height="16" fill="white" />
                <rect x="20" y="2" width="3" height="20" fill="white" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">Claralytics</span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors">
              Features
            </a>
            <a href="#workflow" className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors">
              Workflow
            </a>
            <a href="#enterprise" className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors">
              Enterprise
            </a>
            <a href="#pricing" className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors">
              Pricing
            </a>
          </nav>

          {/* CTA group */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Login
            </Link>
            <button
              onClick={() => navigate('/register')}
              className="btn-primary text-xs px-3.5 py-1.5"
            >
              Open Workspace
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-white/8 bg-white/3 text-xs text-zinc-500 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            Now with AI-powered forecasting
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-white mb-6">
            Enterprise analytics.<br />
            <span className="text-zinc-500">Intelligently structured.</span>
          </h1>

          <p className="text-lg text-zinc-500 leading-relaxed max-w-xl mb-10">
            Upload your data, surface insights, forecast outcomes, and generate
            executive reports — all in one focused workspace built for serious
            analytical work.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              Open Workspace
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary px-5 py-2.5 text-sm"
            >
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="border border-white/8 rounded-sm overflow-hidden bg-[#0B0B0B]">
          {/* Window bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0D0D0D]">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="flex-1 mx-4">
              <div className="h-5 w-48 bg-white/5 rounded-sm" />
            </div>
          </div>

          {/* Mock dashboard */}
          <div className="p-6 grid grid-cols-12 gap-4">
            {/* Sidebar mock */}
            <div className="col-span-2 space-y-1.5">
              {['Dashboard', 'Datasets', 'Analytics', 'Predictions', 'AI', 'Reports'].map(
                (item, i) => (
                  <div
                    key={item}
                    className={`h-7 rounded-sm flex items-center px-2 ${
                      i === 0 ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className={`h-1.5 rounded-sm ${i === 0 ? 'bg-white w-16' : 'bg-white/15 w-14'}`} />
                  </div>
                )
              )}
            </div>

            {/* Main mock */}
            <div className="col-span-10 space-y-4">
              {/* KPI row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total Records', val: '124,832' },
                  { label: 'Features', val: '47' },
                  { label: 'Completeness', val: '98.4%' },
                  { label: 'Quality Score', val: '91/100' },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-[#111111] border border-white/5 rounded-sm p-3">
                    <div className="text-[10px] text-zinc-600 mb-2">{kpi.label}</div>
                    <div className="text-lg font-bold text-white font-numeric">{kpi.val}</div>
                    <div className="mt-2 h-0.5 bg-white/5 rounded">
                      <div className="h-full bg-white/20 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 bg-[#111111] border border-white/5 rounded-sm p-3">
                  <div className="text-[10px] text-zinc-600 mb-3">Revenue Trend</div>
                  <div className="h-24 flex items-end gap-1">
                    {[40, 55, 45, 70, 65, 80, 75, 90, 85, 95, 88, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-[1px]"
                        style={{
                          height: `${h}%`,
                          background: `rgba(255,255,255,${0.1 + (h / 100) * 0.6})`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-[#111111] border border-white/5 rounded-sm p-3">
                  <div className="text-[10px] text-zinc-600 mb-3">Distribution</div>
                  <div className="space-y-2">
                    {[
                      { label: 'Category A', w: '70%' },
                      { label: 'Category B', w: '50%' },
                      { label: 'Category C', w: '35%' },
                      { label: 'Category D', w: '20%' },
                    ].map((bar) => (
                      <div key={bar.label} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[9px] text-zinc-600">{bar.label}</span>
                          <span className="text-[9px] text-zinc-600">{bar.w}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-sm">
                          <div
                            className="h-full bg-white/30 rounded-sm"
                            style={{ width: bar.w }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/5 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <p className="section-title mb-3">Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything your data team needs.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {[
              {
                icon: BarChart3,
                title: 'Dataset Intelligence',
                desc:
                  'Automated statistical profiling, data quality scoring, anomaly detection, and correlation analysis across all uploaded datasets.',
              },
              {
                icon: Cpu,
                title: 'Predictive Models',
                desc:
                  'Run forecasting, churn prediction, customer segmentation, and anomaly detection with configurable parameters — no code required.',
              },
              {
                icon: Sparkles,
                title: 'AI Insights Engine',
                desc:
                  'An intelligent layer that surfaces executive summaries, strategic risks, and growth opportunities from your data automatically.',
              },
              {
                icon: FileText,
                title: 'Report Generation',
                desc:
                  'Generate and export analysis, prediction, or executive reports as structured PDFs — shareable and professionally formatted.',
              },
              {
                icon: Database,
                title: 'Multi-Dataset Support',
                desc:
                  'Manage multiple datasets simultaneously. Switch context instantly across projects, teams, and analysis workflows.',
              },
              {
                icon: BarChart3,
                title: 'Trend Monitoring',
                desc:
                  'Track evolving patterns across time series data with visual dashboards that update as new data is ingested.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#0B0B0B] p-8">
                <div className="w-8 h-8 rounded-sm border border-white/10 bg-white/3 flex items-center justify-center mb-5">
                  <Icon size={15} className="text-zinc-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="border-t border-white/5 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <p className="section-title mb-3">Workflow</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              From raw data to board-ready insights.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/5">
            {[
              {
                step: '01',
                title: 'Upload',
                desc: 'Drag in your CSV or XLSX file. Claralytics profiles it instantly.',
              },
              {
                step: '02',
                title: 'Analyze',
                desc: 'Automated statistics, quality scoring, correlations, and outlier detection.',
              },
              {
                step: '03',
                title: 'Predict',
                desc: 'Configure and run forecasting, churn, segmentation, or anomaly models.',
              },
              {
                step: '04',
                title: 'Report',
                desc: 'Generate and export structured reports with AI commentary included.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-[#0B0B0B] p-8">
                <span className="text-xs font-mono text-zinc-700 mb-5 block">{step}</span>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section id="enterprise" className="border-t border-white/5 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-title mb-3">Enterprise</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Built for serious analytical work.
              </h2>
              <p className="text-zinc-500 leading-relaxed mb-8">
                Claralytics is designed as a business intelligence platform for
                internal analytics teams, data operations, and executive
                reporting workflows — not a toy dashboard or marketing demo.
              </p>
              <ul className="space-y-3">
                {[
                  'Multi-dataset workspace management',
                  'Role-based access and authentication',
                  'AI-assisted anomaly & risk detection',
                  'Automated executive report export',
                  'Configurable prediction pipelines',
                  'API-native architecture',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-zinc-400">
                    <Check size={13} className="text-white shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Business Intelligence', desc: 'Unified analytics across all your data sources' },
                { label: 'Internal Analytics System', desc: 'Deploy within your existing infrastructure' },
                { label: 'AI Operations Workspace', desc: 'Intelligent automation for data workflows' },
              ].map(({ label, desc }) => (
                <div
                  key={label}
                  className="border border-white/8 rounded-sm p-5 bg-[#0B0B0B]"
                >
                  <h4 className="text-sm font-semibold text-white mb-1">{label}</h4>
                  <p className="text-xs text-zinc-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing placeholder */}
      <section id="pricing" className="border-t border-white/5 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <p className="section-title mb-3">Pricing</p>
            <h2 className="text-3xl font-bold tracking-tight">Simple, transparent pricing.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: 'Starter',
                price: 'Free',
                desc: 'For individuals and small projects',
                features: ['3 datasets', '10K rows/dataset', 'Basic analytics', 'PDF reports'],
              },
              {
                name: 'Professional',
                price: '$49',
                period: '/mo',
                desc: 'For growing teams',
                features: [
                  'Unlimited datasets',
                  '5M rows/dataset',
                  'AI insights & chat',
                  'Predictions engine',
                  'Priority support',
                ],
                featured: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                desc: 'For large organizations',
                features: [
                  'Unlimited everything',
                  'On-premise deploy',
                  'SSO & RBAC',
                  'SLA guarantee',
                  'Dedicated support',
                ],
              },
            ].map(({ name, price, period, desc, features, featured }) => (
              <div
                key={name}
                className={`border rounded-sm p-7 ${
                  featured
                    ? 'border-white/20 bg-white/3'
                    : 'border-white/8 bg-[#0B0B0B]'
                }`}
              >
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-white mb-1">{name}</h3>
                  <p className="text-xs text-zinc-500">{desc}</p>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white font-numeric">{price}</span>
                  {period && <span className="text-sm text-zinc-500">{period}</span>}
                </div>
                <ul className="space-y-2.5 mb-7">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-xs text-zinc-400">
                      <Check size={11} className="text-white shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className={featured ? 'btn-primary w-full text-sm py-2.5' : 'btn-secondary w-full text-sm py-2.5'}
                >
                  Get started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/5 py-32">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-5">
            Start building intelligent<br />analytics workflows.
          </h2>
          <p className="text-zinc-500 mb-10 max-w-md mx-auto">
            Join teams that use Claralytics to turn raw data into decisions faster.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              Open Workspace
              <ArrowRight size={14} />
            </button>
            <Link to="/login" className="btn-secondary px-6 py-3">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="2" y="16" width="3" height="6" fill="white" fillOpacity="0.4" />
                <rect x="8" y="11" width="3" height="11" fill="white" fillOpacity="0.4" />
                <rect x="14" y="6" width="3" height="16" fill="white" fillOpacity="0.4" />
                <rect x="20" y="2" width="3" height="20" fill="white" fillOpacity="0.4" />
              </svg>
            </div>
            <span className="text-xs text-zinc-600">
              © 2026 Claralytics. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Security', 'Status'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
