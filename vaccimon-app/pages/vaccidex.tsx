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
      <AppNavbar title="Vaccidex" />
      <Container className={styles.previews}>
        {vaccimon && vaccimon.map(v =>
          <Link key={v.id} href={`/card/${Buffer.from(v.id, 'binary').toString('base64')}`} passHref>
            <a className={styles.preview}>
              <Image src={v.avatarUrl} width={64} height={64} alt="" />
              <div className={styles.name}>
                {v.lastName}
              </div>
            </a>
          </Link>
        )}
      </Container>
      <AppTabbar />
    </AppContainer>
  )
}
