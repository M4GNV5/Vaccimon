import { IDBPDatabase, openDB, DBSchema } from 'idb'

const DB_NAME = 'vaccimon'
const CERT_STORE_NAME = 'certificates'

export interface VaccimonCert {
  id: string
  data: string
}

interface VaccimonSchema extends DBSchema {
  [CERT_STORE_NAME]: {
    key: string
    value: VaccimonCert
  }
}

export default class VaccimonRepo {
  db?: IDBPDatabase<VaccimonSchema>

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

  async getAllCerts (): Promise<VaccimonCert[]> {
    if (!this.db) {
      throw new Error('Repository not opened')
    }

    return await this.db.getAll(CERT_STORE_NAME)
  }

  async addCert (vaccimon: VaccimonCert): Promise<void> {
    if (!this.db) {
      throw new Error('Repository not opened')
    }

    await this.db.add(CERT_STORE_NAME, vaccimon)
  }

  async deleteCert (id: string): Promise<void> {
    if (!this.db) {
      throw new Error('Repository not opened')
    }

    await this.db.delete(CERT_STORE_NAME, id)
  }
}
