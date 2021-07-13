import Head from 'next/head'
import Link from 'next/link'
import { Button, Container } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQrcode } from '@fortawesome/free-solid-svg-icons'

export default function Home() {
  return (
    <>
      <Head>
        <title>Vaccímon</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <h1>Vaccimon</h1>
        <Link href="/scan" passHref>
          <Button>
            <FontAwesomeIcon icon={faQrcode} />
            {' '}
            Scan a new Vaccimon
          </Button>
        </Link>
      </Container>
    </>
  )
}
