import Image from 'next/image'
import Link from 'next/link'
import { Container } from 'react-bootstrap'
import AppContainer from '../components/AppContainer'
import AppNavbar from '../components/AppNavbar'
import AppTabbar from '../components/AppTabbar'
import styles from '../styles/vaccidex.module.css'
import useVaccimon from '../lib/repository-hook'

export default function Vaccidex() {
  const vaccimon = useVaccimon()

  return (
    <AppContainer>
      <AppNavbar title="Vaccidex" />
      <Container className={styles.previews}>
        {vaccimon && vaccimon.map((v, i) =>
          <Link key={v.id} href={`/card/${i}`} passHref>
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
