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
        const vaccimon = (await Promise.all(certs.map(cert => {
          try {
            return Vaccimon.parse(cert.data)
          } catch (e) {
            console.error(e)
            return null
          }
        })))
          .filter((x): x is Vaccimon => !!x)
          .sort((a, b) => a.lastName.localeCompare(b.lastName))
        setVaccimon(vaccimon)
      } catch (e) {
        console.error(e)
        alert(e.message)
      } finally {
        await repo.close()
      }
    }
    load()
  }, [])

  return vaccimon
}
