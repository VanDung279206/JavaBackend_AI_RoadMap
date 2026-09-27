const phases=[
"Foundation",
"Java Core",
"Database",
"Backend API",
"Spring Boot",
"System Design",
"AI Integration"
];

export default function InteractiveRoadmap(){
 return (
 <section className="max-w-5xl mx-auto px-6 py-20">
 <h2 className="text-3xl font-bold">Engineering Roadmap</h2>
 <div className="mt-10 space-y-4">
 {phases.map((p,i)=>(
  <div key={p} className="border rounded-xl p-5 hover:bg-neutral-50">
   <span className="text-sm text-gray-500">0{i+1}</span>
   <h3 className="text-xl font-semibold">{p}</h3>
  </div>
 ))}
 </div>
 </section>
 )
}