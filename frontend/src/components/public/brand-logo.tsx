import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export const SAND_LOGO_SRC = "/Sand_Monochrome Primary Logo-01.png"

interface BrandLogoProps {
  href?: string
  className?: string
  imageClassName?: string
  priority?: boolean
}

export function BrandLogo({
  href,
  className,
  imageClassName,
  priority = false,
}: BrandLogoProps) {
  const image = (
    <Image
      src={SAND_LOGO_SRC}
      alt="Sand Technologies"
      width={180}
      height={48}
      priority={priority}
      className={cn(
        "h-9 w-auto max-w-[180px] object-contain object-left brightness-0 invert",
        imageClassName
      )}
    />
  )

  if (!href) {
    return <div className={className}>{image}</div>
  }

  return (
    <Link href={href} className={cn("block", className)}>
      {image}
    </Link>
  )
}
