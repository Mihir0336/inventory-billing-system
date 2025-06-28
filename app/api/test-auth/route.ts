import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log("Test Auth - Full session:", session)
    console.log("Test Auth - User:", session?.user)
    console.log("Test Auth - User ID:", session?.user?.id)
    
    if (!session) {
      return NextResponse.json({ 
        authenticated: false, 
        message: "No session found" 
      })
    }
    
    if (!session.user?.id) {
      return NextResponse.json({ 
        authenticated: false, 
        message: "No user ID in session",
        session: session 
      })
    }
    
    return NextResponse.json({ 
      authenticated: true, 
      user: session.user,
      message: "Authentication successful" 
    })
  } catch (error) {
    console.error("Test Auth Error:", error)
    return NextResponse.json({ 
      authenticated: false, 
      error: "Authentication check failed",
      details: error 
    })
  }
} 