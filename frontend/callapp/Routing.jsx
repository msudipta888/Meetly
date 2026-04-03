import React from 'react'
import { Header } from './src/components/Header'
import { Hero } from './src/components/Hero'
import { Features } from './src/components/Features'
import { Testimonials } from './src/components/Testimonials'
import { Footer } from './src/components/Footer'
import { CTA } from './src/components/CTA'
import DesktopShowcase from './src/components/DesktopShowcase'

const Routing = () => {
 
  return (
    <div>
       <Header  />
      <main>
        <Hero/>
        <Features/>
        <DesktopShowcase/>
        <Testimonials/>
        <CTA/>
   </main>
   <Footer/>
    </div>
  )
}

export default Routing
