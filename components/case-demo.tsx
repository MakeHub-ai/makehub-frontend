'use client'

import { Case } from "@/components/ui/cases-with-infinite-scroll";

export function CaseDemo() {
  return (
    <div className="block 
      [&_.ModelCard]:bg-white 
      [&_.ModelCard]:h-[160px] 
      [&_.ModelCard]:min-w-[320px] 
      [&_.ModelCard]:px-6
      [&_.ModelCard]:pt-2
      [&_.ModelCard]:pb-6
      [&_.ModelCard]:rounded-xl
      [&_.ModelCard]:shadow-sm
      hover:[&_.ModelCard]:shadow-md
      [&_.ModelCard]:transition-shadow
      [&_.ModelCard]:border
      [&_.ModelCard]:border-gray-100
      [&_.ModelCard]:flex
      [&_.ModelCard]:flex-col
      [&_.ModelCard]:justify-start
      [&_.ModelCard]:items-start
      [&_.carousel_item]:mx-1
      [&_.carousel_content]:gap-2
      [&_.carousel]:overflow-visible">
      <Case />
    </div>
  );
}
