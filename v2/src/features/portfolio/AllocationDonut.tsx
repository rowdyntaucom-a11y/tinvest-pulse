import { lazy, Suspense } from 'react'
import type { AssetClassTone } from './assetClassVisuals'

const AllocationDonutView = lazy(() => import('./AllocationDonutView'))

type Item = {
  label: string
  value: number
  weight: number
  tone: AssetClassTone
}

type Props = {
  items: Item[]
}

export function AllocationDonut({ items }: Props) {
  return (
    <Suspense fallback={<div className="allocation-donut allocation-donut--empty">Структура загружается…</div>}>
      <AllocationDonutView items={items} />
    </Suspense>
  )
}
