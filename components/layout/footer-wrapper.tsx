'use client'

import { Footer } from "@/components/layout/footer"
import { Github } from "lucide-react"
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export function FooterWrapper() {
  const pathname = usePathname()
  
  if (pathname === '/chat') {
    return null
  }

  return (
    <Footer
      logo={<Image src="/logo.png" alt="MakeHub Logo" width={40} height={40} />}
      brandName="MakeHub AI"
      socialLinks={[
        {
          icon: (
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5 fill-current"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          ),
          href: "https://x.com/MakeHubAI",
          label: "X",
        },
        {
          icon: <Github className="h-5 w-5" />,
          href: "https://github.com/MakeHub-ai",
          label: "GitHub",
        },
      ]}
      legalLinks={[
        { href: "/policy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
      ]}
      copyright={{
        text: "© 2025 MakeHub AI",
        license: "All rights reserved",
      }}
    />
  )
}
