declare module "eudgc" {
	// XXX: eudgc does not seem to have correct typings even though its written in ts
	import { EuDgc, EuDgcCert, EuDgcVaccincation } from '../node_modules/eudgc/src/eudgc'
	
	export const EuDgc = EuDgc
	export type EuDgcCert = EuDgcCert
	export type EuDgcVaccincation = EuDgcVaccincation
}
