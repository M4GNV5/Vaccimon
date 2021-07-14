import { EuDgcCert, EuDgcVaccincation } from 'eudgc'
import 'eudgc' // required to load window.EuDgc_parse

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

export class Vaccimon {

  _id: string
  _cert: EuDgcCert
  _vaccination: number

  constructor(id: string, cert: EuDgcCert, vaccination: number = 0) {
    this._id = id
    this._cert = cert
    this._vaccination = vaccination
  }

  static async parse (data: string, vaccination: number = 0) {
    if (!data.startsWith('HC1:')) {
      throw new Error('Invalid certificate')
    }
    const cert = await window.EuDgc_parse(data)
    return new Vaccimon(cert.v[vaccination].ci, cert)
  }

  get id(): string {
    return this._id
  }

  get firstName(): string {
    return this._cert.nam.gn
  }

  get lastName(): string {
    return this._cert.nam.fn
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  get dateOfBirth(): Date {
    return new Date(this._cert.dob)
  }

  get vaccine(): string {
    const key = this._cert.v[this._vaccination].mp
    return vaccines[key] || key
  }

  get vaccinationDate(): Date {
    return new Date(this._cert.v[this._vaccination].dt)
  }

  get isFullyVaccinated(): boolean {
    return this._cert.v[this._vaccination].sd === this._cert.v[this._vaccination].dn
  }

}
