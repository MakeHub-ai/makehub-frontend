"use client"

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CaseDemo } from '@/components/case-demo';

export function CaseDemoSection() {
  return (
    <section className="mt-16 py-10 sm:py-10 min-h-screen">
      <div className="container mx-auto max-w-7xl px-8">
        <div className="mx-auto max-w-3xl lg:text-center mb-16">
          <h2 className="text-5xl font-bold tracking-tight text-gray-900">
            Makehub Models
          </h2>
          <p className="py-5 text-center text-xl text-gray-700 mb-0">
            You choose the model, we choose the provider that runs the best performance for the dollar service.
          </p>
        <div className="">
          <div className="flex justify-around items-center">
          <div className="text-center">
            <p className="text-9xl font-bold text-purple-600">40</p>
            <p className="text-3xl text-gray-900 font-bold">SOTA Models</p>
          </div>
          <div className="text-center">
            <p className="text-9xl font-bold text-blue-600">33</p>
            <p className="text-3xl text-gray-900 font-bold">Providers</p>
          </div>
          </div>
        </div>
        </div>
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>}>
          <CaseDemo />
        </Suspense>
      </div>
    </section>
  );
}
