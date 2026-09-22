export type WorldLandmarkId='workshop'|'wanderer'|'mine'|'settlement'
export type WorldLandmark={id:WorldLandmarkId;label:string;eyebrow:string;description:string;x:number;y:number}

/** Presentation-only authored landmarks. They describe visible scene elements and never imply
 * financial progress, rewards or unlock state. Coordinates live on the canonical 1600×900 world canvas. */
export const WORLD_EXPLORATION_LANDMARKS:readonly WorldLandmark[]=[
 {id:'workshop',label:'Мастерская',eyebrow:'ЖИВОЕ ОКРУЖЕНИЕ',description:'Тёплый свет из мастерской ложится на рабочий двор. Дым и редкие искры делают центр поселения обитаемым даже издалека.',x:752,y:540},
 {id:'wanderer',label:'Странник',eyebrow:'ТВОЙ СПУТНИК',description:'Странник задержался у тропы между мастерской и шахтой. Его путь связывает ближний двор с дальними огнями поселения.',x:870,y:605},
 {id:'mine',label:'Шахта',eyebrow:'ГЛУБИНА МИРА',description:'У входа в шахту темнее и тише. Тележки, следы на земле и редкое движение у ворот продолжают рабочий ритм поселения.',x:1032,y:548},
 {id:'settlement',label:'Поселение',eyebrow:'ГОРИЗОНТ',description:'За ближними постройками видны огни дальнего поселения. Они дают сцене глубину и ощущение мира, который продолжается за горизонтом.',x:1357,y:610},
] as const

export function resolveWorldLandmark(id:string|null|undefined){return WORLD_EXPLORATION_LANDMARKS.find(item=>item.id===id)??null}
