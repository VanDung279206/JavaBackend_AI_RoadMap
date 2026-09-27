"use client";

import {useState} from "react";

export default function SearchCommand(){
const [open,setOpen]=useState(false);

return (
<>
<button onClick={()=>setOpen(true)}
className="border rounded-lg px-4 py-2">
⌘ K Search
</button>

{open &&
<div className="fixed inset-0 bg-black/30 flex items-start justify-center pt-32">
<div className="bg-white border rounded-xl p-5 w-96">
<input autoFocus placeholder="Search Java, JDBC, Spring Boot..."
className="w-full border p-3 rounded"/>
</div>
</div>}
</>
)
}