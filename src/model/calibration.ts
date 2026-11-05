import { params,exp3 } from './params';
import { micFromKanR } from './pharmacodynamics';
export function calibrationSeries(){
    return {
        measured:exp3.value,
        model:Array.from({length:101},(_,rel)=>({rel,mic:micFromKanR(params.B0.value*rel/100)}))
    };
}
