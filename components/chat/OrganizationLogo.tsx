import Image from 'next/image'

interface OrganizationLogoProps {
  organization: string;
  size?: number;
}

export function OrganizationLogo({ organization, size = 20 }: OrganizationLogoProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src={`/model_logo/${organization.toLowerCase()}.webp`}
        alt={`${organization} logo`}
        width={size}
        height={size}
        className="rounded object-contain"
        onError={(e) => {
          // Fallback to AI text if image fails to load
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement!.innerHTML = `<div class="w-5 h-5 rounded bg-[#0F172A] flex items-center justify-center">
            <span class="text-[11px] text-white font-medium">AI</span>
          </div>`;
        }}
      />
    </div>
  );
}
