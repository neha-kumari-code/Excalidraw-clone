import { getServerSession } from "next-auth";
import MainPage from "../mainPage/page";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
export default async function Dashboard(){
    const session=await getServerSession(authOptions)
    if(!session?.user){
        redirect("/signin");
    }
    return (
        <div style={{
            width:"9618",
             height:"4625",
             backgroundColor:"blue"
             } } >
            <MainPage/>
        </div>
    
    )
}