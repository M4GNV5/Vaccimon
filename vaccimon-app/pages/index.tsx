import { Container, Nav } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQrcode } from '@fortawesome/free-solid-svg-icons'
import AppContainer from '../components/AppContainer'
import AppNavbar from '../components/AppNavbar'
import AppTabbar from '../components/AppTabbar'

export default function Home() {
  return (
    <AppContainer>
      <AppNavbar title="Overview">
        <Nav.Link href="/scan">
          <FontAwesomeIcon icon={faQrcode} />
          {' '}
          Scan a Vaccimon
        </Nav.Link>
      </AppNavbar>
      <Container>
        Stuff
      </Container>
      <AppTabbar />
    </AppContainer>
  )
}
