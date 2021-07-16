import { useMemo } from 'react'
import { useRouter } from 'next/router'

import { Container, ListGroup } from 'react-bootstrap'

import AppContainer from '../components/AppContainer'
import AppNavbar from '../components/AppNavbar'
import AppTabbar from '../components/AppTabbar'
import useVaccimon from '../lib/repository-hook'
import { achievements, calculateAchievements } from './achievements'

import styles from '../styles/index.module.css'

export default function Home () {
  const router = useRouter()
  const vaccimon = useVaccimon()
  const unlockedAchievements = useMemo(() => calculateAchievements(vaccimon), [vaccimon])

  return (
    <AppContainer>
      <AppNavbar title="Overview" />
      <Container>
        <br />
        <ListGroup>
          <ListGroup.Item action onClick={() => router.push('/vaccidex')}>
            <div className="float-end">
              {vaccimon.length}
            </div>
            <div>
              <b>Your Vaccidex</b><br />
              View all your catched Vaccímons and their Abilities
            </div>
          </ListGroup.Item>
        </ListGroup>
        <br />
        <ListGroup>
          <ListGroup.Item action onClick={() => router.push('/achievements')}>
            <div className="float-end">
              {`${unlockedAchievements.length} / ${achievements.length}`}
            </div>
            <div>
              <b>Your Achievements</b><br />
              View your achievement progress
            </div>
          </ListGroup.Item>
        </ListGroup>

        <div className={styles.disclaimer}>
          <b>Please remember: </b>
          This project is a parody and a fun way to show the downsides of
          permanent non-changing vaccination certificates.<br />
          This project is not associated with Nintendo, The Pokémon Company or
          any government.<br />
          This is a private fun project. You can find the source code on{' '}
          <a href="https://github.com/M4GNV5/Vaccimon/" target="_blank" rel="noreferrer">Github</a>
        </div>
      </Container>
      <AppTabbar />
    </AppContainer>
  )
}
