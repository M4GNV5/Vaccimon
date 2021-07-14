import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { Badge, Button, Container, Nav, Navbar } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQrcode } from '@fortawesome/free-solid-svg-icons'
import Repository from '../lib/repository'
import { useEffect, useState } from 'react'
import styles from '../styles/index.module.css'
import { Vaccimon } from '../lib/vaccimon'

export default function Home() {
  const [vaccimon, setVaccimon] = useState<Vaccimon[]>()

  useEffect(() => {
    async function load () {
      const repo = new Repository()
      try {
        await repo.open()
        
        const vaccimon = []
        for (const entry of await repo.getAllVaccimon()) {
          vaccimon.push(await Vaccimon.parse(entry.data))
        }
        setVaccimon(vaccimon)
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
      <>
        <Navbar bg="light">
          <Container>
            <Navbar.Brand>Vaccimon</Navbar.Brand>
            <Nav.Link href="/scan">
              <FontAwesomeIcon icon={faQrcode} />
              {' '}
              Scan a Vaccimon
            </Nav.Link>
          </Container>
        </Navbar>
        <Container>
          Your Vaccidex:
          <Container className={styles.previews}>
            {vaccimon && vaccimon.map(v =>
              <div key={v.id} className={styles.preview}>
                <Image src="http://placekitten.com/128/128" width={128} height={128} alt="" />
                <div className={styles.name}>
                  {v.fullName}
                </div>
                <div className={styles.type}>
                  {v.vaccine}
                  {' '}
                  <Badge bg="primary">
                    {v.isFullyVaccinated ? '2' : '1'}
                  </Badge>
                </div>
              </div>
            )}
          </Container>
        </Container>
      </>
    </>
  )
}
