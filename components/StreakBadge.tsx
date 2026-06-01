interface Props {
  streak: number
}

export default function StreakBadge({ streak }: Props) {
  const flame = streak === 0 ? '🩶' : streak >= 7 ? '🔥' : '🔥'

  return (
    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
      <span className="text-sm">{flame}</span>
      <span className="text-sm font-bold text-white">{streak}</span>
      <span className="text-xs text-white/40">{streak === 1 ? 'day' : 'days'}</span>
    </div>
  )
}
