const projects=[
["Personal Finance System","Java JDBC PostgreSQL"],
["Knowledge Assistant","Java AI RAG"],
];

export default function ProjectShowcase(){
 return (
 <section className="max-w-6xl mx-auto px-6 py-20">
 <h2 className="text-3xl font-bold">Featured Projects</h2>
 <div className="grid md:grid-cols-2 gap-6 mt-8">
 {projects.map(p=>(
  <div key={p[0]} className="border rounded-2xl p-6 hover:shadow-xl">
   <h3 className="text-xl font-bold">{p[0]}</h3>
   <p className="mt-3 text-muted-foreground">{p[1]}</p>
  </div>
 ))}
 </div>
 </section>
 )
}