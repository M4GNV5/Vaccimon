import React from 'react'
import { useRouter } from 'next/router'
import { Nav, Navbar } from 'react-bootstrap'
import {
  faHome,
  faTh,
  faTrophy,
  faQrcode
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from '../styles/AppTabbar.module.css'

export default function AppTabbar () {
  const router = useRouter()

  return (
    <>
      <div className={styles.spacer} />

      <Navbar className={`${styles.navbar}`}>
        <Nav className={`${styles.nav} justify-content-around`}>
          <Nav.Item>
            <Nav.Link onClick={() => router.replace('/')} className={`${styles.tab} ${router.pathname === '/' && styles.tabActive}`}>
              <FontAwesomeIcon icon={faHome} className={styles.icon} />
              Dashboard
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link onClick={() => router.replace('/vaccidex')} className={`${styles.tab} ${router.pathname === '/vaccidex' && styles.tabActive}`}>
              <FontAwesomeIcon icon={faTh} className={styles.icon} />
              Vaccidex
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link onClick={() => router.replace('/achievements')} className={`${styles.tab} ${router.pathname === '/achievements' && styles.tabActive}`}>
              <FontAwesomeIcon icon={faTrophy} className={styles.icon} />
              Achievements
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link onClick={() => router.replace('/scan')} className={`${styles.tab} ${router.pathname === '/scan' && styles.tabActive}`}>
              <FontAwesomeIcon icon={faQrcode} className={styles.icon} />
              Scan
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Navbar>
    </>
  )
}
