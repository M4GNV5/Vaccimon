/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */

declare module 'eudgc' {
  // eudgc does not seem to have correct typings even though its written in ts
  // copied from ../node_modules/eudgc/src/eudgc.ts

  export interface EuDgcVaccincation {
    'ci': string; // "URN:UVCI:01DE/....."  Unique Certificate Identifier: UVCI
    'co': string; // "DE", vaccination number
    'dn': number; // 1, 2 ... number of dose
    'dt': string; // "2021-02-28", date of vaccination
    'is': string; // eg "Robert Koch-Institut", issuer
    'ma': string; // Marketing Authorization Holder - if no MAH present, then manufacturer
    'mp': string; // Vaccine medicinal product
    'sd': number; // Total Series of Doses
    'tg': string; // Disease or agent targeted
    'vp': string; // Vaccine or prophylaxis
  }

  export interface EuDgcCert {
    'v': EuDgcVaccincation[]; // an array of vaccinations, probably just 1 right now
    'dob': string; // date of birth "1970-01-31",
    'nam': {
      'fn': string; // familiy name
      'gn': string; // firstname
      'fnt': string; // fn in caps and without Umlauts
      'gnt': string; // gn in caps and without Umlauts
    };
    'ver': string; // "1.0.0" ?
  }

  declare global {
    interface Window {
      EuDgc_parse: (encodedData: string) => Promise<EuDgcCert>
    }
  }
}
