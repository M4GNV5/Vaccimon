import { useMemo } from 'react'

import { Container, Card, CardGroup } from 'react-bootstrap'

import AppContainer from '../components/AppContainer'
import AppNavbar from '../components/AppNavbar'
import AppTabbar from '../components/AppTabbar'
import useVaccimon from '../lib/repository-hook'
import { achievements, calculateAchievements } from './achievements'

import styles from '../styles/index.module.css'
import Link from 'next/link'

export default function Home () {
  const vaccimon = useVaccimon()
  const unlockedAchievements = useMemo(() => calculateAchievements(vaccimon), [vaccimon])

  return (
    <AppContainer>
      <AppNavbar title="Vaccímon" />
      <Container>
        <CardGroup className={styles.cardGroup}>
          <Link href="/vaccidex">
            <Card className={styles.card}>
              <Card.Body>
                <Card.Title>
                  Vaccimon
                </Card.Title>
                <Card.Text className={styles.cardText}>
                  {vaccimon.length}
                </Card.Text>
              </Card.Body>
            </Card>
          </Link>
          <Link href="/achievements">
            <Card className={styles.card}>
              <Card.Body>
                <Card.Title>
                Achievements
                </Card.Title>
                <Card.Text className={styles.cardText}>
                  {`${unlockedAchievements.length} / ${achievements.length}`}
                </Card.Text>
              </Card.Body>
            </Card>
          </Link>
          <Link href="/scan">
            <Card className={styles.card}>
              <Card.Body>
                <Card.Title>
                Scan
                </Card.Title>
              </Card.Body>
            </Card>
          </Link>
          <Link href="/fight">
            <Card className={styles.card}>
              <Card.Body>
                <Card.Title>
                Fight
                </Card.Title>
              </Card.Body>
            </Card>
          </Link>
        </CardGroup>

        <Container>
          <p>
            Using this app you can scan <strong>EU Vaccination certificates</strong>. Each one gets an adorable face and a collector card.
          </p>
          <p>
            The more Vaccímons you catch the stronger all of them get. <strong>Trade</strong> with your friends or challenge them on a <strong>fight</strong>!
          </p>
          <br />
          <p>
            This project is a <strong>parody</strong> and a fun way to show the downsides of permanent non-changing vaccination certificates.
            It is <strong>not</strong> associated with Nintendo, The Pokémon Company or any government entity.
          </p>
          <p>
            You can find the source code on{' '}
            <a href="https://github.com/M4GNV5/Vaccimon/" target="_blank" rel="noreferrer">GitHub</a>.
          </p>
        </Container>
      </Container>
      <AppTabbar />
    </AppContainer>
  )
}
