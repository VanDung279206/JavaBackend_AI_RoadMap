"use client";
import {useLearning,updateEntry} from './learning-store';
import catalogue from '@/generated/catalogue.json';
export type SaveStatus = "idle" | "saving" | "saved" | "error";
export function usePhaseProgress(phase:string) {
 const state=useLearning();
 const checked=Object.fromEntries(catalogue.exercises.filter(e=>e.phase===phase).map(e=>[e.id,state.entries[e.id]?.status==='self_completed']));
 return {checked,loading:state.loading,saveStatus:'idle' as SaveStatus,toggle:async(id:string)=>{updateEntry(id,{status:checked[id]?'not_started':'self_completed'});}};
}
export function useAllProgress() {
 const state=useLearning();const byPhase:Record<string,number>={};
 for(const e of catalogue.exercises) if(state.entries[e.id]?.status==='self_completed')byPhase[e.phase]=(byPhase[e.phase]||0)+1;
 return {byPhase,totalDone:Object.values(byPhase).reduce((a,b)=>a+b,0),loading:state.loading};
}
