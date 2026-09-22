export type WorldLandmarkId='workshop'|'wanderer'|'mine'|'settlement'
export type WorldLandmark={id:WorldLandmarkId;label:string;eyebrow:string;description:string;x:number;y:number}

/** Presentation-only authored landmarks. They describe visible scene elements and never imply
 * financial progress, rewards or unlock state. Coordinates are percentages of the DNA viewport. */
export const WORLD_EXPLORATION_LANDMARKS:readonly WorldLandmark[]=[
 {id:'workshop',label:'Мастерская',eyebrow:'ЖИВОЕ ОКРУЖЕНИЕ',description:'Свет, дым и рабочий двор задают центр поселения. Активность меняется вместе с атмосферой мира.',x:43,y:61},
 {id:'wanderer',label:'Странник',eyebrow:'ТВОЙ СПУТНИК',description:'Странник остаётся частью мира, а не финансовым рейтингом. Его присутствие связывает сцены в один долгий путь.',x:55,y:68},
 {id:'mine',label:'Шахта',eyebrow:'ГЛУБИНА МИРА',description:'Шахтный двор и маршруты жителей добавляют второй план и ощущение работающего пространства.',x:65,y:59},
 {id:'settlement',label:'Поселение',eyebrow:'ГОРИЗОНТ',description:'Дальний слой удерживает масштаб мира: это место продолжается за пределами первого экрана.',x:74,y:47},
] as const

export function resolveWorldLandmark(id:string|null|undefined){return WORLD_EXPLORATION_LANDMARKS.find(item=>item.id===id)??null}
