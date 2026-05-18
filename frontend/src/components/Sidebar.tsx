'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Cpu, ChevronRight } from 'lucide-react'
import { TOP_DOWN_PARSERS, BOTTOM_UP_PARSERS, PARSERS } from '@/lib/parsers'

function NavGroup({ title, keys }: { title: string; keys: string[] }) {
  const path = usePathname()
  return (
    <div className="mb-5">
      <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {title}
      </p>
      {keys.map(key => {
        const p      = PARSERS[key]
        const active = path === `/${key}`
        return (
          <Link
            key={key}
            href={`/${key}`}
            className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm mb-0.5 transition-colors duration-150 ${
              active
                ? 'bg-neutral-100 text-neutral-900 font-medium'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
            }`}
          >
            {p.label}
            {active && <ChevronRight className="h-3 w-3 text-neutral-400" />}
          </Link>
        )
      })}
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="w-52 flex-shrink-0 border-r border-neutral-200 bg-white flex flex-col py-4 shadow-sm">
      <div className="px-3 mb-6 flex items-center gap-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900">
          <Cpu className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-neutral-900 tracking-tight">Parser Lab</span>
      </div>

      <nav className="flex-1 px-2">
        <NavGroup title="Top-Down"  keys={TOP_DOWN_PARSERS}  />
        <div className="mx-3 border-t border-neutral-100" />
        <div className="mt-4">
          <NavGroup title="Bottom-Up" keys={BOTTOM_UP_PARSERS} />
        </div>
      </nav>

      <div className="px-3 mt-auto pt-4 border-t border-neutral-100">
        {/* <p className="text-[10px] text-neutral-400">Flask API · localhost:5000</p> */}
        <p className="text-[10px] text-neutral-400">Flask API Serverless</p>
      </div>
    </aside>
  )
}
