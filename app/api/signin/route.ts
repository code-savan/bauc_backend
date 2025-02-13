import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  // Your signin logic here
  return NextResponse.json({ message: 'Success' })
}

export async function GET(request: NextRequest) {
  // Your GET logic here
  return NextResponse.json({ message: 'Success' })
}
