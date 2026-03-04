import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ScrollAnimation } from '@/components/ScrollAnimation'
import { getAllServices } from '@/data/services'
import Link from 'next/link'

export const metadata = {
  title: 'Services - UR Aerotech',
  description: 'Comprehensive aircraft structural repair services',
}

export default function ServicesPage() {
  const services = getAllServices()

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background image for services page */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat services-page-bg"
          style={{
            // Place your services image at /public/images/services-bg.jpg
            backgroundImage: "url('/images/services-bg.jpg')",
            backgroundSize: '120% 120%',
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/70 to-black/85" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollAnimation animation="fadeIn" delay={0}>
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-wider text-white/70 mb-4">OUR SERVICES</p>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Comprehensive Structural Repair Services
              </h1>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Expert aircraft structural repair and modification services with 20+ years of excellence.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ScrollAnimation
                key={service.id}
                animation={index % 3 === 0 ? 'slideLeft' : index % 3 === 1 ? 'slideRight' : 'fadeIn'}
                delay={index * 100}
              >
                <Link
                  href={`/services/${service.slug}`}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 card-hover block"
                >
                  <div className="h-48 bg-gradient-aviation/20 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-5xl">{service.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{service.name}</h3>
                  <p className="text-white/70 mb-4 line-clamp-3">{service.description}</p>
                  <span className="inline-block px-6 py-2 bg-gradient-aviation rounded-lg text-white font-semibold">
                    Learn More →
                  </span>
                </Link>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

