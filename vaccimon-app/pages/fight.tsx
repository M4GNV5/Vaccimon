import React from 'react'
import dynamic from 'next/dynamic'

// import RoomMap without SSR because react-leaflet really does not like SSR
const FightGame = dynamic(() => import('../components/FightGame'), { ssr: false })

export default function Rooms () {
  return (
    <FightGame />
  )
}
