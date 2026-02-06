
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { AdherenceLog, AdherenceStatus } from './types';

interface Props {
  logs: AdherenceLog[];
}

const AdherenceChart: React.FC<Props> = ({ logs }) => {
  // Group logs by day for the last 7 days (Weekly View)
  const data = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    const dayLogs = logs.filter(l => {
      const logDate = new Date(l.scheduledTime);
      return logDate.toDateString() === d.toDateString();
    });

    const taken = dayLogs.filter(l => l.status === AdherenceStatus.TAKEN).length;
    const total = dayLogs.length;
    const rate = total > 0 ? (taken / total) * 100 : 0;

    return { name: dayStr, rate, total };
  });

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} 
            interval={0}
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip 
            cursor={{fill: '#f8fafc'}}
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontSize: '12px'
            }}
            formatter={(value: number) => [`${Math.round(value)}% Adherence`, 'Rate']}
          />
          <Bar dataKey="rate" radius={[6, 6, 0, 0]} barSize={28}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.rate > 80 ? '#10b981' : entry.rate > 50 ? '#f59e0b' : '#f43f5e'} 
                fillOpacity={entry.total === 0 ? 0.2 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdherenceChart;
