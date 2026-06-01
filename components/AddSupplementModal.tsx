'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TimeOfDay } from '@/app/page'

interface Props {
  onClose: () => void
  onAdded: () => void
  defaultTime: TimeOfDay
}

const TAKE_WITH_OPTIONS = ['water', 'food', 'milk', 'juice']
const TIME_OPTIONS: { value: TimeOfDay; label: string; icon: string }[] = [
  { value: 'morning', label: 'Morning', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { value: 'night', label: 'Night', icon: '🌙' },
]

export default function AddSupplementModal({ onClose, onAdded, defaultTime }: Props) {
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(defaultTime)
  const [takeWith, setTakeWith] = useState('water')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!name.trim()) { setError('Please enter a supplement name'); return }
    setSaving(true)
    const { error: err } = await supabase.from('supplements').insert({
      name: name.trim(),
      dosage: dosage.trim(),
      time_of_day: timeOfDay,
      take_with: takeWith,
      notes: notes.trim(),
    })
    if (err) { setError(err.message); setSaving(false); return }
    onAdded()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-[#1a1a24] rounded-t-3xl border border-white/10 p-6 pb-10 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Add Supplement</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors text-2xl leading-none">×</button>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-3 py-2">{error}</p>}

        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Supplement Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Vitamin D3, Magnesium..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Dosage</label>
            <input
              type="text"
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              placeholder="e.g. 1000mg, 2 capsules..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Best Time to Take</label>
            <div className="flex gap-2">
              {TIME_OPTIONS.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTimeOfDay(t.value)}
                  className={`flex-1 flex flex-col items-center py-3 rounded-xl border text-sm transition-all ${
                    timeOfDay === t.value
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                  }`}
                >
                  <span className="text-xl mb-1">{t.icon}</span>
                  <span className="text-xs">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Take With</label>
            <div className="flex gap-2 flex-wrap">
              {TAKE_WITH_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setTakeWith(opt)}
                  className={`px-4 py-2 rounded-full text-sm capitalize transition-all border ${
                    takeWith === opt
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Take before bed..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl transition-colors shadow-lg shadow-emerald-500/20"
        >
          {saving ? 'Saving...' : 'Add Supplement'}
        </button>
      </div>
    </div>
  )
}
