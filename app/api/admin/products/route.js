import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import pool from '@/lib/db'
import { createProduct, getAllProductsAdmin, getCategories } from '@/lib/queries'

export async function GET() {
  try {
    const [products, categories] = await Promise.all([getAllProductsAdmin(), getCategories()])
    return NextResponse.json({ products, categories })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const formData   = await request.formData()
    const title      = formData.get('title')       || ''
    const description= formData.get('description') || null
    const price      = formData.get('price')       || 0
    const location   = formData.get('location')    || null
    const category_id= formData.get('category_id') || null

    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const imageFiles = formData.getAll('images').filter(f => f && f.size > 0)
    const imagePaths = []

    if (imageFiles.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
      await mkdir(uploadDir, { recursive: true })
      for (const file of imageFiles.slice(0, 8)) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const ext    = file.name.split('.').pop().toLowerCase()
        const fname  = `prod_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        await writeFile(path.join(uploadDir, fname), buffer)
        imagePaths.push(`/uploads/products/${fname}`)
      }
    }

    const id = await createProduct({ category_id, title, description, price, location, images: imagePaths })
    return NextResponse.json({ success: true, id }, { status: 201 })
  } catch (err) {
    console.error('Create product error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
