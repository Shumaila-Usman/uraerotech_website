import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { ServicesSection } from '@/components/ServicesSection'
import { StatsSection } from '@/components/StatsSection'
import { WhyChooseUs } from '@/components/WhyChooseUs'
import { PartsToolsSection } from '@/components/PartsToolsSection'
import { CTASection } from '@/components/CTASection'
import { ScrollAnimation } from '@/components/ScrollAnimation'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <ScrollAnimation animation="fadeIn" delay={0}>
          <StatsSection />
        </ScrollAnimation>
        <ScrollAnimation animation="slideRight" delay={100}>
          <ServicesSection />
        </ScrollAnimation>
        <ScrollAnimation animation="slideLeft" delay={100}>
          <WhyChooseUs />
        </ScrollAnimation>
        <ScrollAnimation animation="fadeIn" delay={100}>
          <PartsToolsSection />
        </ScrollAnimation>
        <ScrollAnimation animation="scale" delay={100}>
          <CTASection />
        </ScrollAnimation>
      </main>
      <Footer />
    </div>
  )
}

