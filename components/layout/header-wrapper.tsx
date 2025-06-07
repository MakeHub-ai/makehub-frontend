'use client'

import { Header } from "@/components/layout/header"

interface HeaderWrapperProps {
  heroHeight: number;
}

export function HeaderWrapper({ heroHeight }: HeaderWrapperProps) {
  return <Header heroHeight={heroHeight} />
}
