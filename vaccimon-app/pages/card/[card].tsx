import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { Button, Container, Modal } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  IconDefinition,
  faCar,
  faCrow,
  faDna,
  faVirus,
  faSyringe,
  faFlagUsa,
  faTint
} from '@fortawesome/free-solid-svg-icons'
import SwipableViews from 'react-swipeable-views'
import VaccimonRepo, { VaccimonCert } from '../../lib/repository'
import styles from '../../styles/card.module.css'
import { Vaccimon } from '../../lib/vaccimon'
import AppContainer from '../../components/AppContainer'
import AppNavbar from '../../components/AppNavbar'
import AppTabbar from '../../components/AppTabbar'
import QRCodeCanvas from '../../components/QRCodeCanvas'

const icons: {[key: string]: IconDefinition[]} = {
  Comirnaty: [faDna, faCar],
  Spikevax: [faDna, faCrow],
  Vaxzevria: [faVirus, faTint],
  'COVID-19 Vaccine Janssen': [faVirus, faFlagUsa]
}
const classes: {[key: string]: string} = {
  Comirnaty: styles['card-comirnaty'],
  Spikevax: styles['card-spikevax'],
  Vaxzevria: styles['card-vaxzevria'],
  'COVID-19 Vaccine Janssen': styles['card-janssen']
}

// https://dev.to/jorik/country-code-to-flag-emoji-a21
function getFlagEmoji (code: string): string {
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(char => char.charCodeAt(0) + 127397)
  return String.fromCodePoint(...codePoints)
}

export default function Card () {
  const router = useRouter()
  const [certs, setCerts] = useState<VaccimonCert[]>()
  const [vaccimon, setVaccimon] = useState<Vaccimon[]>()
  const [showCert, setShowCert] = useState(false)
  const index = useMemo(() => {
    const id = router.query.card as string | undefined
    return id ? +id : 0
  }, [router.query])

  function getIcons (v: Vaccimon): IconDefinition[] {
    if (v.vaccine in icons) { return icons[v.vaccine] } else { return [faSyringe] }
  }

  function getCardClass (v: Vaccimon): string {
    if (v.vaccine in classes) { return classes[v.vaccine] } else { return 'card-other' }
  }

  function updateUrl (index: number): void {
    router.replace(`/card/${index}`, undefined, { shallow: true })
  }

  useEffect(() => {
    async function load () {
      const repo = new VaccimonRepo()
      try {
        await repo.open()
        const certs = await repo.getAllCerts()
        const vaccimon = await Promise.all(certs.map(x => Vaccimon.parse(x.data)))
        vaccimon.sort((a, b) => a.fullName.localeCompare(b.fullName))

        setCerts(certs)
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
        <Container>
          <Modal show={showCert} onHide={() => setShowCert(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Certificate</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {certs && <QRCodeCanvas className={styles.qrCode} width={1024} height={1024} value={certs[index].data} />}
            </Modal.Body>
          </Modal>

          {vaccimon &&
            <SwipableViews
              className={styles.previews}
              index={index}
              onChangeIndex={updateUrl}
            >
              {vaccimon.map(v =>
                <div key={v.id} className={`${styles.card} ${getCardClass(v)}`}>
                  <div className={styles.headline}>
                    <div className={styles.vaccinationKind}>
                      {getIcons(v).map((icon, i) => <FontAwesomeIcon key={i} icon={icon} size="xs" fixedWidth />)}
                      {getFlagEmoji(v.country)}
                    </div>
                    <div className={styles.name}>
                      {v.fullName}
                    </div>
                  </div>
                  <div className={styles.imageContainer}>
                    <Image src={v.avatarUrl} width={245} height={245} alt="" />
                  </div>
                  <div className={styles.properties}>
                    <div>
                      <span className={styles.propName}>Vaccine</span>
                      <span className={styles.propValue}>{v.vaccine}</span>
                    </div>
                    <div>
                      <span className={styles.propName}>Level</span>
                      <span className={styles.propValue}>{v.level}</span>
                    </div>
                    <div>
                      <span className={styles.propName}>Birthday</span>
                      <span className={styles.propValue}>
                        {v.dateOfBirth.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div>
                      <span className={styles.propName}>Vaccination day</span>
                      <span className={styles.propValue}>
                        {v.vaccinationDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <Button className={styles.showQRButton} variant="secondary" onClick={() => setShowCert(true)}>Show certificate</Button>
                </div>
              )}
            </SwipableViews>
          }
        </Container>
        <AppTabbar />
    </AppContainer>
  )
}
