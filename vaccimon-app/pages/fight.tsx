import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'

import { Container, ListGroup } from 'react-bootstrap'

import AppContainer from '../components/AppContainer'
import AppNavbar from '../components/AppNavbar'
import AppTabbar from '../components/AppTabbar'
import QRCodeCanvas from '../components/QRCodeCanvas'
import useVaccimon from '../lib/repository-hook'
import { Vaccimon } from '../lib/vaccimon'

import styles from '../styles/fight.module.css'

export default function Fight () {
  const router = useRouter()
  const vaccimon = useVaccimon()
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null)
  const [cryptoIv, setCryptoIv] = useState<Uint8Array | null>(null)
  const [keyStr, setKeyStr] = useState<string>()

  // XXX use key/iv to shut up eslint
  console.log(cryptoKey, cryptoIv)

  const formatNum = (new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })).format

  useEffect(() => {
    async function loadKeys () {
      const [base64Key, base64Iv] = window.location.hash.substr(1).split('&')
      const rawKey = new Uint8Array(atob(base64Key).split('').map(x => x.charCodeAt(0)))
      const iv = new Uint8Array(atob(base64Iv).split('').map(x => x.charCodeAt(0)))

      const key = await window.crypto.subtle.importKey('raw', rawKey, 'AES-GCM', true, ['encrypt', 'decrypt'])
      setCryptoKey(key)
      setCryptoIv(iv)
    }
    async function generateKeys () {
      const iv = window.crypto.getRandomValues(new Uint8Array(12))
      const key = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      )
      setCryptoKey(key)
      setCryptoIv(iv)

      const rawKey = await window.crypto.subtle.exportKey('raw', key)
      const base64Key = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(rawKey))))
      const base64Iv = btoa(String.fromCharCode.apply(null, Array.from(iv)))
      setKeyStr(`${base64Key}&${base64Iv}`)
    }

    if (window.location.hash) {
      loadKeys()
    } else {
      generateKeys()
    }
  }, [])

  const calculateStrength = useCallback(function (v: Vaccimon): number {
    // base strength based on level
    let strength = [0.3, 0.6, 1][v.level - 1]

    // bonus for other vaccimon with same family name
    const family = new Set(vaccimon.filter(x => x.lastName === v.lastName).map(x => x.fullName))
    strength *= Math.sqrt(family.size)

    // bonus for other vaccimon with same color
    const sameColor = new Set(vaccimon.filter(x => x.vaccine === v.vaccine).map(x => x.fullName))
    strength *= Math.sqrt(Math.sqrt(sameColor.size))

    // age bonus
    const age = (new Date()).getFullYear() - v.dateOfBirth.getFullYear()
    if (age < 14) {
      strength *= 0.6
    } else if (age < 18) {
      strength *= 0.8
    } else if (age < 30) {
      strength *= 1.3
    } else if (age < 60) {
      strength *= 1
    } else {
      strength *= 0.7
    }

    // TODO early adopter bonus?

    return strength
  }, [vaccimon])
  function calculateStrengthsOf (check: string | ((v: Vaccimon) => boolean)) {
    return vaccimon
      .filter(x => typeof check === 'string' ? x.vaccine === check : check(x))
      .map(x => calculateStrength(x))
      .reduce((a, b) => a + b, 0)
  }

  const topList = useMemo(() => {
    const dup = vaccimon.slice(0)
    dup.sort((a, b) => calculateStrength(b) - calculateStrength(a))

    return dup
  }, [vaccimon, calculateStrength])

  function renderLobby () {
    return (
      <AppContainer>
          <AppNavbar title="Fight Lobby" />
          <Container>
            <h3>Your strenghts</h3>
            <ListGroup>
              <ListGroup.Item>
                <span className={styles.vaccine}>Green Vaccímon</span>
                <span className={styles.strength}>{formatNum(calculateStrengthsOf('Comirnaty'))}</span>
              </ListGroup.Item>
              <ListGroup.Item>
                <span className={styles.vaccine}>Red Vaccímon</span>
                <span className={styles.strength}>{formatNum(calculateStrengthsOf('Spikevax'))}</span>
              </ListGroup.Item>
              <ListGroup.Item>
                <span className={styles.vaccine}>Blue Vaccímon</span>
                <span className={styles.strength}>{formatNum(calculateStrengthsOf('Vaxzevria'))}</span>
              </ListGroup.Item>
              <ListGroup.Item>
                <span className={styles.vaccine}>Yellow Vaccímon</span>
                <span className={styles.strength}>{formatNum(calculateStrengthsOf('COVID-19 Vaccine Janssen'))}</span>
              </ListGroup.Item>
              <ListGroup.Item>
                <span className={styles.vaccine}>White Vaccímon</span>
                <span className={styles.strength}>{formatNum(10 * calculateStrengthsOf(v => !['Comirnaty', 'Spikevax', 'Vaxzevria', 'COVID-19 Vaccine Janssen'].includes(v.vaccine)))}</span>
              </ListGroup.Item>
            </ListGroup>

            <h3 className={styles.heading}>Your top Vaccímon</h3>
            <ListGroup>
              {topList.slice(0, 5).map((v, i) =>
                <ListGroup.Item key={i} action onClick={() => router.push(`/card#${v.id}`)}>
                  <span className={styles.vaccine}>{v.fullName}</span>
                  <span className={styles.strength}>{formatNum(calculateStrength(v))}</span>
                </ListGroup.Item>
              )}
            </ListGroup>

            <h3 className={styles.heading}>QR Code</h3>
            {!keyStr && <p>No encryption key generated yet...</p>}
            {keyStr && <a className={styles.matchLink} href={`https://vaccimon.app/fight#${keyStr}`} target="_black" rel="noopener">
              <QRCodeCanvas className={styles.qrCode} width={1024} height={1024} value={`https://vaccimon.app/fight#${keyStr}`} />
            </a>}

            <h3 className={styles.heading}>Explanation</h3>
            <p>Let your opponent scan the above QR code to start an encrypted fight.</p>

            <p>You will take turns in attacking each other using your Vaccímons. Vaccímon have different abilities
            based on their color and different strengths based on their level and how many Vaccímon of the same
            color you have in your Vaccídex.</p>
          </Container>
          <AppTabbar />
      </AppContainer>
    )
  }

  return renderLobby()
}
