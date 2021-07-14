import { IDBPDatabase, openDB, DBSchema } from 'idb'

const DB_NAME = 'vaccimon'
const CERT_STORE_NAME = 'certificates'

interface RepositorySchema extends DBSchema {
  [CERT_STORE_NAME]: {
    key: string
    value: VaccimonCert
  }
}

export interface VaccimonCert {
  id: string
  data: string
}

export default class VaccimonRepository {
  db?: IDBPDatabase<RepositorySchema>

  constructor () {
    if (typeof window === 'undefined') {
      throw new Error('Browser is required')
    }
  }

  async open (): Promise<void> {
    this.db = await openDB(DB_NAME, 1, {
      upgrade (db) {
        db.createObjectStore(CERT_STORE_NAME, { keyPath: 'id' })
      }
    })
  }

  close () {
    this.db?.close()
  }

  async getAllVaccimon (): Promise<VaccimonCert[]> {
    if (!this.db) {
      throw new Error('Repository not opened')
    }

    return await this.db.getAll(CERT_STORE_NAME)
  }

  async addVaccimon (vaccimon: VaccimonCert): Promise<void> {
    if (!this.db) {
      throw new Error('Repository not opened')
    }

    await this.db.add(CERT_STORE_NAME, vaccimon)
  }

  async deleteVaccimon (vaccimon: VaccimonCert): Promise<void> {
    if (!this.db) {
      throw new Error('Repository not opened')
    }

    await this.db.delete(CERT_STORE_NAME, vaccimon.id)
  }

}
