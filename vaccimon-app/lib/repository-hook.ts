import { useState, useEffect } from 'react'
import VaccimonRepo from './repository'
import { Vaccimon } from './vaccimon'

export default function useVaccimon (): Vaccimon[] {
  const [vaccimon, setVaccimon] = useState<Vaccimon[]>([])

  useEffect(() => {
    async function load () {
      const repo = new VaccimonRepo()
      try {
        await repo.open()
        const certs = await repo.getAllCerts()
        const vaccimon = await Promise.all(certs.map(x => Vaccimon.parse(x.data)))

        vaccimon.sort((a, b) => a.fullName.localeCompare(b.fullName))
        setVaccimon(vaccimon)
      } finally {
        await repo.close()
      }
    }
    load()
  }, [])

  return vaccimon
}
