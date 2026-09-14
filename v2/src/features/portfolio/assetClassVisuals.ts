export type AssetClassTone = 'equity' | 'bond' | 'fund' | 'currency' | 'future' | 'other'

export type AssetClassVisual = {
  tone: AssetClassTone
  label: string
}

const VISUALS: Record<string, AssetClassVisual> = {
  'Акции': { tone: 'equity', label: 'Акции' },
  'Облигации': { tone: 'bond', label: 'Облигации' },
  'Фонды': { tone: 'fund', label: 'Фонды' },
  'Валюта': { tone: 'currency', label: 'Валюта' },
  'Фьючерсы': { tone: 'future', label: 'Фьючерсы' },
  'Прочее': { tone: 'other', label: 'Прочее' },
}

const OTHER = VISUALS['Прочее']

export function assetClassVisualForLabel(label: string): AssetClassVisual {
  return VISUALS[label] ?? OTHER
}
