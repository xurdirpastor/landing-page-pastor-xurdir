import { Navbar } from '@/components/navbar/navbar'
import { HeroSection } from '@/components/about/hero-section'
import { AboutSection } from '@/components/about/about-section'
import { AgendaSection } from '@/components/agenda/agenda-section'
import { VideoSection } from '@/components/video/video-section'
import { BooksSection } from '@/components/books/books-section'
import { TestimonialsSection } from '@/components/testimonials/testimonials-section'
import { OfferingsSection } from '@/components/offerings/offerings-section'
import { Footer } from '@/components/footer/footer'
import { getPastorProfile, getAboutPillars, getHeroCtas } from '@/lib/content/about'
import { getHeaderSettings, getNavLinks } from '@/lib/content/header'
import { getAgendaItems } from '@/lib/content/agenda'
import { getBooks } from '@/lib/content/books'
import { getVideoHighlight } from '@/lib/content/video'
import { getTestimonials } from '@/lib/content/testimonials'
import { getOfferingSettings } from '@/lib/content/offerings'
import { getFooterSettings } from '@/lib/content/footer'

export default async function Home() {
  const [
    profile,
    pillars,
    heroCtas,
    header,
    navLinks,
    agendaItems,
    books,
    video,
    testimonials,
    offerings,
    footer,
  ] = await Promise.all([
    getPastorProfile(),
    getAboutPillars(),
    getHeroCtas(),
    getHeaderSettings(),
    getNavLinks(),
    getAgendaItems(),
    getBooks(),
    getVideoHighlight(),
    getTestimonials(),
    getOfferingSettings(),
    getFooterSettings(),
  ])

  return (
    <>
      <Navbar
        logoUrl={footer.logoUrl}
        showLogoText={footer.showLogoText}
        settings={header}
        navLinks={navLinks}
      />
      <main>
        <HeroSection profile={profile} ministryName={header.ministryName} ctas={heroCtas} />
        <AboutSection profile={profile} pillars={pillars} />
        <AgendaSection items={agendaItems} />
        <VideoSection video={video} />
        <BooksSection books={books} />
        <TestimonialsSection testimonials={testimonials} />
        <OfferingsSection settings={offerings} />
      </main>
      <Footer settings={footer} ministryName={header.ministryName} />
    </>
  )
}
