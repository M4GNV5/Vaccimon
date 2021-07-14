import { IDBPDatabase, openDB, DBSchema } from 'idb'
import Vaccimon from './Vaccimon'

const DB_NAME = 'vaccimon'
const CERT_STORE_NAME = 'vaccimon'

interface RepositorySchema extends DBSchema {
  [CERT_STORE_NAME]: {
    key: string
    value: Vaccimon
  }
}

export default class Repository {
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

  async getAllVaccimon (): Promise<Vaccimon[]> {
    if (!this.db) {
      throw new Error('Repository not opened')
    }

    return await this.db.getAll(CERT_STORE_NAME)
  }

  async addVaccimon (vaccimon: Vaccimon): Promise<void> {
    if (!this.db) {
      throw new Error('Repository not opened')
    }

    await this.db.add(CERT_STORE_NAME, vaccimon)
  }

  async deleteVaccimon (vaccimon: Vaccimon): Promise<void> {
    if (!this.db) {
      throw new Error('Repository not opened')
    }

    await this.db.delete(CERT_STORE_NAME, vaccimon.id)
  }

}
