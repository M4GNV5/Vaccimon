import Head from 'next/head'
import Link from 'next/link'
import { Button, Container } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQrcode } from '@fortawesome/free-solid-svg-icons'
import Repository from '../lib/repository'
import { useEffect, useState } from 'react'
import Vaccimon from '../lib/Vaccimon'

export default function Home() {
  const [vaccimon, setVaccimon] = useState<Vaccimon[]>()

  useEffect(() => {
    async function load () {
      const repo = new Repository()
      try {
        await repo.open()
        setVaccimon(await repo.getAllVaccimon())
      } finally {
        await repo.close()
      }
    }
    load()
  }, [])

  return (
    <>
      <Head>
        <title>Vaccímon</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <h1>Vaccimon</h1>
        <Link href="/scan" passHref>
          <Button>
            <FontAwesomeIcon icon={faQrcode} />
            {' '}
            Scan a new Vaccimon
          </Button>
        </Link>
        {vaccimon && vaccimon.map(v =>
          <div key={v.id}>
            <h2>{v.firstName} {v.lastName}</h2>
          </div>
        )}
      </Container>
    </>
  )
}
