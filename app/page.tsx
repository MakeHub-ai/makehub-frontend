"use client";

import React, { useRef, useEffect, useState } from 'react';
import { HeroSection } from '@/components/landing/hero-section';
import { PerformanceChartSection } from '@/components/landing/performance-chart-section';
import { CaseDemoSection } from '@/components/landing/case-demo-section';
import { CtaSection } from '@/components/landing/cta-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { FeaturesOverviewSection } from '@/components/landing/features-overview-section';
import { TestimonialsOverviewSection } from '@/components/landing/testimonials-overview-section';
import { HeaderWrapper } from '@/components/layout/header-wrapper';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroHeight, setHeroHeight] = useState(0);

  useEffect(() => {
    if (heroRef.current) {
      setHeroHeight(heroRef.current.offsetHeight);
    }

    const handleResize = () => {
      if (heroRef.current) {
        setHeroHeight(heroRef.current.offsetHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full bg-gradient-to-b from-blue-50 to-purple-50">
      <HeaderWrapper heroHeight={heroHeight} /> {/* Pass heroHeight to HeaderWrapper */}
      <div ref={heroRef}>
        <HeroSection />
      </div>
      <HowItWorksSection />
      <CaseDemoSection />
      <FeaturesOverviewSection />
      <section className="py-32 sm:py-40 min-h-screen">
        <PerformanceChartSection />
      </section>
      <TestimonialsOverviewSection />
      <CtaSection />
    </div>
  );
}
