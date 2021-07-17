import { useEffect, useState } from 'react'
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

import { Vaccimon } from '../lib/vaccimon'
import useVaccimon from '../lib/repository-hook'

import AppContainer from '../components/AppContainer'
import AppNavbar from '../components/AppNavbar'
import AppTabbar from '../components/AppTabbar'
import QRCodeCanvas from '../components/QRCodeCanvas'

import styles from '../styles/card.module.css'

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
  const vaccimon = useVaccimon()
  const [showCert, setShowCert] = useState<Vaccimon | null>(null)
  const [index, setIndex] = useState<number>(0)

  useEffect(() => {
    if (!location.hash) {
      return
    }

    const hash = location.hash.substr(1)
    const idx = vaccimon.findIndex(x => x.id === hash)
    setIndex(idx)
  }, [vaccimon])

  function getIcons (v: Vaccimon): IconDefinition[] {
    if (v.vaccine in icons) {
      return icons[v.vaccine]
    } else {
      return [faSyringe]
    }
  }

  function getCardClass (v: Vaccimon): string {
    if (v.vaccine in classes) {
      return classes[v.vaccine]
    } else {
      return 'card-other'
    }
  }

  function updateUrl (idx: number): void {
    router.replace(`/card#${vaccimon[idx].id}`, undefined, { shallow: true })
    setIndex(idx)
  }

  return (
    <AppContainer>
        <AppNavbar title="Vaccidex" />
        <Container>
          <Modal show={!!showCert} onHide={() => setShowCert(null)}>
            <Modal.Header closeButton>
              <Modal.Title>Certificate</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {showCert && <QRCodeCanvas className={styles.qrCode} width={1024} height={1024} value={showCert.certificate} />}
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
                  <Button className={styles.showQRButton} variant="secondary" onClick={() => setShowCert(v)}>Show certificate</Button>
                </div>
              )}
            </SwipableViews>
          }
        </Container>
        <AppTabbar />
    </AppContainer>
  )
}
