import type{HistoryPoint,PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
export type PortfolioInsight={group:string;label:string;unit:"rub"|"pct"|"count"|"number";value:number|null};
const finite=(n:number|null|undefined):number|null=>typeof n==="number"&&Number.isFinite(n)?n:null;
const sum=(v:number[])=>v.reduce((a,b)=>a+(Number.isFinite(b)?b:0),0);
const ratio=(a:number,b:number)=>b>0&&Number.isFinite(a)?a/b*100:null;
const median=(v:number[])=>{const x=v.filter(Number.isFinite).sort((a,b)=>a-b);return x.length?(x[(x.length-1)>>1]+x[x.length>>1])/2:null};
const growth=(v:number[])=>v.length>1&&v[0]>0&&v.at(-1)!>0?(v.at(-1)!/v[0]-1)*100:null;
const drawdown=(v:number[])=>{if(v.length<2)return null;let peak=0,min=0;for(const n of v){if(n<=0)return null;peak=Math.max(peak,n);min=Math.min(min,(n/peak-1)*100)}return min};
export function buildPortfolioInsights(positions:PositionSnapshot[],history:HistoryPoint[],trusted:boolean):PortfolioInsight[]{
 if(!trusted)return [];
 const validPositions=positions.filter(p=>Number.isFinite(p.currentValue)&&p.currentValue>=0&&Number.isFinite(p.expectedYield)&&Number.isFinite(p.costBasis)&&p.costBasis>=0);
 positions=validPositions;
 const values=positions.map(p=>p.currentValue),total=sum(values),sorted=[...positions].sort((a,b)=>b.currentValue-a.currentValue);
 const isIndexSeries=(xs:HistoryPoint[])=>xs.length>1&&xs.every(x=>x.portfolio!=null&&Number.isFinite(x.portfolio)&&x.portfolio>0)&&xs.some(x=>x.portfolio!>=2);
 const validDate=(date:string)=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date));
 const uniqueByDate=(xs:HistoryPoint[])=>{const dates=new Map<string,HistoryPoint>();const conflicts=new Set<string>();for(const x of xs){if(!validDate(x.date))continue;const old=dates.get(x.date);if(old&&(old.portfolio!==x.portfolio||old.imoex!==x.imoex))conflicts.add(x.date);else if(!old)dates.set(x.date,x)}return [...dates.values()].filter(x=>!conflicts.has(x.date)).sort((a,b)=>a.date.localeCompare(b.date))};
 const valid=uniqueByDate(history.filter(p=>p.portfolio!=null&&Number.isFinite(p.portfolio)&&p.portfolio>0));
 const validIndex=isIndexSeries(valid);
 const returns=(validIndex?valid:[]).slice(1).flatMap((p,i)=>{const days=(Date.parse(p.date)-Date.parse(valid[i].date))/86400000;return days>0&&days<=7?[p.portfolio!/valid[i].portfolio!-1]:[]});
 const paired=uniqueByDate(history.filter(p=>p.portfolio!=null&&p.imoex!=null&&p.portfolio>0&&p.imoex>0&&Number.isFinite(p.portfolio)&&Number.isFinite(p.imoex)));
 const pairedIndex=isIndexSeries(paired);
 const pairedReturns=(pairedIndex?paired:[]).slice(1).flatMap((p,i)=>{const days=(Date.parse(p.date)-Date.parse(paired[i].date))/86400000;return days>0&&days<=7?[{port:p.portfolio!/paired[i].portfolio!-1,index:p.imoex!/paired[i].imoex!-1}]:[]});
 return [
 {group:"Портфель",label:"Число позиций",unit:"count",value:finite(positions.length)}, // 1
 {group:"Портфель",label:"Стоимость позиций",unit:"rub",value:finite(sum(values))}, // 2
 {group:"Портфель",label:"Положительных позиций",unit:"count",value:finite(positions.filter(p=>p.expectedYield>0).length)}, // 3
 {group:"Портфель",label:"Отрицательных позиций",unit:"count",value:finite(positions.filter(p=>p.expectedYield<0).length)}, // 4
 {group:"Портфель",label:"Без изменения",unit:"count",value:finite(positions.filter(p=>p.expectedYield===0).length)}, // 5
 {group:"Портфель",label:"Доля прибыльных",unit:"pct",value:finite(ratio(positions.filter(p=>p.expectedYield>0).length,positions.length))}, // 6
 {group:"Портфель",label:"Доля убыточных",unit:"pct",value:finite(ratio(positions.filter(p=>p.expectedYield<0).length,positions.length))}, // 7
 {group:"Портфель",label:"Общий результат позиций",unit:"rub",value:finite(sum(positions.map(p=>p.expectedYield)))}, // 8
 {group:"Портфель",label:"Прибыльные позиции, ₽",unit:"rub",value:finite(sum(positions.map(p=>Math.max(0,p.expectedYield))))}, // 9
 {group:"Портфель",label:"Убыточные позиции, ₽",unit:"rub",value:finite(sum(positions.map(p=>Math.min(0,p.expectedYield))))}, // 10
 {group:"Структура",label:"Крупнейшая позиция",unit:"pct",value:finite(ratio(sorted[0]?.currentValue??0,total))}, // 11
 {group:"Структура",label:"Две крупнейшие",unit:"pct",value:finite(ratio(sum(sorted.slice(0,2).map(p=>p.currentValue)),total))}, // 12
 {group:"Структура",label:"Три крупнейшие",unit:"pct",value:finite(ratio(sum(sorted.slice(0,3).map(p=>p.currentValue)),total))}, // 13
 {group:"Структура",label:"Пять крупнейших",unit:"pct",value:finite(ratio(sum(sorted.slice(0,5).map(p=>p.currentValue)),total))}, // 14
 {group:"Структура",label:"Десять крупнейших",unit:"pct",value:finite(ratio(sum(sorted.slice(0,10).map(p=>p.currentValue)),total))}, // 15
 {group:"Структура",label:"Минимальная доля",unit:"pct",value:finite(ratio(sorted.at(-1)?.currentValue??0,total))}, // 16
 {group:"Структура",label:"Средняя доля",unit:"pct",value:finite(positions.length?100/positions.length:null)}, // 17
 {group:"Структура",label:"Индекс концентрации HHI",unit:"number",value:finite(total>0?sum(values.map(v=>(v/total)**2))*10000:null)}, // 18
 {group:"Структура",label:"Эффективное число позиций",unit:"number",value:finite(total>0?1/sum(values.map(v=>(v/total)**2)):null)}, // 19
 {group:"Структура",label:"Доля вне топ-5",unit:"pct",value:finite(total>0?100-ratio(sum(sorted.slice(0,5).map(p=>p.currentValue)),total)!:null)}, // 20
 {group:"Цены",label:"Сумма затрат",unit:"rub",value:finite(sum(positions.map(p=>p.costBasis)))}, // 21
 {group:"Цены",label:"Стоимость прибыли к затратам",unit:"pct",value:finite(ratio(sum(positions.map(p=>p.expectedYield)),sum(positions.map(p=>p.costBasis))))}, // 22
 {group:"Цены",label:"Средняя стоимость позиции",unit:"rub",value:finite(positions.length?total/positions.length:null)}, // 23
 {group:"Цены",label:"Медианная стоимость позиции",unit:"rub",value:finite(median(values))}, // 24
 {group:"Цены",label:"Медианный результат позиции",unit:"rub",value:finite(median(positions.map(p=>p.expectedYield)))}, // 25
 {group:"Цены",label:"Лучший результат, ₽",unit:"rub",value:finite(positions.length?positions.reduce((max,p)=>Math.max(max,p.expectedYield),-Infinity):null)}, // 26
 {group:"Цены",label:"Худший результат, ₽",unit:"rub",value:finite(positions.length?positions.reduce((min,p)=>Math.min(min,p.expectedYield),Infinity):null)}, // 27
 {group:"Цены",label:"Средний результат, ₽",unit:"rub",value:finite(positions.length?sum(positions.map(p=>p.expectedYield))/positions.length:null)}, // 28
 {group:"Цены",label:"Доля затрат от стоимости",unit:"pct",value:finite(ratio(sum(positions.map(p=>p.costBasis)),total))}, // 29
 {group:"Цены",label:"Разница стоимости и затрат",unit:"rub",value:finite(total-sum(positions.map(p=>p.costBasis)))}, // 30
 {group:"История",label:"Точек истории",unit:"count",value:finite(valid.length)}, // 31
 {group:"История",label:"Первое значение индекса",unit:"number",value:finite(valid[0]?.portfolio??null)}, // 32
 {group:"История",label:"Последнее значение индекса",unit:"number",value:finite(valid.at(-1)?.portfolio??null)}, // 33
 {group:"История",label:"Рост индекса портфеля",unit:"pct",value:finite(growth((validIndex?valid:[]).map(p=>p.portfolio!)))}, // 34
 {group:"История",label:"Максимальная просадка",unit:"pct",value:finite(drawdown((validIndex?valid:[]).map(p=>p.portfolio!)))}, // 35
 {group:"История",label:"Положительных интервалов",unit:"count",value:finite(returns.length?returns.filter(v=>v>0).length:null)}, // 36
 {group:"История",label:"Отрицательных интервалов",unit:"count",value:finite(returns.length?returns.filter(v=>v<0).length:null)}, // 37
 {group:"История",label:"Доля положительных интервалов",unit:"pct",value:finite(ratio(returns.filter(v=>v>0).length,returns.length))}, // 38
 {group:"История",label:"Лучший интервал",unit:"pct",value:finite(returns.length?returns.reduce((max,n)=>Math.max(max,n),-Infinity)*100:null)}, // 39
 {group:"История",label:"Худший интервал",unit:"pct",value:finite(returns.length?returns.reduce((min,n)=>Math.min(min,n),Infinity)*100:null)}, // 40
 {group:"IMOEX",label:"Совместных точек",unit:"count",value:finite(paired.length)}, // 41
 {group:"IMOEX",label:"Рост IMOEX",unit:"pct",value:finite(growth(paired.map(p=>p.imoex!)))}, // 42
 {group:"IMOEX",label:"Рост портфеля за период IMOEX",unit:"pct",value:finite(growth((pairedIndex?paired:[]).map(p=>p.portfolio!)))}, // 43
 {group:"IMOEX",label:"Разница доходностей",unit:"pct",value:finite(pairedIndex&&paired.length>1&&growth(paired.map(p=>p.imoex!))!=null&&growth(paired.map(p=>p.portfolio!))!=null?growth(paired.map(p=>p.portfolio!))!-growth(paired.map(p=>p.imoex!))!:null)}, // 44
 {group:"IMOEX",label:"Просадка IMOEX",unit:"pct",value:finite(drawdown(paired.map(p=>p.imoex!)))}, // 45
 {group:"IMOEX",label:"Просадка портфеля на общем периоде",unit:"pct",value:finite(drawdown((pairedIndex?paired:[]).map(p=>p.portfolio!)))}, // 46
 {group:"IMOEX",label:"Портфель опередил IMOEX",unit:"count",value:finite(pairedReturns.length?pairedReturns.filter(x=>x.port>x.index).length:null)}, // 47
 {group:"IMOEX",label:"IMOEX опередил портфель",unit:"count",value:finite(pairedReturns.length?pairedReturns.filter(x=>x.port<x.index).length:null)}, // 48
 {group:"IMOEX",label:"Доля интервалов с опережением",unit:"pct",value:finite(ratio(pairedReturns.filter(x=>x.port>x.index).length,pairedReturns.length))}, // 49
 {group:"IMOEX",label:"Среднее опережение за интервал",unit:"pct",value:finite(pairedReturns.length?sum(pairedReturns.map(x=>x.port-x.index))/pairedReturns.length*100:null)}, // 50
 ];
}
