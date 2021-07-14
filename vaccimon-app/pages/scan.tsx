import { createRef, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Container } from 'react-bootstrap'
import { scanImageData } from 'zbar.wasm'
import VaccimonRepo from '../lib/repository'
import { Vaccimon } from '../lib/vaccimon'
import styles from '../styles/scan.module.css'

export default function Scan() {
  const router = useRouter()
  const video = createRef<HTMLVideoElement>()
  const canvas = createRef<HTMLCanvasElement>()
  const [scanning, setScanning] = useState(true)

  async function parseQR (imgData: ImageData): Promise<string | null> {
    const result = await scanImageData(imgData)
    if (result.length === 0) {
      return null
    }
    return result[0].decode()
  }

  const scanImage = useCallback(async function() {
    try {
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

      const data = await parseQR(imgData)
      const cert = data && await Vaccimon.parse(data)

      if (!data || !cert) {
        return
      }

      const repo = new VaccimonRepo()
      try {
        await repo.open()
        await repo.addCert({
          id: cert.id,
          data: data
        })
      } finally {
        repo.close()
      }

      setScanning(false)
      router.push('/')
    } catch (e) {
      alert(e.message)
    }
  }, [router, video, canvas, scanning])

  useEffect(() => {
    async function startVideo() {
      if (!video.current || !canvas.current) {
        return
      }
  
      const videoEl = video.current

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
    }
    startVideo()

    const interval = setInterval(() => scanImage(), 500)
    return () => clearInterval(interval)
  }, [video, canvas, scanImage])

  return (
    <Container>
      <video className={styles.scanVideo} ref={video} />
      <canvas className={styles.scanCanvas} ref={canvas} />
      <div className={styles.legend}>
        Point your camera at a certificate.
      </div>
    </Container>
  )
}
