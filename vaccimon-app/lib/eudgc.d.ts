declare module "eudgc" {
	// XXX: eudgc does not seem to have correct typings even though its written in ts
	import { EuDgcCert, EuDgcVaccincation } from 'eudgc/src/eudgc'
	
	export type EuDgcCert = EuDgcCert
	export type EuDgcVaccincation = EuDgcVaccincation

	declare global {
		interface Window {
			EuDgc_parse: (encodedData: string) => Promise<EuDgcCert>,
			EuDgc_validate: (encodedData: string) => Promise<CertInfo | null>
		}
	}
}
