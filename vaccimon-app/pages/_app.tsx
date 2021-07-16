import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import '../styles/globals.css'
import type { AppProps } from 'next/app'

// workaround for this iOS 14.6 bug
// https://bugs.webkit.org/show_bug.cgi?id=226547
// eslint-disable-next-line no-unused-expressions
typeof window !== 'undefined' && window.indexedDB

function MyApp ({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
export default MyApp
