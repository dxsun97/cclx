import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { formatTokenCount } from '@/lib/analytics'

interface TokenConsumptionChartProps {
  data: {
    input_tokens: number
    output_tokens: number
    cache_creation_input_tokens: number
    cache_read_input_tokens: number
  }
}

const empty = {
  input_tokens: 0,
  output_tokens: 0,
  cache_creation_input_tokens: 0,
  cache_read_input_tokens: 0,
}

export function TokenConsumptionChart({ data }: TokenConsumptionChartProps) {
  const d = data ?? empty
  const chartData = [
    { name: 'Input', tokens: d.input_tokens, fill: '#6366f1' },
    { name: 'Output', tokens: d.output_tokens, fill: '#22c55e' },
    { name: 'Cache Read', tokens: d.cache_read_input_tokens, fill: '#3b82f6' },
    {
      name: 'Cache Create',
      tokens: d.cache_creation_input_tokens,
      fill: '#f97316',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold">Token Consumption</h3>
        <p className="text-xs text-muted-foreground">
          Aggregate across all sessions (sampled)
        </p>
      </CardHeader>
      <CardContent>
        <div>
          <ResponsiveContainer width="100%" height={256}>
            <BarChart data={chartData} layout="vertical">
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => formatTokenCount(value)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <Tooltip
                formatter={(value) => [
                  formatTokenCount(value as number),
                  'Tokens',
                ]}
                contentStyle={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--color-foreground)',
                }}
                labelStyle={{ color: 'var(--color-foreground)' }}
                itemStyle={{ color: 'var(--color-foreground)' }}
              />
              <Bar
                dataKey="tokens"
                radius={[0, 3, 3, 0]}
                shape={(props) => {
                  const { x, y, width, height, payload } = props as {
                    x: number
                    y: number
                    width: number
                    height: number
                    payload: { fill: string }
                  }
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx={3}
                      fill={payload.fill}
                      fillOpacity={0.8}
                    />
                  )
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
