/* eslint-disable no-unused-vars */

import { useMemo, useState } from 'react'
import { Container, ListGroup, Modal } from 'react-bootstrap'
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
  filter: (vaccidex: Vaccimon[]) => Vaccimon[],
}

export const achievements: Achievement[] = [
  {
    name: 'Starter',
    description: 'Catch your first Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    filter: vaccidex => vaccidex
  },
  {
    name: 'Fully Vaccinated',
    description: 'Catch both levels of the same Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    filter: vaccidex => vaccidex.filter(x => vaccidex.some(y => x.personEquals(y)))
  },
  {
    name: 'BOOOOSTER',
    description: 'Catch a boosted Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    filter: vaccidex => vaccidex.filter(x => x.isBoostered)
  },
  {
    name: 'German Engineering',
    description: 'Catch your first Comirnaty Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    filter: vaccidex => vaccidex.filter(x => x.vaccine === 'Comirnaty')
  },
  {
    name: 'German Manufacturing',
    description: 'Catch at least 5 Comirnaty Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    filter: vaccidex => {
      const matches = vaccidex.filter(x => x.vaccine === 'Comirnaty')
      return matches.length >= 5 ? matches : []
    }
  },
  {
    name: 'Modörna',
    description: 'Catch your first Spikevax Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    filter: vaccidex => vaccidex.filter(x => x.vaccine === 'Spikevax')
  },
  {
    name: 'Operation Warp Speed',
    description: 'Catch at least 5 Spikevax Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    filter: vaccidex => {
      const matches = vaccidex.filter(x => x.vaccine === 'Spikevax')
      return matches.length >= 5 ? matches : []
    }
  },
  {
    name: 'Old peoples Vaccine',
    description: 'Catch your first Vaxzevria Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    filter: vaccidex => vaccidex.filter(x => x.vaccine === 'Vaxzevria')
  },
  {
    name: 'Sonderimpfaktion',
    description: 'Catch at least 5 Vaxzevria Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    filter: vaccidex => {
      const matches = vaccidex.filter(x => x.vaccine === 'Vaxzevria')
      return matches.length >= 5 ? matches : []
    }
  },
  {
    name: 'FREEDOM!',
    description: 'Catch your first Janssen Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    filter: vaccidex => vaccidex.filter(x => x.vaccine === 'COVID-19 Vaccine Janssen')
  },
  {
    name: 'Every second counts',
    description: 'Catch at least 5 Janssen Vaccímon',
    difficulty: AchievementDiffuculty.Easy,
    filter: vaccidex => {
      const matches = vaccidex.filter(x => x.vaccine === 'COVID-19 Vaccine Janssen')
      return matches.length >= 5 ? matches : []
    }
  },
  {
    name: 'Exportschlager',
    description: 'Scan at least 5 Comirnaty Vaccímon not from Germany',
    difficulty: AchievementDiffuculty.Easy,
    filter: vaccidex => {
      const matches = vaccidex.filter(x => x.vaccine === 'Comirnaty' && x.country !== 'DE')
      return matches.length >= 5 ? matches : []
    }
  },
  {
    name: 'Diversity',
    description: 'Catch Vaccímons with three different vaccines',
    difficulty: AchievementDiffuculty.Medium,
    filter: vaccidex => new Set(vaccidex.map(x => x.vaccine)).size >= 3 ? vaccidex : []
  },
  {
    name: 'Shorthand',
    description: 'Scan someone with a full name length of maximum 10 characters',
    difficulty: AchievementDiffuculty.Medium,
    filter: vaccidex => vaccidex.filter(x => x.fullName.length <= 10)
  },
  {
    name: 'Accuracte Description',
    description: 'Scan someone with a name containing at least four parts',
    difficulty: AchievementDiffuculty.Medium,
    filter: vaccidex => vaccidex.filter(x => x.fullName.replace(/-/g, ' ').split(' ').length >= 4)
  },
  {
    name: 'We are Family',
    description: 'Catch three or more Vaccímon with the same family name',
    difficulty: AchievementDiffuculty.Medium,
    filter: vaccidex => vaccidex.filter(x => vaccidex.filter(y => x.lastName === y.lastName).length >= 3)
  },
  {
    name: 'Family Gathering',
    description: 'Catch seven or more Vaccímon with the same family name',
    difficulty: AchievementDiffuculty.Medium,
    filter: vaccidex => vaccidex.filter(x => vaccidex.filter(y => x.lastName === y.lastName).length >= 7)
  },
  {
    name: 'This is Technology Test!',
    description: 'Catch a test Vaccímon',
    difficulty: AchievementDiffuculty.Medium,
    filter: vaccidex => vaccidex.filter(x => x.lastName.startsWith('Muster'))
  },
  {
    name: 'Is this digital?',
    description: 'Catch a Vaccímon older than 80 years',
    difficulty: AchievementDiffuculty.Medium,
    filter: vaccidex => {
      const old = new Date()
      old.setFullYear(old.getFullYear() - 80)
      return vaccidex.filter(x => x.dateOfBirth < old)
    }
  },
  {
    name: 'Beta Tester',
    description: 'Catch a certificate with vaccination date before March 2021',
    difficulty: AchievementDiffuculty.Medium,
    filter: vaccidex => vaccidex.filter(x => x.vaccinationDate < (new Date(2021, 3, 1)))
  },
  {
    name: 'Maeiyr',
    description: 'Catch three different versions of Meir',
    difficulty: AchievementDiffuculty.Hard,
    filter: vaccidex => {
      const reg = /m(a|e)(i|y)(a|e)?r$/ui
      const vaccimon = vaccidex.filter(x => reg.test(x.lastName))
      const unique = new Set(vaccimon
        .map(x => x.lastName.match(reg))
        .filter(x => x)
        .map(x => (x as RegExpMatchArray)[0])
      )

      return unique.size >= 3 ? vaccimon : []
    }
  },
  {
    name: 'Traveler',
    description: 'Catch Vaccímons from three different countries',
    difficulty: AchievementDiffuculty.Hard,
    filter: vaccidex => new Set(vaccidex.map(x => x.country)).size >= 3 ? vaccidex : []
  },
  {
    name: 'Super Spreader',
    description: 'Catch Vaccímons from five different countries',
    difficulty: AchievementDiffuculty.Hard,
    filter: vaccidex => new Set(vaccidex.map(x => x.country)).size >= 5 ? vaccidex : []
  },
  {
    name: 'Communism',
    description: 'Catch a vaccine from Russia or China',
    difficulty: AchievementDiffuculty.Hard,
    filter: vaccidex => vaccidex.filter(x => x.vaccine === 'CVnCoV' ||
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
    filter: vaccidex => vaccidex.filter(x =>
      vaccidex.some(y => x.personEquals(y) && x.vaccine !== y.vaccine)
    )
  },
  {
    name: 'Gotta catch them all',
    description: 'Catch a Vaccímon vaccinated with three or more different vaccines',
    difficulty: AchievementDiffuculty.Medium,
    filter: vaccidex => vaccidex.filter(x =>
      new Set(vaccidex.filter(y => x.personEquals(y)).map(y => y.vaccine)).size >= 3
    )
  },
  {
    name: 'Addict',
    description: 'Catch more than four certificates of the same Vaccímon',
    difficulty: AchievementDiffuculty.Hard,
    filter: vaccidex => vaccidex.filter(x =>
      vaccidex.filter(y => x.personEquals(y)).length >= 4
    )
  },
  {
    name: 'ZDF',
    description: 'Did you watch the ZDF Documentation?',
    difficulty: AchievementDiffuculty.Medium,
    filter: vaccidex => vaccidex.filter(x => x.fullName.split('').sort().join('') === ' -HKWacehilnrruz')
  },
  {
    name: 'Collector',
    description: 'Catch 10 Vaccímon',
    difficulty: AchievementDiffuculty.Medium,
    filter: vaccidex => vaccidex.length >= 10 ? vaccidex : []
  },
  {
    name: 'Addicted',
    description: 'Catch 100 Vaccímon',
    difficulty: AchievementDiffuculty.Hard,
    filter: vaccidex => vaccidex.length >= 100 ? vaccidex : []
  },
  {
    name: 'Gotta go fast',
    description: 'Catch two vaccinations with the minimal interval',
    difficulty: AchievementDiffuculty.Hard,
    filter: vaccidex => vaccidex.filter(x => vaccidex.some(y => x.personEquals(y) && x.vaccine === y.vaccine && (
      (x.fullName === 'Comirnaty' && Math.abs(x.vaccinationDate.getTime() - y.vaccinationDate.getTime()) <= 21 * 24 * 60 * 60 * 1000) ||
      (x.fullName === 'Spikevax' && Math.abs(x.vaccinationDate.getTime() - y.vaccinationDate.getTime()) <= 28 * 24 * 60 * 60 * 1000) ||
      (x.fullName === 'Vaxzevria' && Math.abs(x.vaccinationDate.getTime() - y.vaccinationDate.getTime()) <= 63 * 24 * 60 * 60 * 1000)
    )))
  },
  {
    name: 'Multilingual',
    description: 'Catch a Vaccímon with a non-latin name',
    difficulty: AchievementDiffuculty.Medium,
    filter: vaccidex => vaccidex.filter(x => !/[a-zA-Z]/.test(x.fullName))
  }
]

export function calculateAchievements (vaccidex: Vaccimon[]): Achievement[] {
  return achievements.filter(x => x.filter(vaccidex).length > 0)
}

export default function Home () {
  const vaccimon = useVaccimon()
  const unlockedAchievements = useMemo(() => calculateAchievements(vaccimon), [vaccimon])
  const [showDetailsOf, setShowDetailsOf] = useState<Achievement | null>(null)

  function renderAchievement (achievement: Achievement, achieved: boolean) {
    return (
      <ListGroup.Item
        key={achievement.name}
        disabled={!achieved}
        onClick={() => setShowDetailsOf(achievement)}
        action
      >
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

  function renderVaccimon (entry: Vaccimon) {
    return (
      <ListGroup.Item
        key={entry.id}
        href={`/card#${entry.id}`}
        action
      >
        <div className="float-end">
          {entry.vaccinationDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <div>
          <b>{entry.fullName}</b>
        </div>
      </ListGroup.Item>
    )
  }

  return (
    <AppContainer>
      <AppNavbar title="Achievements" />
      <Modal show={!!showDetailsOf} onHide={() => setShowDetailsOf(null)}>
        <Modal.Header closeButton>
          <Modal.Title>{showDetailsOf?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup variant="flush">
            {showDetailsOf && showDetailsOf.filter(vaccimon).map(renderVaccimon)}
          </ListGroup>
        </Modal.Body>
      </Modal>
      <Container>
        <ListGroup variant="flush">
          {unlockedAchievements.map(x => renderAchievement(x, true))}
          {achievements
            .filter(x => unlockedAchievements.indexOf(x) === -1)
            .map(x => renderAchievement(x, false))
          }
        </ListGroup>
      </Container>
      <AppTabbar />
    </AppContainer>
  )
}
