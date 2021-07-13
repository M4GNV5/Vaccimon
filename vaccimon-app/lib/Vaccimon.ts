import { EuDgc, EuDgcCert, EuDgcVaccincation } from 'eudgc'

// possible values of `mp` field
// see https://ec.europa.eu/health/sites/default/files/ehealth/docs/digital-green-value-sets_en.pdf
const vaccines: {[key: string]: string} = {
  "EU/1/20/1528": "Comirnaty",
  "EU/1/20/1507": "Spikevax",
  "EU/1/21/1529": "Vaxzevria",
  "EU/1/20/1525": "COVID-19 Vaccine Janssen",
  "CVnCoV": "CVnCoV",
  "NVX-CoV2373": "NVX-CoV2373",
  "Sputnik-V": "Sputnik V",
  "Convidecia": "Convidecia",
  "EpiVacCorona": "EpiVacCorona",
  "BBIBP-CorV": "BBIBP-CorV  Vaccine medicinal",
  "Inactivated-SARS-CoV-2-Vero-Cell": "Inactivated SARS-CoV-2 (Vero Cell)",
  "CoronaVac": "CoronaVac",
  "Covaxin": "Covaxin",
  "Covishield": "Covishield",
}

export default class Vaccimon {
  data: EuDgcCert
  lastVaccination: EuDgcVaccincation

  constructor(decoded: EuDgcCert) {
    this.data = decoded

    const sorted = [...this.data.v]
    sorted.sort((a, b) => a.dt.localeCompare(b.dt))
    this.lastVaccination = sorted[0]
  }

  async create(encoded: string): Promise<Vaccimon> {
    const data = await EuDgc.parse(encoded)
    return new Vaccimon(data)
  }

  getFullName(): string {
    return `${this.data.nam.fn} ${this.data.nam.gn}`
  }
  getFirstName(): string {
    return this.data.nam.fn
  }
  getLastName(): string {
    return this.data.nam.gn
  }

  getDateOfBirth(): Date {
    return new Date(this.data.dob)
  }

  getVaccine(): string {
    const key = this.lastVaccination.mp
    return vaccines[key] || key
  }
  getVaccinationDate(): Date {
    return new Date(this.lastVaccination.dt)
  }

  isFullyVaccinated(): boolean {
    return this.lastVaccination.sd === this.lastVaccination.dn
  }
}
