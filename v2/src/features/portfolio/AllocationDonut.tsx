import { lazy, Suspense } from 'react'

const AllocationDonutView = lazy(() => import('./AllocationDonutView'))

type Item = {
  label: string
  value: number
  weight: number
}

export function AllocationDonut({ items }: { items: Item[] }) {
  return (
    <Suspense fallback={<div className="allocation-donut allocation-donut--empty">Структура загружается…</div>}>
      <AllocationDonutView items={items} />
    </Suspense>
  )
}
