import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'

interface ActivityChartProps {
  data: { date: string; count: number }[]
}

export function ActivityChart({ data }: ActivityChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: format(new Date(d.date), 'MMM d'),
  }))

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold">Session Activity</h3>
        <p className="text-xs text-muted-foreground">
          Sessions per day (last 30 days)
        </p>
      </CardHeader>
      <CardContent>
        <div>
          <ResponsiveContainer width="100%" height={192}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--color-foreground)',
                }}
              />
              <Bar
                dataKey="count"
                fill="var(--color-tool-agent)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
