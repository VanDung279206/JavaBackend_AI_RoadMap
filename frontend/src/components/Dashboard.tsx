const data=[
["Java Core","80%"],
["Database","60%"],
["Backend","40%"],
["AI","20%"]
];

export default function Dashboard(){
return (
<section className="max-w-6xl mx-auto p-6">
<h2 className="text-3xl font-bold">Learning Dashboard</h2>
<div className="grid md:grid-cols-2 gap-5 mt-8">
{data.map(x=>
<div className="border rounded-2xl p-6" key={x[0]}>
<h3 className="text-xl font-bold">{x[0]}</h3>
<p>{x[1]} completed</p>
</div>)}
</div>
</section>
)
}