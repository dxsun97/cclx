import { useSessionStore } from '@/store/session-store'
import { formatTokenCount } from '@/lib/analytics'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface CustomPayload {
  dataKey: string
  value: number
  color: string
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: CustomPayload[]
  label?: number
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-card border border-border rounded-md px-2.5 py-1.5 shadow-lg text-[11px] leading-relaxed">
      <div className="text-muted-foreground mb-0.5">
        Turn {(label ?? 0) + 1}
      </div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground capitalize">
            {entry.dataKey}:
          </span>
          <span className="text-foreground font-medium">
            {formatTokenCount(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function TokenSummary() {
  const { analytics } = useSessionStore()
  if (!analytics) return null

  const { totalTokens, tokensPerTurn } = analytics

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Token Usage
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <StatBox
          label="Input"
          value={formatTokenCount(totalTokens.input_tokens)}
        />
        <StatBox
          label="Output"
          value={formatTokenCount(totalTokens.output_tokens)}
        />
        <StatBox
          label="Cache Read"
          value={formatTokenCount(totalTokens.cache_read_input_tokens ?? 0)}
        />
        <StatBox
          label="Cache Create"
          value={formatTokenCount(totalTokens.cache_creation_input_tokens ?? 0)}
        />
      </div>

      {tokensPerTurn.length > 1 && (
        <div>
          <ResponsiveContainer width="100%" height={96}>
            <AreaChart
              data={tokensPerTurn}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="turnIndex" hide />
              <YAxis hide />
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 50 }}
              />
              <Area
                type="monotone"
                dataKey="input"
                stroke="#6366f1"
                fill="url(#tokenGradient)"
                strokeWidth={1.5}
                name="input"
              />
              <Area
                type="monotone"
                dataKey="output"
                stroke="#22c55e"
                fill="none"
                strokeWidth={1.5}
                name="output"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-md px-2.5 py-1.5">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  )
}
