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

  const scanImage = useCallback(async function() {
    try {
      const videoEl = video.current
      const canvasEl = canvas.current
      if(!scanning || !videoEl || !canvasEl || videoEl.videoWidth === 0 || videoEl.videoHeight === 0)
        return

      canvasEl.width = videoEl.videoWidth
      canvasEl.height = videoEl.videoHeight

      const ctx = canvasEl.getContext('2d')
      if(!ctx) {
        return
      }

      ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight)
      const imgData = ctx.getImageData(0, 0, videoEl.videoWidth, videoEl.videoHeight)

      const results = await scanImageData(imgData)
      await Promise.all(results.map(async result => {
        try {
          const data = result.decode().trim()  
          const cert = await Vaccimon.parse(data)

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
          if (e instanceof TypeError) {
            console.error('Not a valid certificate:', e)
            return
          } else {
            throw e
          }
        }
      }))
    } catch (e) {
      console.error(e)
      alert(e.message)
    }
  }, [router, video, canvas, scanning])

  useEffect(() => {
    let mediaStream: MediaStream | null = null
    async function startVideo() {
      if (!video.current || !canvas.current) {
        return
      }
  
      const videoEl = video.current

      mediaStream = await navigator.mediaDevices.getUserMedia({
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
    return () => {
      clearInterval(interval)
      if(mediaStream) {
        mediaStream.getTracks().map(x => x.stop())
      }
    }
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
