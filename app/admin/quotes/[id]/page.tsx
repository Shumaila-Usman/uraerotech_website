import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/utils/format'
import Link from 'next/link'
import { QuoteActions } from '@/components/QuoteActions'

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: { user: true },
  })

  if (!quote) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-40 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/admin/quotes"
            className="text-blue-400 hover:text-blue-300 mb-6 inline-block"
          >
            ← Back to Quotes
          </Link>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">Quote Request</h1>
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                quote.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                quote.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {quote.status}
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-white/70 text-sm mb-2">Contact Information</h2>
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <p className="text-white"><strong>Name:</strong> {quote.name}</p>
                  <p className="text-white"><strong>Email:</strong> {quote.email}</p>
                  {quote.phone && (
                    <p className="text-white"><strong>Phone:</strong> {quote.phone}</p>
                  )}
                  {quote.company && (
                    <p className="text-white"><strong>Company:</strong> {quote.company}</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-white/70 text-sm mb-2">Request Details</h2>
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <p className="text-white"><strong>Service Type:</strong> {quote.serviceType}</p>
                  {quote.itemId && (
                    <p className="text-white"><strong>Item ID:</strong> {quote.itemId}</p>
                  )}
                  <p className="text-white"><strong>Message:</strong></p>
                  <p className="text-white/70 whitespace-pre-wrap">{quote.message}</p>
                </div>
              </div>

              {quote.adminNotes && (
                <div>
                  <h2 className="text-white/70 text-sm mb-2">Admin Notes</h2>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/70 whitespace-pre-wrap">{quote.adminNotes}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-white/50 text-sm">Submitted: {formatDate(quote.createdAt)}</p>
                {quote.updatedAt !== quote.createdAt && (
                  <p className="text-white/50 text-sm">Last Updated: {formatDate(quote.updatedAt)}</p>
                )}
              </div>

              <QuoteActions quoteId={quote.id} currentStatus={quote.status} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

