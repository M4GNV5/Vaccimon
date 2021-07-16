/* eslint-disable no-unused-vars */

import { useMemo } from 'react'
import { Container, ListGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import AppContainer from '../components/AppContainer'
import AppNavbar from '../components/AppNavbar'
import AppTabbar from '../components/AppTabbar'
import { Vaccimon } from '../lib/vaccimon'
import useVaccimon from '../lib/repository-hook'

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
    condition: vaccidex => vaccidex.length > 0
  },
  {
    name: 'Fully Vaccinated',
    description: 'Catch both levels of the same Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.some(x => vaccidex.some(y => x.fullName === y.fullName))
  },
  {
    name: 'German Engineering',
    description: 'Catch your first Comirnaty Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.some(x => x.vaccine === 'Comirnaty')
  },
  {
    name: 'German Manufacturing',
    description: 'Catch at least 5 Comirnaty Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.filter(x => x.vaccine === 'Comirnaty').length >= 5
  },
  {
    name: 'Modörna',
    description: 'Catch your first Spikevax Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.some(x => x.vaccine === 'Spikevax')
  },
  {
    name: 'Operation Warp Speed',
    description: 'Catch at least 5 Spikevax Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.filter(x => x.vaccine === 'Spikevax').length >= 5
  },
  {
    name: 'Old peoples Vaccine',
    description: 'Catch your first Vaxzevria Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.some(x => x.vaccine === 'Vaxzevria')
  },
  {
    name: 'Sonderimpfaktion',
    description: 'Catch at least 5 Vaxzevria Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.filter(x => x.vaccine === 'Vaxzevria').length >= 5
  },
  {
    name: 'FREEDOM!',
    description: 'Catch your first Janssen Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.some(x => x.vaccine === 'COVID-19 Vaccine Janssen')
  },
  {
    name: 'Every second counts',
    description: 'Catch at least 5 Janssen Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.filter(x => x.vaccine === 'COVID-19 Vaccine Janssen').length >= 5
  },
  {
    name: 'Exportschlager',
    description: 'Scan at least 5 Comirnaty Vaccímon not from Germany',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.filter(x => x.vaccine === 'Comirnaty' && x.country !== 'DE').length >= 5
  },
  {
    name: 'Diversity',
    description: 'Catch Vaccímons with three different vaccines',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => new Set(vaccidex.map(x => x.vaccine)).size >= 3,
  },
  {
    name: 'Shorthand',
    description: 'Scan someone with a full name length of maximum 8 characters',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => vaccidex.some(x => x.fullName.length <= 8),
  },
  {
    name: 'Accuracte Description',
    description: 'Scan someone with a name containing at least four parts',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => vaccidex.some(x => x.fullName.replace('-', ' ').split(' ').length >= 4),
  },
  {
    name: 'We are Family',
    description: 'Catch three or more Vaccímon with the same family name',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => vaccidex.some(x => vaccidex.filter(y => x.lastName === y.lastName).length >= 3)
  },
  {
    name: 'This is Technology Test!',
    description: 'Catch a test Vaccímon',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => vaccidex.some(x => x.lastName === 'Mustermann')
  },
  {
    name: 'Is this digital?',
    description: 'Catch a Vaccímon older than 80 years',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => {
      const old = new Date()
      old.setFullYear(old.getFullYear() - 80)
      return vaccidex.some(x => x.dateOfBirth < old)
    }
  },
  {
    name: 'Beta Tester',
    description: 'Catch a certificate with vaccination date before April 2021',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => vaccidex.some(x => x.vaccinationDate < (new Date(2021, 3, 1)))
  },
  {
    name: 'Maeiyr',
    description: 'Catch three different versions of Meir',
    difficulty: AchievementDiffuculty.Hard,
    condition: vaccidex => new Set(vaccidex
      .map(x => x.lastName.match(/m(a|e)(i|y)(a|e)?r$/ui))
      .filter(x => x)
      .map(x => (x as RegExpMatchArray)[0])
    ).size >= 3
  },
  {
    name: 'Traveler',
    description: 'Catch Vaccímons from three different countries',
    difficulty: AchievementDiffuculty.Hard,
    condition: vaccidex => new Set(vaccidex.map(x => x.certificateSigner)).size >= 3
  },
  {
    name: 'Super Spreader',
    description: 'Catch Vaccímons from five different countries',
    difficulty: AchievementDiffuculty.Hard,
    condition: vaccidex => new Set(vaccidex.map(x => x.certificateSigner)).size >= 5
  },
  {
    name: 'Communism',
    description: 'Catch a vaccine from Russia or China',
    difficulty: AchievementDiffuculty.Hard,
    condition: vaccidex => !!vaccidex.find(x => x.vaccine === 'CVnCoV' ||
      x.vaccine === 'Sputnik V' ||
      x.vaccine === 'EpiVacCorona' ||
      x.vaccine === 'BBIBP-CorV Vaccine medicinal' ||
      x.vaccine === 'CoronaVac'
    )
  },
  {
    name: 'Wait never mind',
    description: 'Catch a Vaccímon with mixed vaccines',
    difficulty: AchievementDiffuculty.Easy,
    condition: vaccidex => vaccidex.some(x => vaccidex.some(y => x.fullName === y.fullName && x.vaccine !== y.vaccine))
  },
  {
    name: 'ZDF',
    description: 'Did you watch the ZDF Documentation?',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => vaccidex.some(x => x.fullName.split('').sort().join('') === ' -HKWacehilnrruz')
  },
  {
    name: 'Collector',
    description: 'Catch 10 Vaccímon',
    difficulty: AchievementDiffuculty.Medium,
    condition: vaccidex => vaccidex.length >= 10
  },
  {
    name: 'Addicted',
    description: 'Catch 100 Vaccímon',
    difficulty: AchievementDiffuculty.Hard,
    condition: vaccidex => vaccidex.length >= 100
  },
  {
    name: 'Gotta go fast',
    description: 'Catch two vaccinations with the minimal interval',
    difficulty: AchievementDiffuculty.Hard,
    condition: vaccidex => vaccidex.some(x => vaccidex.some(y => x.fullName === y.fullName && x.vaccine === y.vaccine && (
      (x.fullName === 'Comirnaty' && Math.abs(x.vaccinationDate.getTime() - y.vaccinationDate.getTime()) <= 21 * 24 * 60 * 60 * 1000) ||
      (x.fullName === 'Spikevax' && Math.abs(x.vaccinationDate.getTime() - y.vaccinationDate.getTime()) <= 28 * 24 * 60 * 60 * 1000) ||
      (x.fullName === 'Vaxzevria' && Math.abs(x.vaccinationDate.getTime() - y.vaccinationDate.getTime()) <= 63 * 24 * 60 * 60 * 1000)
    )))
  }
]

export function calculateAchievements (vaccidex: Vaccimon[]): Achievement[] {
  return achievements.filter(x => x.condition(vaccidex))
}

export default function Home () {
  const vaccimon = useVaccimon()
  const unlockedAchievements = useMemo(() => calculateAchievements(vaccimon), [vaccimon])

  function renderAchievement (achievement: Achievement, achieved: boolean) {
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
