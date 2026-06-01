'use client'

import { useState } from 'react'
import { Supplement } from '@/app/page'

interface Props {
  supplement: Supplement
  taken: boolean
  onToggle: () => void
  onDelete: () => void
}

const TAKE_WITH_ICONS: Record<string, string> = {
  water: '💧',
  food: '🍽️',
  milk: '🥛',
  juice: '🧃',
}

const TIME_COLORS = {
  morning: 'text-amber-400',
  afternoon: 'text-yellow-400',
  night: 'text-indigo-400',
}

export default function SupplementCard({ supplement, taken, onToggle, onDelete }: Props) {
  const [showDelete, setShowDelete] = useState(false)

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
        taken
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-white/5 border-white/8 hover:border-white/15'
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        <button
          onClick={onToggle}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            taken
              ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/30'
              : 'border-white/20 hover:border-white/50'
          }`}
        >
          {taken && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm ${taken ? 'text-white/50 line-through' : 'text-white'}`}>
              {supplement.name}
            </span>
            {supplement.dosage && (
              <span className="text-xs text-white/30 bg-white/5 rounded-full px-2 py-0.5">
                {supplement.dosage}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            {supplement.take_with && (
              <span className="text-xs text-white/40 flex items-center gap-1">
                {TAKE_WITH_ICONS[supplement.take_with] || '💊'} With {supplement.take_with}
              </span>
            )}
            {supplement.notes && (
              <span className="text-xs text-white/30 truncate">{supplement.notes}</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowDelete(!showDelete)}
          className="text-white/20 hover:text-white/50 transition-colors text-lg leading-none p-1"
        >
          ···
        </button>
      </div>

      {showDelete && (
        <div className="border-t border-white/5 px-4 py-2.5 flex justify-end">
          <button
            onClick={() => { onDelete(); setShowDelete(false) }}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Delete supplement
          </button>
        </div>
      )}
    </div>
  )
}
