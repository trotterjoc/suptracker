'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AddSupplementModal from '@/components/AddSupplementModal'
import SupplementCard from '@/components/SupplementCard'
import ProgressRing from '@/components/ProgressRing'
import StreakBadge from '@/components/StreakBadge'

export type TimeOfDay = 'morning' | 'afternoon' | 'night'

export interface Supplement {
  id: string
  name: string
  dosage: string
  time_of_day: TimeOfDay
  take_with: string
  notes: string
  created_at: string
}

export interface DailyLog {
  id: string
  supplement_id: string
  taken_at: string
  log_date: string
}

const TIME_GROUPS: { key: TimeOfDay; label: string; icon: string }[] = [
  { key: 'morning', label: 'Morning', icon: '🌅' },
  { key: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { key: 'night', label: 'Night', icon: '🌙' },
]

export default function Home() {
  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTime, setActiveTime] = useState<TimeOfDay>('morning')
  const [streak, setStreak] = useState(0)

  const today = new Date().toISOString().split('T')[0]

  const getDefaultTime = (): TimeOfDay => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'night'
  }

  useEffect(() => {
    setActiveTime(getDefaultTime())
    fetchData()
  }, [])

  const calculateStreak = async () => {
    const { data: allLogs } = await supabase
      .from('daily_logs')
      .select('log_date')
      .order('log_date', { ascending: false })

    if (!allLogs || allLogs.length === 0) { setStreak(0); return }

    const uniqueDates = [...new Set(allLogs.map(l => l.log_date))] as string[]
    uniqueDates.sort((a, b) => b.localeCompare(a))

    let count = 0
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)

    for (let i = 0; i < uniqueDates.length; i++) {
      const logDate = new Date(uniqueDates[i] + 'T00:00:00')
      const diffDays = Math.round((todayDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === i) {
        count++
      } else {
        break
      }
    }

    setStreak(count)
  }

  const fetchData = async () => {
    setLoading(true)
    const [{ data: sups }, { data: dailyLogs }] = await Promise.all([
      supabase.from('supplements').select('*').order('created_at', { ascending: true }),
      supabase.from('daily_logs').select('*').eq('log_date', today),
    ])
    setSupplements(sups || [])
    setLogs(dailyLogs || [])
    await calculateStreak()
    setLoading(false)
  }

  const toggleTaken = async (supplement: Supplement) => {
    const existing = logs.find(l => l.supplement_id === supplement.id)
    if (existing) {
      await supabase.from('daily_logs').delete().eq('id', existing.id)
      setLogs(logs.filter(l => l.id !== existing.id))
    } else {
      const { data } = await supabase
        .from('daily_logs')
        .insert({ supplement_id: supplement.id, log_date: today })
        .select()
        .single()
      if (data) {
        setLogs(prev => [...prev, data])
        await calculateStreak()
      }
    }
  }

  const deleteSupplement = async (id: string) => {
    await supabase.from('supplements').delete().eq('id', id)
    setSupplements(supplements.filter(s => s.id !== id))
    setLogs(logs.filter(l => l.supplement_id !== id))
  }

  const isTaken = (id: string) => logs.some(l => l.supplement_id === id)

  const grouped = TIME_GROUPS.reduce((acc, t) => {
    acc[t.key] = supplements.filter(s => s.time_of_day === t.key)
    return acc
  }, {} as Record<TimeOfDay, Supplement[]>)

  const totalTaken = supplements.filter(s => isTaken(s.id)).length
  const totalCount = supplements.length
  const pct = totalCount > 0 ? Math.round((totalTaken / totalCount) * 100) : 0

  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <main className="min-h-screen bg-[#0f0f14] text-white font-body">
      <div className="sticky top-0 z-10 bg-[#0f0f14]/90 backdrop-blur-md border-b border-white/5 px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">VitaTrack</h1>
            <p className="text-xs text-white/40 mt-0.5">{dateLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <StreakBadge streak={streak} />
            {totalCount > 0 && (
              <div className="flex items-center gap-2">
                <ProgressRing pct={pct} size={40} />
                <span className="text-sm text-white/60">{totalTaken}/{totalCount}</span>
              </div>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-5">
        <div className="flex gap-2 bg-white/5 rounded-2xl p-1">
          {TIME_GROUPS.map(t => {
            const count = grouped[t.key].length
            const doneCount = grouped[t.key].filter(s => isTaken(s.id)).length
            return (
              <button
                key={t.key}
                onClick={() => setActiveTime(t.key)}
                className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all text-sm font-medium ${
                  activeTime === t.key
                    ? 'bg-white/10 text-white shadow'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <span className="text-lg mb-0.5">{t.icon}</span>
                <span className="text-xs">{t.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] mt-0.5 font-bold ${doneCount === count ? 'text-emerald-400' : 'text-white/30'}`}>
                    {doneCount}/{count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-5 pb-24 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
          </div>
        ) : grouped[activeTime].length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">{TIME_GROUPS.find(t => t.key === activeTime)?.icon}</p>
            <p className="text-white/30 text-sm">No supplements for {activeTime}</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
            >
              + Add one
            </button>
          </div>
        ) : (
          grouped[activeTime].map(sup => (
            <SupplementCard
              key={sup.id}
              supplement={sup}
              taken={isTaken(sup.id)}
              onToggle={() => toggleTaken(sup)}
              onDelete={() => deleteSupplement(sup.id)}
            />
          ))
        )}
      </div>

      {showModal && (
        <AddSupplementModal
          onClose={() => setShowModal(false)}
          onAdded={fetchData}
          defaultTime={activeTime}
        />
      )}
    </main>
  )
}
