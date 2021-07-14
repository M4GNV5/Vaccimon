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

  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  vaccination: EuDgcVaccincation

  constructor(cert: EuDgcCert, vaccination: number = 0) {
    this.id = cert.v[vaccination].ci
    this.firstName = cert.nam.fn
    this.lastName = cert.nam.gn
    this.dateOfBirth = new Date(cert.dob)
    this.vaccination = cert.v[vaccination]
  }

  async create(encoded: string): Promise<Vaccimon> {
    const data = await EuDgc.parse(encoded)
    return new Vaccimon(data)
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  getFirstName(): string {
    return this.firstName
  }

  getLastName(): string {
    return this.lastName
  }

  getDateOfBirth(): Date {
    return new Date(this.dateOfBirth)
  }

  getVaccine(): string {
    const key = this.vaccination.mp
    return vaccines[key] || key
  }

  getVaccinationDate(): Date {
    return new Date(this.vaccination.dt)
  }

  isFullyVaccinated(): boolean {
    return this.vaccination.sd === this.vaccination.dn
  }

}
