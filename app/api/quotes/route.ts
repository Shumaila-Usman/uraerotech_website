import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { quoteRequestSchema } from '@/utils/validation'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    const validated = quoteRequestSchema.parse(body)

    const quote = await prisma.quote.create({
      data: {
        ...validated,
        userId: session?.user?.id,
      },
    })

    return NextResponse.json({ success: true, quote }, { status: 201 })
  } catch (error: any) {
    console.error('Quote creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create quote' },
      { status: 400 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can see all quotes
    if (session.user.role !== 'ADMIN') {
      const quotes = await prisma.quote.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ quotes })
    }

    const quotes = await prisma.quote.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ quotes })
  } catch (error: any) {
    console.error('Quote fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}






