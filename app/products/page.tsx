import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ProductFilters } from '@/components/ProductFilters'
import { ScrollAnimation } from '@/components/ScrollAnimation'
import { prisma } from '@/lib/prisma'
import { getAllCategories } from '@/data/categories'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Products - UR Aerotech',
  description: 'Browse our extensive inventory of aircraft parts, tools, and components',
}

interface ProductsPageProps {
  searchParams: {
    category?: string
    search?: string
    page?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const page = parseInt(searchParams.page || '1')
  const limit = 12
  const skip = (page - 1) * limit

  let products: any[] = []
  let total = 0
  let dbCategories: any[] = []
  let error: string | null = null

  try {
    const where: any = {}
    
    // Handle category filtering - try to match by slug
    if (searchParams.category) {
      // First, try to find the category in the database
      const category = await prisma.category.findFirst({
        where: { slug: searchParams.category }
      }).catch(() => null)
      
      if (category) {
        where.categoryId = category.id
      } else {
        // If category not found, show all products
        console.warn(`Category with slug "${searchParams.category}" not found in database`)
      }
    }
    
    if (searchParams.search) {
      if (where.OR) {
        where.OR = [
          ...where.OR,
          { name: { contains: searchParams.search, mode: 'insensitive' } },
          { description: { contains: searchParams.search, mode: 'insensitive' } },
        ]
      } else {
        where.OR = [
          { name: { contains: searchParams.search, mode: 'insensitive' } },
          { description: { contains: searchParams.search, mode: 'insensitive' } },
        ]
      }
    }

    // Try to fetch products
    try {
      products = await prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
    } catch (e: any) {
      console.error('Error fetching products:', e)
      products = []
    }

    // Try to count products
    try {
      total = await prisma.product.count({ where })
    } catch (e: any) {
      console.error('Error counting products:', e)
      total = 0
    }

    // Try to fetch categories
    try {
      dbCategories = await prisma.category.findMany()
    } catch (e: any) {
      console.error('Error fetching categories:', e)
      dbCategories = []
    }

    // Log for debugging
    console.log('Products found:', products.length)
    console.log('Total products:', total)
    console.log('Categories found:', dbCategories.length)
  } catch (e: any) {
    error = e?.message || 'Failed to load products'
    console.error('Error loading products:', e)
  }

  const totalPages = Math.ceil(total / limit)
  const allCategories = getAllCategories()

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background image for products page */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat products-page-bg"
          style={{
            backgroundImage: "url('/images/products-bg.jpg')",
            backgroundSize: '120% 120%',
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/70 to-black/85" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollAnimation animation="fadeIn" delay={0}>
            <div className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Aircraft Parts & Tools
              </h1>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Browse our extensive inventory of high-quality aircraft components and specialized tools.
              </p>
            </div>
          </ScrollAnimation>

          {/* Categories Showcase */}
          {!searchParams.category && (
            <ScrollAnimation animation="slideUp" delay={100}>
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Browse by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {allCategories.map((category, index) => (
                    <ScrollAnimation
                      key={category.id}
                      animation={index % 2 === 0 ? 'slideLeft' : 'slideRight'}
                      delay={index * 50}
                    >
                      <Link
                        href={`/products?category=${category.slug}`}
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 hover:border-blue-400/50 transition-all duration-300 card-hover group"
                      >
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                          {category.icon}
                        </div>
                        <h3 className="text-white font-semibold mb-1 group-hover:text-blue-300 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-white/60 text-xs line-clamp-2">{category.description}</p>
                      </Link>
                    </ScrollAnimation>
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          )}

          {/* Filters */}
          <ScrollAnimation animation="fadeIn" delay={200}>
            <ProductFilters
              categories={dbCategories}
              currentCategory={searchParams.category}
              currentSearch={searchParams.search}
            />
          </ScrollAnimation>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {products.map((product, index) => (
              <ScrollAnimation
                key={product.id}
                animation={index % 4 === 0 ? 'slideLeft' : index % 4 === 1 ? 'slideRight' : index % 4 === 2 ? 'slideUp' : 'scale'}
                delay={index * 50}
              >
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden card-hover flex flex-col">
                  <Link href={`/products/${product.slug}`} className="flex-1 flex flex-col">
                    <div className="aspect-square bg-gradient-aviation/20 relative">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                      {product.isFeatured && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      {product.category && (
                        <p className="text-white/60 text-sm mb-1">{product.category.name}</p>
                      )}
                      <h3 className="text-white font-semibold mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-white/70 text-sm mb-3 line-clamp-4 flex-1">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Link
                  key={pageNum}
                  href={`?page=${pageNum}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
                  className={`px-4 py-2 rounded-lg ${
                    page === pageNum
                      ? 'bg-gradient-aviation text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  } transition-colors`}
                >
                  {pageNum}
                </Link>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 text-lg mb-4">Error: {error}</p>
              <p className="text-white/70">Please check your database connection or try again later.</p>
            </div>
          )}

          {!error && products.length === 0 && (
            <div className="text-center py-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-white text-xl font-semibold mb-2">No products found</p>
              <p className="text-white/70 mb-6">
                {searchParams.category 
                  ? `No products found in this category.` 
                  : `The product catalog is currently empty. Please seed the database or add products through the admin panel.`}
              </p>
              {searchParams.category && (
                <Link
                  href="/products"
                  className="inline-block px-6 py-3 bg-gradient-aviation rounded-lg text-white font-semibold hover:shadow-glow-blue transition-all mr-4"
                >
                  View All Products
                </Link>
              )}
              <Link
                href="/contact"
                className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all"
              >
                Contact Us
              </Link>
              <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm font-medium mb-2">Need to seed the database?</p>
                <p className="text-white/60 text-xs">
                  Run: <code className="bg-black/30 px-2 py-1 rounded">npx prisma db seed</code> or <code className="bg-black/30 px-2 py-1 rounded">npm run db:seed</code>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

