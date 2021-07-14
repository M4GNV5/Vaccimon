import Head from 'next/head'
import Image from 'next/image'
import { Button, Container, Nav, Navbar } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  IconDefinition,
  faChessPawn,
  faCrow,
  faDna,
  faVirus,
  faQrcode,
  faSyringe,
  faCheck,
  faTimes,
  faFlagUsa,
  faTint,
} from '@fortawesome/free-solid-svg-icons'
import VaccimonRepo from '../lib/repository'
import { useEffect, useState } from 'react'
import styles from '../styles/index.module.css'
import { Vaccimon } from '../lib/vaccimon'

const icons: {[key: string]: IconDefinition[]} = {
  "Comirnaty": [faDna, faChessPawn],
  "Spikevax": [faDna, faCrow],
  "Vaxzevria": [faVirus, faTint],
  "COVID-19 Vaccine Janssen": [faVirus, faFlagUsa],
}
const classes: {[key: string]: string} = {
  "Comirnaty": styles["card-comirnaty"],
  "Spikevax": styles["card-spikevax"],
  "Vaxzevria": styles["card-vaxzevria"],
  "COVID-19 Vaccine Janssen": styles["card-janssen"],
}

export default function Home() {
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

  function getIcons(v: Vaccimon): IconDefinition[] {
    if(v.vaccine in icons)
      return icons[v.vaccine]
    else
      return [faSyringe]
  }
  function getCardClass(v: Vaccimon): string {
    if(v.vaccine in classes)
      return classes[v.vaccine]
    else
      return 'card-other'
  }

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
              <div key={v.id} className={`${styles.preview} ${getCardClass(v)}`}>
                <span className={styles.name}>
                  {v.fullName}
                </span>
                <span className={styles.vaccinationKind}>
                  {getIcons(v).map((icon, i) => <FontAwesomeIcon key={i} icon={icon} fixedWidth />)}
                </span>
                <div className={styles.imageContainer}>
                  <Image src={v.avatarUrl} width={245} height={245} alt="" />
                </div>
                <div className={styles.properties}>
                  <div>
                    <span className={styles.propName}>Geburtstag</span>
                    <span className={styles.propValue}>{v.dateOfBirth.toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className={styles.propName}>Impfdatum</span>
                    <span className={styles.propValue}>{v.vaccinationDate.toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className={styles.propName}>Impfstoff</span>
                    <span className={styles.propValue}>{v.vaccine}</span>
                  </div>
                  <div>
                    <span className={styles.propName}>Vollständig</span>
                    <span className={styles.propValue}><FontAwesomeIcon icon={v.isFullyVaccinated ? faCheck : faTimes} fixedWidth /></span>
                  </div>
                  <Button className={styles.showQRButton}>QR Code anzeigen</Button>
                </div>
              </div>
            )}
          </Container>
        </Container>
      </>
    </>
  )
}
