'use client'

import { Header1 } from "@/components/layout/header"

interface HeaderWrapperProps {
  heroHeight: number;
}

export function HeaderWrapper({ heroHeight }: HeaderWrapperProps) {
  return <Header1 heroHeight={heroHeight} />
}
