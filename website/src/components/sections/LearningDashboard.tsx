const items=[
 {name:"Java Core", progress:80, detail:"JVM • OOP • Collections"},
 {name:"Database", progress:60, detail:"SQL • PostgreSQL • JDBC"},
 {name:"Backend", progress:40, detail:"Servlet • Spring Boot"},
 {name:"AI Engineering", progress:20, detail:"LLM • RAG • Agents"}
];

export default function LearningDashboard(){
 return (
 <section className="max-w-6xl mx-auto px-6 py-20">
  <h2 className="text-3xl font-bold">Learning Dashboard</h2>
  <div className="grid md:grid-cols-2 gap-6 mt-8">
  {items.map(i=>(
   <div key={i.name} className="border rounded-2xl p-6 hover:shadow-xl transition">
    <h3 className="text-xl font-semibold">{i.name}</h3>
    <p className="text-muted-foreground mt-2">{i.detail}</p>
    <div className="mt-5 h-2 bg-gray-200 rounded">
      <div className="h-2 bg-black rounded" style={{width:i.progress+"%"}}/>
    </div>
    <p className="mt-2 text-sm">{i.progress}% completed</p>
   </div>
  ))}
  </div>
 </section>
 )
}