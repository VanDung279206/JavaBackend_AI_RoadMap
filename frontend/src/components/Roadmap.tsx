const phases=[
"Foundation",
"Java Core",
"Database",
"Backend",
"Spring Boot",
"System Design",
"AI Integration"
];

export default function Roadmap(){
return (
<section className="max-w-4xl mx-auto p-10">
<h2 className="text-3xl font-bold">Roadmap</h2>
{phases.map((p,i)=>
<div className="border-l pl-6 py-5" key={p}>
{i+1}. {p}
</div>)}
</section>
)
}