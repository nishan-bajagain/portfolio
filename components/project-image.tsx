"use client"

import { useState } from "react"
import Image from "next/image"

const FALLBACK_IMAGE = "/project-placeholder.svg"

export function ProjectImage({
  src,
  alt,
  sizes,
}: {
  src: string
  alt: string
  sizes: string
}) {
  const [imageSrc, setImageSrc] = useState(src || FALLBACK_IMAGE)
  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes={sizes}
      quality={75}
      className="object-cover transition-transform duration-500 group-hover:scale-110"
      onError={() => setImageSrc(FALLBACK_IMAGE)}
    />
  )
}
