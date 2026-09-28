import Link from "next/link";

export default function Navbar(){
return (
<nav className="border-b px-8 py-5 flex justify-between">
<Link href="/">JavaBackend AI</Link>
<div className="flex gap-6">
<Link href="/roadmap">Roadmap</Link>
<Link href="/projects">Projects</Link>
<Link href="/docs">Docs</Link>
</div>
</nav>
)
}