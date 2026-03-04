import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/utils/format'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const [productsCount, ordersCount, quotesCount, usersCount, recentOrders, pendingQuotes] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.quote.count({ where: { status: 'PENDING' } }),
    prisma.user.count(),
    prisma.order.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.quote.findMany({
      where: { status: 'PENDING' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const totalRevenue = await prisma.order.aggregate({
    where: { status: { in: ['DELIVERED', 'SHIPPED'] } },
    _sum: { total: true },
  })

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-40 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            <Link
              href="/admin/products/new"
              className="px-6 py-3 bg-gradient-aviation rounded-lg hover:shadow-glow-blue transition-all text-white font-semibold"
            >
              Add Product
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <p className="text-white/70 text-sm mb-2">Total Products</p>
              <p className="text-3xl font-bold text-white">{productsCount}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <p className="text-white/70 text-sm mb-2">Total Orders</p>
              <p className="text-3xl font-bold text-white">{ordersCount}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <p className="text-white/70 text-sm mb-2">Pending Quotes</p>
              <p className="text-3xl font-bold text-white">{quotesCount}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <p className="text-white/70 text-sm mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(totalRevenue._sum.total || 0)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
                <Link href="/admin/orders" className="text-blue-400 hover:text-blue-300 text-sm">
                  View All
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <p className="text-white/70">No orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border-b border-white/10 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-white font-semibold">Order #{order.id.slice(0, 8)}</span>
                          <p className="text-white/70 text-sm">{order.user.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'SHIPPED' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-white font-semibold">{formatCurrency(order.total)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Quotes */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Pending Quotes</h2>
                <Link href="/admin/quotes" className="text-blue-400 hover:text-blue-300 text-sm">
                  View All
                </Link>
              </div>
              {pendingQuotes.length === 0 ? (
                <p className="text-white/70">No pending quotes.</p>
              ) : (
                <div className="space-y-4">
                  {pendingQuotes.map((quote) => (
                    <div key={quote.id} className="border-b border-white/10 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-white font-semibold">{quote.name}</span>
                          <p className="text-white/70 text-sm">{quote.email}</p>
                        </div>
                        <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400">
                          {quote.status}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm line-clamp-2">{quote.message}</p>
                      <Link
                        href={`/admin/quotes/${quote.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                      >
                        Review →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/products"
                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
              >
                <h3 className="text-white font-semibold mb-2">Manage Products</h3>
                <p className="text-white/70 text-sm">Add, edit, or remove products</p>
              </Link>
              <Link
                href="/admin/quotes"
                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
              >
                <h3 className="text-white font-semibold mb-2">Manage Quotes</h3>
                <p className="text-white/70 text-sm">Review and respond to quote requests</p>
              </Link>
              <Link
                href="/admin/orders"
                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
              >
                <h3 className="text-white font-semibold mb-2">Manage Orders</h3>
                <p className="text-white/70 text-sm">View and update order status</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

