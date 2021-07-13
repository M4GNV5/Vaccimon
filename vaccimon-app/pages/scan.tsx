import { createRef, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import jsQR, { QRCode } from 'jsqr'

export default function Scan() {
  const router = useRouter()
  const video = createRef<HTMLVideoElement>()
  const canvas = createRef<HTMLCanvasElement>()
  const [intervalHandle, setIntervalHandle] = useState<any>(null)
  const [intervalTick, setIntervalTick] = useState<number>(0)
  const [scanResult, setScanResult] = useState<QRCode | null>(null)
  const [didRedirect, setDidRedirect] = useState<boolean>(false)

  const scanImage = useCallback(async function() {
    const videoEl = video.current
    const canvasEl = canvas.current
    if(!intervalHandle || !videoEl || !canvasEl)
      return

    canvasEl.width = videoEl.videoWidth
    canvasEl.height = videoEl.videoHeight

    const ctx = canvasEl.getContext('2d')
    if(!ctx)
      return

    ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight)
    const imgData = ctx.getImageData(0, 0, videoEl.videoWidth, videoEl.videoHeight)

    const result = await jsQR(imgData.data, videoEl.videoWidth, videoEl.videoHeight)
    setScanResult(result)

    if(!didRedirect && result && result.data.startsWith("HC1:")) {
      clearInterval(intervalHandle)
      setDidRedirect(true)

	    // TODO add cert to catched Vaccimons
      router.push('/')
    }

  }, [router, video, canvas, intervalHandle, didRedirect])

  useEffect(() => {
    if(intervalHandle || !video.current || !canvas.current)
      return

    const videoEl = video.current
    const canvasEl = canvas.current


    async function startVideo() {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'environment',
          width: { max: 640 },
          height: { max: 640 }
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

      let tick = 0
      setIntervalHandle(setInterval(() => setIntervalTick(tick++), 500))
    }

    startVideo()
  }, [video, canvas, intervalHandle])

  useEffect(() => {
    scanImage()
  }, [intervalTick, scanResult, scanImage])

  return (
    <>
      <div className="container">
        <video className="scan-video" ref={video} />
        <canvas className="scan-canvas" ref={canvas} />
      </div>
    </>
  )
}
