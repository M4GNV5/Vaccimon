/* eslint-disable import/no-duplicates */
import { EuDgcCert, EuDgcVaccincation } from 'eudgc'
import 'eudgc' // required to load window.EuDgc_parse

// possible values of `mp` field
// see https://ec.europa.eu/health/sites/default/files/ehealth/docs/digital-green-value-sets_en.pdf
const vaccines: {[key: string]: string} = {
  'EU/1/20/1528': 'Comirnaty',
  'EU/1/20/1507': 'Spikevax',
  'EU/1/21/1529': 'Vaxzevria',
  'EU/1/20/1525': 'COVID-19 Vaccine Janssen',
  CVnCoV: 'CVnCoV',
  'NVX-CoV2373': 'NVX-CoV2373',
  'Sputnik-V': 'Sputnik V',
  Convidecia: 'Convidecia',
  EpiVacCorona: 'EpiVacCorona',
  'BBIBP-CorV': 'BBIBP-CorV Vaccine medicinal',
  'Inactivated-SARS-CoV-2-Vero-Cell': 'Inactivated SARS-CoV-2 (Vero Cell)',
  CoronaVac: 'CoronaVac',
  Covaxin: 'Covaxin',
  Covishield: 'Covishield'
}

const eyes = ['eyes1', 'eyes10', 'eyes2', 'eyes3', 'eyes4', 'eyes5', 'eyes6', 'eyes7', 'eyes9']
const noses = ['nose2', 'nose3', 'nose4', 'nose5', 'nose6', 'nose7', 'nose8', 'nose9']
const mouths = ['mouth1', 'mouth10', 'mouth11', 'mouth3', 'mouth5', 'mouth6', 'mouth7', 'mouth9']
const colors: {[key: string]: string} = {
  Comirnaty: '89F59B',
  Spikevax: 'F5899F',
  Vaxzevria: 'BAC6F5',
  'COVID-19 Vaccine Janssen': 'F5DC95'
}

function assert (condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message)
  }
}

/**
 * Fixes uppercase names
 * e.g. JOHN DOE -> John Doe
 */
function fixCapsLock (str: string): string {
  if (str === str.toUpperCase()) {
    return str.replace(/[^ -]+/g, x => x.substr(0, 1) + x.substr(1).toLowerCase())
  } else {
    return str
  }
}

function genRandoms (count: number, seed: number): number[] {
  const result = []
  let curr = seed
  for (let i = 0; i < count; i++) {
    curr = (curr * 214013 + 2531011) % 32768
    result.push(curr)
  }

  return result
}

export class Vaccimon {
  _rawCert: string
  _cert: EuDgcCert
  _vaccinationNum: number

  constructor (rawCert: string, cert: EuDgcCert, vaccination: number = 0) {
    this._rawCert = rawCert
    this._cert = cert
    this._vaccinationNum = vaccination

    assert(!!this._cert.nam, 'Certificate does not contain a name')
    assert(!!this._cert.v && this._cert.v.length > 0, 'Certificate does not contain a vaccination')
  }

  static async parse (data: string, vaccination: number = 0, validate: boolean = false) {
    try {
      assert(!validate || !!await window.EuDgc_validate(data), 'Signature is invalid')
    } catch (e: any) {
      throw new Error(`Failed to validate certificate (${e?.message || e})`)
    }
    const cert = await window.EuDgc_parse(data)
    return new Vaccimon(data, cert, vaccination)
  }

  private get _vaccination (): EuDgcVaccincation {
    return this._cert.v[this._vaccinationNum]
  }

  get certificate (): string {
    return this._rawCert
  }

  get id (): string {
    return this._vaccination.ci
  }

  get firstName (): string {
    return fixCapsLock(this._cert.nam.gn)
  }

  get lastName (): string {
    return fixCapsLock(this._cert.nam.fn)
  }

  get fullName (): string {
    return `${this.firstName} ${this.lastName}`
  }

  get dateOfBirth (): Date {
    return new Date(this._cert.dob)
  }

  get vaccine (): string {
    const key = this._vaccination.mp
    return vaccines[key] || key
  }

  get vaccinationDate (): Date {
    return new Date(this._vaccination.dt)
  }

  get level (): number {
    const immune = new Date()
    immune.setDate(immune.getDate() - 14)

    if (!this.isFullyVaccinated) {
      return 1
    } else if (this.isBoostered && this.vaccinationDate > immune) {
      return 3
    } else if (this.isBoostered) {
      return 4
    } else if (this.vaccinationDate > immune) {
      return 2
    } else {
      return 3
    }
  }

  get country (): string {
    return this._vaccination.co
  }

  get avatarUrl (): string {
    const seed = this.id
      .split('')
      .map(x => x.charCodeAt(0))
      .reduce((a, b) => a + b)

    const [eyeR, noseR, mouthR] = genRandoms(3, seed)
    const eye = eyes[eyeR % eyes.length]
    const nose = noses[noseR % noses.length]
    const mouth = mouths[mouthR % mouths.length]
    const color = colors[this.vaccine] || 'ffffff'

    return `https://adorable-avatars.broken.services/face/${eye}/${nose}/${mouth}/${color}/256`
  }

  get certificateSigner (): string {
    return this._vaccination.is
  }

  get isFullyVaccinated (): boolean {
    return this._vaccination.sd === this._vaccination.dn
  }

  get isBoostered (): boolean {
    return this._vaccination.sd >= 3
  }
}
