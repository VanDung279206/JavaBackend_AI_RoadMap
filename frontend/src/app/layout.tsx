import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata={
 title:"Java Backend AI Roadmap",
 description:"Developer learning platform"
}

export default function Layout({children}:{children:React.ReactNode}){
 return (
  <html lang="en">
   <body>
    <Navbar/>
    {children}
   </body>
  </html>
 )
}