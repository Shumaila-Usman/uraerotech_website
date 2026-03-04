import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import * as bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

// Get MongoDB connection
async function getMongoClient() {
  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/uraerotech'
  const client = new MongoClient(uri)
  await client.connect()
  return client
}

// Extract database name from connection string
function getDatabaseName(uri: string): string {
  try {
    const url = new URL(uri)
    // Remove leading slash and get database name
    const dbName = url.pathname.substring(1) || 'uraerotech'
    return dbName
  } catch {
    // Fallback if URL parsing fails
    const match = uri.match(/\/([^/?]+)/)
    return match ? match[1] : 'uraerotech'
  }
}

export async function POST(req: NextRequest) {
  let client: MongoClient | null = null
  try {
    const body = await req.json()
    const { name, email, password, role } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    client = await getMongoClient()
    const dbName = getDatabaseName(process.env.DATABASE_URL || 'mongodb://localhost:27017/uraerotech')
    const db = client.db(dbName)

    // Check if user already exists
    const existingUser = await db.collection('User').findOne({ email })

    if (existingUser) {
      await client.close()
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user using direct MongoDB insertion
    const userData = {
      _id: new ObjectId(),
      email,
      name: name || null,
      password: hashedPassword,
      role: (role as UserRole) || UserRole.B2C,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('User').insertOne(userData)

    await client.close()

    return NextResponse.json(
      { 
        success: true, 
        user: {
          id: userData._id.toString(),
          email: userData.email,
          name: userData.name,
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    if (client) {
      await client.close()
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    )
  }
}

