import React, { createContext } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Container, Navbar } from 'react-bootstrap'
import styles from '../styles/AppNavbar.module.css'

export const ThemeContext = createContext('default')

interface AppNavbarProps {
  title: string
  children?: any
}

export default function AppNavbar ({ title, children }: AppNavbarProps) {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>{title}</title>

        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/favicon512.png"></link>
        <link href="/favicon32.png" rel="icon" type="image/png" sizes="32x32" />
        <link href="/favicon64.png" rel="icon" type="image/png" sizes="64x64" />
        <link href="/favicon512.png" rel="icon" type="image/png" sizes="512x512" />
      </Head>

      <Navbar bg="light">
        <Container>
          <Navbar.Brand>
            {title}
          </Navbar.Brand>

          {children}
        </Container>
      </Navbar>
    </>
  )
}
