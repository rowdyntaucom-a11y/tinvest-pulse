# QVANIX DNA WORLD — архитектурная спецификация

Статус: **SPECIFICATION ONLY / NOT CURRENT IMPLEMENTATION PRIORITY**  
Дата фиксации: 2026-09-12

## 0. Главный phase gate

DNA WORLD — флагманская визуальная и игровая оболочка QVANIX, но не текущий production-приоритет.

Обязательный порядок работ:

1. **Phase A — финансовое ядро и основные вкладки.**
2. **Phase B — World Signal Adapter + WorldState/Event Engine на моковых и уже замороженных данных.**
3. **Phase C — renderer + art pipeline поверх стабильного WorldState.**

Пока Phase A не закрыта, запрещено подключать Living World к незамороженным финансовым формулам. Любые текущие DNA-изменения допустимы только как документация, изолированные deterministic groundwork-модули без изменения production renderer или как исправление критической регрессии уже существующего мира.

### Phase A считается закрытой только когда

- TWR / XIRR / benchmark / drawdown / recovery / risk / Health / income / bonds / attribution / stress / drift имеют явную методологию;
- у критических расчётов есть `calc_version` или эквивалентная версионируемая граница;
- есть детерминированные тесты на исторических и синтетических данных;
- нет молчаливых fallback-формул, которые выглядят как подтверждённые метрики;
- data coverage / sample gates / source semantics видимы и fail-closed;
- Portfolio / Analytics / Risk / Bonds / Income / INTEL готовы как mobile-first product flows;
- Samsung/Android one-screen и performance-regressions закрыты;
- изменение Living World не меняет финансовые формулы как побочный эффект.

Если критерии Phase A не выполнены, XP/level/WorldState для будущего мира остаются моками или изолированными primitives и не считаются product truth.

---

## 1. Один владелец сцены

Правило:

**ONE WORLD → ONE RENDERER → ONE UPDATE LOOP**

В будущем должен существовать один `WorldRoot`, который создаёт ровно один `PIXI.Application` и один update loop. Ни один другой модуль не имеет права напрямую владеть canvas, `#iwScene`, отдельным ticker или параллельным DNA renderer.

Требования:

- `new PIXI.Application` разрешён только в одном entry point;
- CI/static check должен падать при втором владельце сцены;
- runtime должен уметь сообщать фактически запущенную build/version мира;
- старые renderer-paths после миграции удаляются физически, а не просто перестают вызываться.

Это архитектурное правило напрямую закрывает прежний класс регрессий, когда несколько legacy DNA-файлов одновременно влияли на одну сцену.

---

## 2. Жёсткое отделение finance и world

Целевая граница:

```text
finance / analytics
        │
        ▼
World Signal Adapter
        │
        ▼
world_events / World Chronicle
        │
        ▼
WorldState
        │
        ▼
WorldRenderer (PixiJS)
```

### Finance layer

Не знает о PixiJS, спрайтах, погоде, зданиях и анимациях. Выдаёт только финансовые факты и диагностические состояния с версиями расчётов.

### World Signal Adapter

Это дополнительный слой QVANIX между финансовым ядром и игровыми событиями.

Он переводит стабильные финансовые факты в семантические сигналы мира:

```text
TWR / drawdown / Health / income / contribution consistency
        ↓
semantic world signals
        ↓
world events
```

Изменение TWR/Health не должно требовать правок event engine или renderer.

### Целевая package boundary после Phase A

```text
packages/
  finance-ui/
  analytics-core/
  world-signals/
  dna-world/
  shared-types/
```

`dna-world` не импортирует бизнес-логику из `finance-ui`.

Если удалить `dna-world`, финансовый терминал должен продолжать собираться и работать без мира.

---

## 3. WorldState и RenderContext — разные сущности

Серверно-детерминированное состояние мира и состояние конкретного устройства не смешиваются.

### WorldState

Одинаков для одного пользователя на разных устройствах.

```ts
interface WorldStateV1 {
  version: '1.0'
  level: number
  levelName: string
  xp: number
  xpToNext: number

  personalWeather: 'clear' | 'cloudy' | 'rain' | 'storm' | 'aurora'
  marketWeather: 'calm' | 'windy' | 'foggy' | 'storm'
  season: 'spring' | 'summer' | 'autumn' | 'winter'

  population: {
    count: number
    categories: string[]
  }

  constructionProgress: number
  decorations: Record<string, string>
  scars: Array<{
    id: string
    date: string
    kind: string
    sourceEventId: string
  }>

  worldInitialized: boolean
  firstDawnPlayed: boolean
}
```

### RenderContext

Зависит от устройства и сессии и не является product truth.

```ts
interface RenderContext {
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night'
  presentationProfile: 'mobile' | 'desktop'
  motion: 'full' | 'reduced'
  qualityTier: 'low' | 'medium' | 'high'
  devicePixelRatio: number
  visible: boolean
}
```

`timeOfDay`, `prefers-reduced-motion`, FPS/DPR и visibility не должны загрязнять серверный `WorldState`.

---

## 4. Event ledger / World Chronicle

Источник долгосрочной памяти мира — append-only журнал событий, а не мутируемый JSON.

Будущие типы событий:

- `world_initialized`
- `xp_gain`
- `level_up`
- `contribution_habit`
- `health_milestone`
- `performance_period`
- `passive_income_growth`
- `drawdown_started`
- `drawdown_recovered`
- `market_stress_episode`
- `scar_created`
- `achievement_unlocked`
- `anniversary`

Каждое событие имеет idempotency key.

Reload, повторный API retry или повторная синхронизация не могут начислить XP или создать scar второй раз.

`WorldState` — проекция журнала событий. При изменении правила проекции журнал должен быть replayable новой версией.

---

## 5. XP: архитектуру фиксируем сейчас, веса — после Phase A

Обязательные правила XP:

- XP никогда не зависит от капитала в рублях;
- XP не превращает рост рынка в основную награду пользователя;
- XP в первую очередь отражает дисциплину, устойчивость процесса, качество структуры и подтверждённые milestones;
- правила версионируются (`xp_formula_version`);
- одно событие не начисляется дважды;
- неизвестные/неполные входные данные fail-closed.

Предложенная ранее формула:

```text
0.35 TWR + 0.25 Consistency + 0.20 Health + 0.20 IncomeGrowth
```

**не принимается как финальная формула сейчас.**

Причина: вес TWR может сделать DNA наградой за рыночный результат. Финальные веса замораживаются после завершения Phase A и отдельной методологической калибровки.

Текущие deterministic XP primitives могут существовать как groundwork, но не подключаются к production Living World.

---

## 6. Двухслойная погода

Обязательная идея:

- `personalWeather` — состояние конкретного портфеля;
- `marketWeather` — независимый рыночный режим.

Ключевая история продукта: рынок может штормить, а личный портфель держаться устойчивее рынка.

### Personal layer

После Phase A может использовать подтверждённые portfolio drawdown/risk regimes.

### Market layer

Не должен быть только синонимом IMOEX. Для смешанного портфеля будущий market regime должен учитывать equity-market и rates/bond backdrop, если источники данных подтверждены.

### Hysteresis

Переходы погоды обязаны иметь разные входные и выходные пороги. Это предотвращает переключение `rain ↔ clear` из-за шума возле одной границы.

Гистерезис считается в state/signal layer, не в renderer. Renderer только отображает уже принятое состояние.

---

## 7. Scars / постоянная память сцены

Scars — одна из ключевых differentiating-функций DNA WORLD.

Это постоянные объекты сцены: табличка, флаг, памятный элемент моста/города, которые через годы рассказывают историю инвестирования.

Scar не должен награждать конкретную команду вроде «не продал при -20%».

Допустимые события:

- портфель прошёл подтверждённый рыночный стресс-эпизод;
- drawdown завершился восстановлением;
- стратегия/цель прожила год без изменения;
- подтверждён anniversary/milestone;
- завершён длинный период дисциплины.

Scars создаются из World Chronicle, а не из текущего snapshot.

---

## 8. Первый рассвет

`First Dawn` — специально срежиссированная onboarding-сцена и исключение из обычной алгоритмической реакции renderer на state.

Trigger: `worldInitialized = true` после первой успешной серверной инициализации мира.

Не привязывать к первому пополнению: пользователь может подключить уже существующий портфель.

Событие идемпотентно и проигрывается один раз.

---

## 9. Progressive HUD

HUD раскрывается постепенно по мере зрелости пользователя, но функциональность не блокируется уровнем навсегда.

Правило:

- level определяет, что видно по умолчанию;
- help/detail sheet позволяет открыть скрытую информацию вручную;
- новичок не получает одновременно weather, population, chronicle, achievements и множество counters.

Mobile default:

- level / compact status;
- сцена;
- минимальный финансовый контекст;
- остальное — bottom sheet / drill-down.

---

## 10. Renderer layers

Целевая структура PixiJS:

```text
WorldContainer
├─ SkyLayer
├─ BackgroundLayer
├─ MidgroundLayer
├─ BuildingsLayer
├─ CharactersLayer
├─ FXLayer
├─ LightingLayer
└─ EventLayer
```

Каждый слой получает только собственный slice `WorldState + RenderContext`.

Никакой слой не читает DOM финансового UI и не делает запросы к broker/backend самостоятельно.

Renderer хранит только техническую переходную память для interpolation/animation, но не бизнес-state.

---

## 11. Art pipeline

Целевой art flow:

```text
Figma
→ layered export
→ texture atlas
→ Pixi Assets
→ renderer
```

Движущиеся сущности экспортируются отдельными слоями/спрайтами. Один плоский PNG нельзя использовать для объектов, которые должны независимо двигаться, менять lighting или исчезать.

Naming convention:

```text
{category}_{level}_{variant}.png
```

Примеры:

- `building_fundament_01.png`
- `character_worker_walk_03.png`
- `fx_rain_drop_01.png`

Background NPC: AnimatedSprite 3–4 кадра. Skeletal animation — только для редких крупных cinematic-сцен, если оправдано art-budget.

---

## 12. Mobile-first composition

QVANIX не делает desktop-вёрстку, просто уменьшенную media query. Но также не создаёт два независимых world renderer-а.

Целевое решение:

- один `WorldRenderer`;
- `PresentationProfile = mobile | desktop`;
- разные camera/HUD/LOD composition rules;
- одинаковая world semantics.

Обязательно:

- `100dvh`;
- safe-area insets;
- bottom sheet для secondary HUD;
- no-scroll основной сцены;
- Samsung Internet/Chrome QA;
- touch targets без micro-controls.

---

## 13. Performance budget

Исходные бюджеты принимаются как стартовая граница, а не вечная константа:

- animated NPC: ≤14 одновременно;
- particles/FX: ≤60 одновременно;
- atlas: ≤2048×2048; ориентир ≤3 активных atlas;
- visible ticker target: 30 fps;
- hidden app/tab: ticker полностью останавливается;
- far background — static/low-cost;
- offscreen entities: `renderable = false` / lifecycle culling.

Дополнительно QVANIX вводит adaptive quality:

- DPR cap;
- quality tiers `low / medium / high`;
- автоматическое уменьшение particle budget при устойчивом падении FPS;
- отключение дорогих FX на слабом GPU;
- `prefers-reduced-motion` как обязательная ветка.

Performance degradation не меняет WorldState — только RenderContext/Presentation.

---

## 14. Production version observability

После будущей миграции production должен иметь однозначный ответ на вопрос: «какой renderer реально работает у пользователя?»

Требования:

- одна build version;
- runtime `__QVANIX_WORLD_VERSION__` или эквивалент;
- безопасная telemetry/version heartbeat без финансовых данных и PII;
- CI проверяет отсутствие второго world entry point;
- legacy renderer bundles удаляются из output после завершения migration.

Telemetry не содержит account id, broker token, капитал, позиции или пользовательские финансовые данные.

---

## 15. Share-safe и public world

Будущий sharing строится отдельным allowlist DTO.

Запрещено брать полный internal WorldState и «вырезать секретные поля» на клиенте.

Нужен отдельный серверный `PublicWorldSnapshot`.

Share-safe по умолчанию скрывает:

- капитал;
- account name/id;
- тикеры и позиции;
- broker identifiers;
- точные financial performance values, если пользователь явно их не разрешил.

Public share id должен поддерживать revoke/rotate.

---

## 16. Phase sequence после закрытия финансового ядра

### Phase B1 — shared contracts

Реализовать и протестировать `WorldStateV1`, `WorldEventV1`, `RenderContext` без renderer.

### Phase B2 — World Signal Adapter

Подключить только замороженные versioned financial facts.

### Phase B3 — Event Engine / Chronicle

Проверить idempotency, replay, projection и отсутствие double XP.

### Phase B4 — renderer на placeholder assets

Цветные/тестовые assets вместо финального арта.

Acceptance:

- одна сцена;
- один ticker;
- deterministic state transitions;
- mobile/desktop presentation profiles;
- no dependency back into finance UI.

### Phase C1 — art integration

Только после успешного placeholder renderer.

### Phase C2 — two-layer weather + hysteresis

### Phase C3 — First Dawn

### Phase C4 — scars / chronicle visualization

### Phase C5 — progressive HUD / citizens / ambient events

### Phase C6 — sharing / public world

---

## 17. Anti-regression rules

1. Нельзя исправлять одну DNA-фичу одновременной правкой finance math + event semantics + renderer.
2. Если изменение требует трёх слоёв сразу — сначала разделить ответственность.
3. Нельзя возвращать второй renderer ради быстрого визуального эксперимента.
4. Нельзя давать renderer напрямую вычислять XP/weather/financial state.
5. Нельзя использовать размер капитала как XP/progression multiplier.
6. Нельзя считать отсутствующие финансовые данные нулём без подтверждённой observation semantics.
7. Нельзя публиковать share snapshot через blacklist полей — только allowlist DTO.
8. Нельзя переходить к Phase B/C, пока Phase A audit имеет открытые критические математические/data-integrity пункты.

---

## 18. Текущий статус проекта

На дату этой фиксации QVANIX **остаётся в Phase A**.

Приоритет разработки:

1. математика и методология;
2. Portfolio / Analytics / Risk / Bonds / Income;
3. INTEL / event understanding;
4. data quality / coverage / versioning;
5. mobile one-screen / performance / production stability;
6. security / multi-user readiness / legal blockers;
7. затем Living World по данной спецификации.

Этот файл является архитектурным контрактом будущего DNA WORLD, а не разрешением переключить текущую разработку с финансового ядра на визуальный мир.
