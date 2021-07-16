import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeProps {
  className?: string
  width: number,
  height: number,
  value: string
}

export default function QRCodeCanvas ({ className, width, height, value }: QRCodeProps) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvas.current) {
      return
    }

    QRCode.toCanvas(canvas.current, value, error => {
      console.error(error)
    })
  }, [value])

  return (
    <canvas ref={canvas} className={className} width={width} height={height} />
  )
}
