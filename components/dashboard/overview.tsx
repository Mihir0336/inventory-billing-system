"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { useCurrency } from "@/components/ui/currency-context";

interface OverviewProps {
  data: Array<{
    name: string
    total: number
  }>
}

export function Overview({ data }: OverviewProps) {
  const { symbol } = useCurrency();
  return (
    <div className="w-full h-[350px] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
        <YAxis
            stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
            tickFormatter={(value) => `${symbol}${value.toLocaleString()}`}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px hsl(var(--foreground) / 0.1)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '600' }}
            formatter={(value: any) => [`${symbol}${value.toLocaleString()}`, 'Total']}
          />
          <Bar 
            dataKey="total" 
            fill="url(#colorTotal)" 
            radius={[6, 6, 0, 0]}
            stroke="hsl(var(--primary))"
            strokeWidth={1}
          />
      </BarChart>
    </ResponsiveContainer>
    </div>
  )
}
