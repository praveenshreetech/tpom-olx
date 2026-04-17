import { NextResponse } from 'next/server'
import { getAllProducts } from '@/lib/queries'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const property_type = searchParams.get('type')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const products = await getAllProducts({ category, search, property_type, limit, offset })
    return NextResponse.json(products)
  } catch (err) {
    console.error('API Products Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
