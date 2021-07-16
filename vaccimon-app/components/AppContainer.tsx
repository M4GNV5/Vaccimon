import { Container } from 'react-bootstrap'
import styles from '../styles/AppContainer.module.css'

interface AppContainerProps {
  className?: string
  children: any
}

export default function AppContainer ({ className, children }: AppContainerProps) {
  return (
    <Container className={`${className} ${styles.container}`}>
      {children}
    </Container>
  )
}
