import { createRef, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { scanImageData } from 'zbar.wasm'
import Repository from '../lib/repository'
import Vaccimon from '../lib/Vaccimon'
import { EuDgcCert } from 'eudgc'

export default function Scan() {
  const router = useRouter()
  const video = createRef<HTMLVideoElement>()
  const canvas = createRef<HTMLCanvasElement>()
  const [scanning, setScanning] = useState(true)

  async function parseCert (imgData: ImageData): Promise<EuDgcCert | null> {
    const result = await scanImageData(imgData)
    if (result.length === 0) {
      return null
    }
    const qrData = result[0].decode()
    if (!qrData.startsWith('HC1:')) {
      return null
    }
    return await window.EuDgc_parse(qrData)
  }

  const scanImage = useCallback(async function() {
    const videoEl = video.current
    const canvasEl = canvas.current
    if(!scanning || !videoEl || !canvasEl)
      return

    canvasEl.width = videoEl.videoWidth
    canvasEl.height = videoEl.videoHeight

    const ctx = canvasEl.getContext('2d')
    if(!ctx) {
      return
    }

    ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight)
    const imgData = ctx.getImageData(0, 0, videoEl.videoWidth, videoEl.videoHeight)
    const cert = await parseCert(imgData)

    if (cert) {
      setScanning(false)
  
      const repo = new Repository()
      try {
        await repo.open()
        await repo.addVaccimon(new Vaccimon(cert))
      } finally {
        repo.close()
      }

      router.push('/')
    }

  }, [router, video, canvas, scanning])

  useEffect(() => {
    async function startVideo() {
      if (!video.current || !canvas.current) {
        return
      }
  
      const videoEl = video.current
      const canvasEl = canvas.current

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'environment'
        }
      })

      videoEl.srcObject = mediaStream
      videoEl.setAttribute('playsinline', '')
      videoEl.play()
      await new Promise(resolve => {
        videoEl.onloadedmetadata = resolve
      })

      canvasEl.width = videoEl.videoWidth
      canvasEl.height = videoEl.videoHeight
    }
    startVideo()

    const interval = setInterval(() => scanImage(), 500)
    return () => clearInterval(interval)
  }, [video, canvas, scanImage])

  return (
    <>
      <div className="container">
        <video className="scan-video" ref={video} />
        <canvas className="scan-canvas" ref={canvas} />
      </div>
    </>
  )
}
