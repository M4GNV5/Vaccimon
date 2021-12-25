import { createRef, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { scanImageData } from 'zbar.wasm'
import VaccimonRepo from '../lib/repository'
import { Vaccimon } from '../lib/vaccimon'
import styles from '../styles/scan.module.css'
import AppTabbar from '../components/AppTabbar'
import AppContainer from '../components/AppContainer'

export default function Scan () {
  const router = useRouter()
  const video = createRef<HTMLVideoElement>()
  const canvas = createRef<HTMLCanvasElement>()
  const [scanning, setScanning] = useState(true)

  const scanImage = useCallback(async function () {
    try {
      const videoEl = video.current
      const canvasEl = canvas.current
      if (!scanning || !videoEl || !canvasEl || videoEl.videoWidth === 0 || videoEl.videoHeight === 0) {
        return
      }

      canvasEl.width = videoEl.videoWidth
      canvasEl.height = videoEl.videoHeight

      const ctx = canvasEl.getContext('2d')
      if (!ctx) {
        return
      }

      ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight)
      const imgData = ctx.getImageData(0, 0, videoEl.videoWidth, videoEl.videoHeight)

      const results = await scanImageData(imgData)
      if (results.length === 0) {
        return
      }

      setScanning(false)
      let success = false
      let message = null

      await Promise.all(results.map(async result => {
        if (success) {
          return
        }

        try {
          const data = result.decode().trim()

          const match = /^https:\/\/vaccimon\.app(\/fight#.*)$/.exec(data)
          console.log(data, match)
          if (match) {
            router.push(match[1])
            success = true
            return
          }

          const cert = await Vaccimon.parse(data, 0, true)
          const repo = new VaccimonRepo()
          try {
            await repo.open()
            await repo.addCert({
              id: cert.id,
              data: data
            })
          } catch (e) {
            console.error(e)
            // simply ignore, the vaccimon probably is already in the vaccidex and we can simply open it
          } finally {
            repo.close()
          }

          router.push(`/card#${cert.id}`)
          success = true
        } catch (e: any) {
          console.error(e)
          message = e?.message || 'Failed handling certificate'
        }
      }))

      if (!success) {
        router.push('/vaccidex')
        alert(`Could not parse QR Code. Please make sure it is a valid vaccination certificate.\n${message}`)
      }
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Failed scanning for QR codes')
    }
  }, [router, video, canvas, scanning])

  useEffect(() => {
    let mediaStream: MediaStream | null = null
    async function startVideo () {
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
      if (mediaStream) {
        mediaStream.getTracks().map(x => x.stop())
      }
    }
  }, [video, canvas, scanImage])

  return (
    <AppContainer>
      <video className={styles.scanVideo} ref={video} />
      <canvas className={styles.scanCanvas} ref={canvas} />
      <div className={styles.legend}>
        Point your camera at a certificate.
      </div>
      <AppTabbar />
    </AppContainer>
  )
}
