// eudgc does not seem to have correct typings even though its written in ts
declare module "eudgc" {
	declare global {
		interface Window {
			EuDgc_parse: (encodedData: string) => Promise<EuDgcCert>,
			EuDgc_validate: (encodedData: string) => Promise<CertInfo | null>
		}
	}
}
