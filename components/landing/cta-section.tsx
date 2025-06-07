"use client"

import Link from 'next/link';
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="container mx-auto max-w-7xl px-4 py-20 sm:py-28">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Pick your AI model, we route your request to the ideal provider
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Join the AI builders who have cut costs by 50% and improved speed with Makehub.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
            <Link href="/docs">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 transition-all">
                Get It Now!
              </Button>
            </Link>
            <Link href="/chat" className="text-sm font-semibold text-white hover:text-gray-100">
              Try it first <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
