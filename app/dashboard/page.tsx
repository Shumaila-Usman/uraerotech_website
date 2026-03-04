import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/utils/format'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const [orders, quotes] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.quote.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-40 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <p className="text-white/70 text-sm mb-2">Pending Quotes</p>
              <p className="text-3xl font-bold text-white">
                {quotes.filter((q) => q.status === 'PENDING').length}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <p className="text-white/70 text-sm mb-2">Account Type</p>
              <p className="text-3xl font-bold text-white">{session.user.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
                <Link href="/dashboard/orders" className="text-blue-400 hover:text-blue-300 text-sm">
                  View All
                </Link>
              </div>
              {orders.length === 0 ? (
                <p className="text-white/70">No orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border-b border-white/10 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">Order #{order.id.slice(0, 8)}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'SHIPPED' ? 'bg-blue-500/20 text-blue-400' :
                          order.status === 'PROCESSING' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mb-1">{formatDate(order.createdAt)}</p>
                      <p className="text-white font-semibold">{formatCurrency(order.total)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Quotes */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Quotes</h2>
                <Link href="/dashboard/quotes" className="text-blue-400 hover:text-blue-300 text-sm">
                  View All
                </Link>
              </div>
              {quotes.length === 0 ? (
                <p className="text-white/70">No quotes yet.</p>
              ) : (
                <div className="space-y-4">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="border-b border-white/10 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">{quote.serviceType}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          quote.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                          quote.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {quote.status}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mb-1">{formatDate(quote.createdAt)}</p>
                      <p className="text-white/70 text-sm line-clamp-2">{quote.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

