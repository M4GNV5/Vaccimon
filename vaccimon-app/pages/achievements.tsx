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
    name: 'Fully Vaccinated',
    description: 'Catch both levels of the same Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.some(x => vaccidex.some(y => x.fullName === y.fullName)),
  },
  {
    name: 'German Engineering',
    description: 'Catch your first Comirnaty Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.some(x => x.vaccine === 'Comirnaty'),
  },
  {
    name: 'Modörna',
    description: 'Catch your first Spikevax Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.some(x => x.vaccine === 'Spikevax'),
  },
  {
    name: 'Old peoples Vaccine',
    description: 'Catch your first Vaxzevria Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.some(x => x.vaccine === 'Vaxzevria'),
  },
  {
    name: 'FREEDOM!',
    description: 'Catch your first Janssen Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.some(x => x.vaccine === 'COVID-19 Vaccine Janssen'),
  },
  {
    name: 'We are Family',
    description: 'Catch three or more Vaccímon with the same family name',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => vaccidex.some(x => vaccidex.filter(y => x.lastName === y.lastName).length > 2),
  },
  {
    name: 'This is Technology Test!',
    description: 'Catch a test Vaccímon',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => vaccidex.some(x => x.lastName === 'Mustermann'),
  },
  {
    name: 'Is this digital?',
    description: 'Catch a Vaccímon older than 80 years',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => {
      const old = new Date()
      old.setFullYear(old.getFullYear() - 80)
      return vaccidex.some(x => x.dateOfBirth < old)
    },
  },
  {
    name: 'Beta Tester',
    description: 'Catch a certificate with vaccination date before April 2021',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => vaccidex.some(x => x.vaccinationDate < (new Date(2021, 4, 1))),
  },
  {
    name: 'Maeiyr',
    description: 'Catch three different versions of Meir',
    difficulty: AchievementDiffuculty.Hard,
    condition: vaccidex => new Set(vaccidex
        .map(x => x.lastName.match(/m(a|e)(i|y)(a|e)?r$/ui))
        .filter(x => x)
        .map(x => (x as RegExpMatchArray)[0])
      ).size >= 3,
  },
  {
    name: 'Traveler',
    description: 'Catch Vaccímons from three different countries',
    difficulty: AchievementDiffuculty.Hard,
    condition: vaccidex => new Set(vaccidex.map(x => x.certificateSigner)).size >= 3,
  },
  {
    name: 'Super Spreader',
    description: 'Catch Vaccímons from five different countries',
    difficulty: AchievementDiffuculty.Hard,
    condition: vaccidex => new Set(vaccidex.map(x => x.certificateSigner)).size >= 5,
  },
  {
    name: 'Communism',
    description: 'Catch a vaccine from Russia or China',
    difficulty: AchievementDiffuculty.Hard,
    condition: vaccidex => !!vaccidex.find(x => x.vaccine === 'CVnCoV'
      || x.vaccine === 'Sputnik V'
      || x.vaccine === 'EpiVacCorona'
      || x.vaccine === 'BBIBP-CorV Vaccine medicinal'
      || x.vaccine === 'CoronaVac'
    ),
  },
  {
    name: 'Wait never mind',
    description: 'Catch a Vaccímon with mixed vaccines',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.some(x => vaccidex.some(y => x.fullName === y.fullName && x.vaccine !== y.vaccine)),
  },
  {
    name: 'ZDF',
    description: 'Did you watch the ZDF Documentation?',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => vaccidex.some(x => x.fullName.split('').sort().join('') === ' -HKWacehilnrruz'),
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
        <div className="float-end">
          {achieved && <FontAwesomeIcon icon={faCheck} />}
        </div>
        <div>
          <b>{achievement.name}</b><br />
          {achievement.description}
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
