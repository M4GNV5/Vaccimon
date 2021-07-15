import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge, Container, Nav, Navbar } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQrcode } from '@fortawesome/free-solid-svg-icons'
import AppContainer from '../components/AppContainer'
import AppNavbar from '../components/AppNavbar'
import AppTabbar from '../components/AppTabbar'
import VaccimonRepo from '../lib/repository'
import { Vaccimon } from '../lib/vaccimon'
import styles from '../styles/vaccidex.module.css'

export default function Vaccidex() {
  const [vaccimon, setVaccimon] = useState<Vaccimon[]>()

  useEffect(() => {
    async function load () {
      const repo = new VaccimonRepo()
      try {
        await repo.open()
        const certs = await repo.getAllCerts()
        const vaccimon = await Promise.all(certs.map(x => Vaccimon.parse(x.data)))
        
        vaccimon.sort((a, b) => a.fullName.localeCompare(b.fullName))
        setVaccimon(vaccimon)
      } finally {
        await repo.close()
      }
    }
    load()
  }, [])

  return (
    <AppContainer>
      <AppNavbar title="Overview">
        <Nav.Link href="/scan">
          <FontAwesomeIcon icon={faQrcode} />
          {' '}
          Scan a Vaccimon
        </Nav.Link>
      </AppNavbar>
      <Container>
        Your Vaccidex:
        <Container className={styles.previews}>
          {vaccimon && vaccimon.map(v =>
            <Link key={v.id} href={`/card/${Buffer.from(v.id, 'binary').toString('base64')}`} passHref>
              <a className={styles.preview}>
                <Image src={v.avatarUrl} width={128} height={128} alt="" />
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
              </a>
            </Link>
          )}
        </Container>
      </Container>
      <AppTabbar />
    </AppContainer>
  )
}
