import { useState, useEffect } from 'react'
import { Container, ListGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import VaccimonRepo from '../lib/repository'
import { Vaccimon } from '../lib/vaccimon'
import AppContainer from '../components/AppContainer'
import AppNavbar from '../components/AppNavbar'
import AppTabbar from '../components/AppTabbar'

export enum AchievementDiffuculty {
  Easy,
  Medium,
  Hard,
}
export type Achievement = {
  name: string,
  description: string,
  difficulty: AchievementDiffuculty,
  condition: (vaccidex: Vaccimon[]) => boolean,
}

export const achievements: Achievement[] = [
  {
    name: 'Starter',
    description: 'Catch your first Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.length > 0,
  },
  {
    name: 'German Engineering',
    description: 'Catch your first Comirnaty Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => !!vaccidex.find(x => x.vaccine === 'Comirnaty'),
  },
  {
    name: 'Modörna',
    description: 'Catch your first Spikevax Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => !!vaccidex.find(x => x.vaccine === 'Spikevax'),
  },
  {
    name: 'Old peoples Vaccine',
    description: 'Catch your first Vaxzevria Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => !!vaccidex.find(x => x.vaccine === 'Vaxzevria'),
  },
  {
    name: 'FREEDOM!',
    description: 'Catch your first Janssen Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => !!vaccidex.find(x => x.vaccine === 'Janssen'),
  },
  {
    name: 'We are Family',
    description: 'Catch three or more Vaccímon with the same family name',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => !!vaccidex.find(x => vaccidex.filter(y => x.lastName === y.lastName).length > 2),
  },
  {
    name: 'This is Technology Test!',
    description: 'Scan a test Vaccímon',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => !!vaccidex.find(x => x.lastName === 'Mustermann'),
  },
  {
    name: 'ZDF',
    description: 'Did you watch the ZDF Documentation?',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => !!vaccidex.find(x => x.fullName.split('').sort().join('') === ' -HKWacehilnrruz'),
  },
  {
    name: 'Collector',
    description: 'Catch 10 Vaccímon',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => vaccidex.length >= 10,
  },
  {
    name: 'Addicted',
    description: 'Catch 100 Vaccímon',
    difficulty: AchievementDiffuculty.Hard,
    condition: vaccidex => vaccidex.length >= 100,
  },
  {
    name: 'Maeiyr',
    description: 'Scan three different versions of Meir',
    difficulty: AchievementDiffuculty.Hard,
    condition: vaccidex => new Set(vaccidex
        .map(x => x.lastName.match(/m(a|e)(i|y)(a|e)?r$/ui))
        .filter(x => x)
        .map(x => (x as RegExpMatchArray)[0])
      ).size >= 3,
  },
]

export function calculateAchievements(vaccidex: Vaccimon[]): Achievement[] {
  return achievements.filter(x => x.condition(vaccidex))
}

export async function getAchievements(): Promise<Achievement[]> {
  const repo = new VaccimonRepo()
  try {
    await repo.open()
    const certs = await repo.getAllCerts()
    const vaccidex = await Promise.all(certs.map(x => Vaccimon.parse(x.data)))
    return calculateAchievements(vaccidex)
  } finally {
    await repo.close()
  }

}

export default function Home() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    async function load() {
      const result = await getAchievements()
      console.log(result)
      setUnlockedAchievements(result)
    }
    load()
  }, [])

  function renderAchievement(achievement: Achievement, achieved: boolean) {
    return (
      <ListGroup.Item key={achievement.name} disabled={!achieved}>
        <div className="float-start">
          <b>{achievement.name}</b><br />
          {achievement.description}
        </div>
        <div className="float-end">
          {achieved && <FontAwesomeIcon icon={faCheck} />}
        </div>
      </ListGroup.Item>
    )
  }

  return (
    <AppContainer>
      <AppNavbar title="Achievements" />
      <Container>
        <ListGroup variant="flush">
          {unlockedAchievements.map(x => renderAchievement(x, true))}
          {achievements.filter(x => unlockedAchievements.indexOf(x) === -1).map(x => renderAchievement(x, false))}
        </ListGroup>
      </Container>
      <AppTabbar />
    </AppContainer>
  )
}
