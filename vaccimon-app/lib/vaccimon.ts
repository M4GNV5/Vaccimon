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
  "BBIBP-CorV": "BBIBP-CorV Vaccine medicinal",
  "Inactivated-SARS-CoV-2-Vero-Cell": "Inactivated SARS-CoV-2 (Vero Cell)",
  "CoronaVac": "CoronaVac",
  "Covaxin": "Covaxin",
  "Covishield": "Covishield",
}

const eyes = ["eyes1","eyes10","eyes2","eyes3","eyes4","eyes5","eyes6","eyes7","eyes9"]
const noses = ["nose2","nose3","nose4","nose5","nose6","nose7","nose8","nose9"]
const mouths = ["mouth1","mouth10","mouth11","mouth3","mouth5","mouth6","mouth7","mouth9"]
const colors: {[key: string]: string} = {
  "Comirnaty": "014c07",
  "Spikevax": "9e090b",
  "Vaxzevria": "5503bf",
  "COVID-19 Vaccine Janssen": "bfaf03",
}

export class Vaccimon {

  _cert: EuDgcCert
  _vaccinationNum: number

  constructor(cert: EuDgcCert, vaccination: number = 0) {
    this._cert = cert
    this._vaccinationNum = vaccination
  }

  static async parse (data: string, vaccination: number = 0) {
    const cert = await window.EuDgc_parse(data)
    return new Vaccimon(cert, vaccination)
  }

  private get _vaccination(): EuDgcVaccincation {
    return this._cert.v[this._vaccinationNum]
  }

  get id(): string {
    return this._vaccination.ci
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
    const key = this._vaccination.mp
    return vaccines[key] || key
  }

  get vaccinationDate(): Date {
    return new Date(this._vaccination.dt)
  }

  get country(): string {
    return this._vaccination.co
  }

  get avatarUrl(): string {
    const seed = this.id.substr(this.id.length - 4)
    const eye = seed.charCodeAt(0) % eyes.length
    const nose = seed.charCodeAt(1) % noses.length
    const mouth = seed.charCodeAt(2) % mouths.length
    const color = colors[this.vaccine] || 'ffffff'

    // TODO: use a self hosted image service
    // TODO: hash the id?
    return `https://api.hello-avatar.com/adorables/face/${eyes[eye]}/${noses[nose]}/${mouths[mouth]}/${color}/128`
  }

  get certificateSigner(): string {
    return this._vaccination.is
  }

  get isFullyVaccinated(): boolean {
    return this._vaccination.sd === this._vaccination.dn
  }
}
