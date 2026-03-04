import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/utils/format'
import Link from 'next/link'

export default async function AdminQuotesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const quotes = await prisma.quote.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-40 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white">Manage Quotes</h1>
            <Link
              href="/admin"
              className="text-blue-400 hover:text-blue-300"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            {quotes.length === 0 ? (
              <p className="text-white/70">No quotes found.</p>
            ) : (
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">{quote.name}</h3>
                        <p className="text-white/70 text-sm">{quote.email}</p>
                        {quote.company && (
                          <p className="text-white/70 text-sm">Company: {quote.company}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded text-sm ${
                        quote.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                        quote.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {quote.status}
                      </span>
                    </div>
                    <div className="mb-4">
                      <p className="text-white/70 text-sm mb-2">
                        <strong>Service Type:</strong> {quote.serviceType}
                      </p>
                      <p className="text-white/70">{quote.message}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-white/50 text-sm">{formatDate(quote.createdAt)}</p>
                      <Link
                        href={`/admin/quotes/${quote.id}`}
                        className="px-4 py-2 bg-gradient-aviation rounded-lg hover:shadow-glow-blue transition-all text-white font-semibold text-sm"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

