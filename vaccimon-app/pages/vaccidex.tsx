import Image from 'next/image'
import Link from 'next/link'

import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'

import AppContainer from '../components/AppContainer'
import AppNavbar from '../components/AppNavbar'
import AppTabbar from '../components/AppTabbar'
import styles from '../styles/vaccidex.module.css'
import useVaccimon from '../lib/repository-hook'
import VaccimonRepo from '../lib/repository'

export default function Vaccidex () {
  const vaccimon = useVaccimon()

  async function exportVaccimon () {
    const repo = new VaccimonRepo()
    await repo.open()
    const data = await repo.getAllCerts()
    const text = JSON.stringify(data)

    navigator.clipboard.writeText(text)

    const elem = document.createElement('a')
    elem.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text))
    elem.setAttribute('download', 'vaccidex.json')

    elem.style.display = 'none'
    document.body.appendChild(elem)
    elem.click()
    document.body.removeChild(elem)
  }

  return (
    <AppContainer>
      <AppNavbar title="Vaccidex">
        <Button variant="primary" onClick={exportVaccimon}>Export Vaccidex</Button>
      </AppNavbar>
      <Container className={styles.previews}>
        {vaccimon && vaccimon.map(v =>
          <Link key={v.id} href={`/card#${v.id}`} passHref>
            <a className={styles.preview}>
              <Image src={v.avatarUrl} width={64} height={64} alt="" />
              <div className={styles.name}>
                {v.firstName.substring(0, 1)}. {v.lastName}
              </div>
            </a>
          </Link>
        )}
      </Container>
      <AppTabbar />
    </AppContainer>
  )
}
