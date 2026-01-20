
import React from 'react';
import { useStore } from '../store';
import { UserRole } from '../types';
import { Navigate, Link } from 'react-router-dom';
import { LayoutDashboard, Film, Users, TrendingUp, Settings, Plus, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/DesignSystem';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

export const AdminDashboard = () => {
  const { user } = useStore();
  if (user?.role !== UserRole.ADMIN) return <Navigate to="/" />;

  const stats = [
    { label: 'Active Subscribers', value: '12,840', change: '+14%' },
    { label: 'Platform Revenue', value: '$84.2k', change: '+22%' },
    { label: 'Film Catalog', value: '1,209', change: '+2%' },
  ];

  const chartData = [
    { name: 'Mon', value: 400 }, { name: 'Tue', value: 300 }, { name: 'Wed', value: 600 },
    { name: 'Thu', value: 800 }, { name: 'Fri', value: 700 }, { name: 'Sat', value: 900 },
  ];

  return (
    <div className="flex min-h-screen bg-cinema-black">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-cinema-border hidden lg:block p-8 space-y-12">
        <div className="space-y-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Operations</h3>
          <nav className="space-y-1">
            <Link to="/admin" className="flex items-center gap-3 py-2 text-sm font-bold text-white"><LayoutDashboard size={16} /> Overview</Link>
            <Link to="/admin/movies" className="flex items-center gap-3 py-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors"><Film size={16} /> Movie Library</Link>
            <Link to="/admin" className="flex items-center gap-3 py-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors"><Users size={16} /> User Base</Link>
          </nav>
        </div>
        <div className="space-y-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Systems</h3>
          <nav className="space-y-1">
            <Link to="/admin" className="flex items-center gap-3 py-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors"><TrendingUp size={16} /> Analytics</Link>
            <Link to="/admin" className="flex items-center gap-3 py-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors"><Settings size={16} /> Config</Link>
          </nav>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 p-8 md:p-12 space-y-12 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Platform Control</h1>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Operational health for CineNoir</p>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" size="sm">Export Logs</Button>
             <Button size="sm" className="gap-2"><Plus size={16} /> New Release</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map(s => (
            <div key={s.label} className="p-8 bg-cinema-card border border-cinema-border rounded-sm space-y-4">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{s.label}</p>
               <div className="flex items-end justify-between">
                  <span className="text-3xl font-black italic">{s.value}</span>
                  <span className="text-xs font-black text-emerald-500 flex items-center gap-1"><ArrowUpRight size={14} /> {s.change}</span>
               </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 p-8 bg-cinema-card border border-cinema-border rounded-sm space-y-8">
              <h3 className="text-xs font-black uppercase tracking-widest">Platform Traffic</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" hide />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{backgroundColor: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: '4px'}} 
                    />
                    <Bar dataKey="value" fill="#e11d48" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="p-8 bg-cinema-card border border-cinema-border rounded-sm space-y-8">
              <h3 className="text-xs font-black uppercase tracking-widest">Recent Activity</h3>
              <div className="space-y-6">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold leading-none">Catalog entry "Stalker" updated</p>
                        <p className="text-[10px] text-zinc-600 font-black uppercase">24m ago • admin_01</p>
                      </div>
                   </div>
                 ))}
              </div>
              <Button variant="link" className="w-full text-xs font-black uppercase tracking-widest">View System Log</Button>
           </div>
        </div>
      </main>
    </div>
  );
};
