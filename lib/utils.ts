import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type RgbColor = {
  r: number
  g: number
  b: number
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function normalizeHexColor(color?: string | null, fallback = '#EA1D2C'): string {
  if (!color) {
    return fallback
  }

  const normalized = color.trim()

  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return normalized
  }

  if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
    const [r, g, b] = normalized.slice(1).split('')
    return `#${r}${r}${g}${g}${b}${b}`
  }

  return fallback
}

export function hexToRgb(color?: string | null, fallback = '#EA1D2C'): RgbColor {
  const hex = normalizeHexColor(color, fallback).slice(1)
  const value = Number.parseInt(hex, 16)

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

export function withAlpha(color?: string | null, alpha = 1, fallback = '#EA1D2C'): string {
  const { r, g, b } = hexToRgb(color, fallback)
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`
}

export function shiftHexColor(color?: string | null, amount = 0, fallback = '#EA1D2C'): string {
  const { r, g, b } = hexToRgb(color, fallback)
  const clamp = (value: number) => Math.max(0, Math.min(255, value))

  const nextR = clamp(r + amount)
  const nextG = clamp(g + amount)
  const nextB = clamp(b + amount)

  return `#${[nextR, nextG, nextB]
    .map(value => value.toString(16).padStart(2, '0'))
    .join('')}`
}

export function getContrastTextColor(color?: string | null, fallback = '#EA1D2C'): '#111827' | '#FFFFFF' {
  const { r, g, b } = hexToRgb(color, fallback)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  return brightness > 160 ? '#111827' : '#FFFFFF'
}

export function resolvePreferredImageSource(...sources: Array<string | null | undefined>): string {
  const validSources = sources
    .map(source => source?.trim())
    .filter((source): source is string => Boolean(source))

  if (validSources.length === 0) {
    return ''
  }

  const scoreSource = (source: string) => {
    if (source.startsWith('data:image/') || source.startsWith('http://') || source.startsWith('https://')) {
      return 4
    }

    if (source.startsWith('/api/image')) {
      return 3
    }

    if (source.startsWith('/') && !source.startsWith('/uploads/')) {
      return 2
    }

    if (source.startsWith('/uploads/') || source.startsWith('uploads/')) {
      return 1
    }

    return 0
  }

  return [...validSources].sort((a, b) => scoreSource(b) - scoreSource(a))[0]
}
