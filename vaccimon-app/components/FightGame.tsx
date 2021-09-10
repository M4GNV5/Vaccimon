import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'

import Peer, { DataConnection } from 'peerjs'

import { Button, Container, ListGroup, Modal } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFistRaised,
  faViruses,
  faBed,
  faBullseye,
} from '@fortawesome/free-solid-svg-icons'

import AppContainer from '../components/AppContainer'
import AppNavbar from '../components/AppNavbar'
import AppTabbar from '../components/AppTabbar'
import QRCodeCanvas from '../components/QRCodeCanvas'
import useVaccimon from '../lib/repository-hook'
import { Vaccimon } from '../lib/vaccimon'

import styles from '../styles/fight.module.css'

enum Effect {
  Poison,
  Sleeping,
}
type Ability = {
  name: string,
  failureRate: number,
  minDamage: number,
  maxDamage: number,
  effects: Effect[]
}

enum GameActionKind {
  End,
  Attack,
  Wait,
  Swap,
}
type RemoteVaccimon = {
  avatarUrl: string,
  fullName: string,
  strength: number,
  health: number,
}
type LocalVaccimon = {
  certificate: string,
  id: string,
  firstName: string,
  lastName: string,
  fullName: string,
  dateOfBirth: Date,
  vaccine: string,
  vaccinationDate: Date,
  level: number,
  country: string,
  avatarUrl: string,
  certificateSigner: string,
  isFullyVaccinated: boolean,
  health: number,
  strength: number
};
type GameAction = {
  kind: GameActionKind,
  isLocal: boolean,

  abilityUse?: {
    ability: Ability,
    damage: number,
    effects: Effect[],
  },
  newVaccimon?: RemoteVaccimon,
}

const baseAbilities: {[key: string]: Ability} = {
  Comirnaty: {
    name: 'Lipid Splash',
    failureRate: 0.1,
    minDamage: 10,
    maxDamage: 30,
    effects: []
  },
  Spikevax: {
    name: 'Spikes',
    failureRate: 0.1,
    minDamage: 10,
    maxDamage: 30,
    effects: [],
  },
  Vaxzevria: {
    name: 'Side Effects',
    failureRate: 0.4,
    minDamage: 0,
    maxDamage: 15,
    effects: [Effect.Sleeping],
  },
  'COVID-19 Vaccine Janssen': {
    name: 'Adenovirus',
    failureRate: 0.3,
    minDamage: 0,
    maxDamage: 0,
    effects: [Effect.Poison],
  },
}

const fallbackBaseAbility: Ability = {
  name: 'EU Approval',
  failureRate: 0.5,
  minDamage: 25,
  maxDamage: 40,
  effects: [],
}

export default function Fight () {
  const router = useRouter()
  const vaccimon = useVaccimon()

  const [gameId, setGameId] = useState<string>()
  const [connection, setConnection] = useState<DataConnection | null>(null)

  const [hasStarted, setHasStarted] = useState(false)
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [showSwapMenu, setShowSwapMenu] = useState(false)
  const [myVaccimon, setMyVaccimon] = useState<LocalVaccimon | null>(null)
  const [opponentVaccimon, setOpponentVaccimon] = useState<RemoteVaccimon | null>(null)
  const [gameLog, setGameLog] = useState<GameAction[]>([])
  const [logPosition, setLogPosition] = useState<number>(0)

  const formatNum = (new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })).format
  const getStrengthColor = (strength: number) => {
    if (strength < 0.7) {
      return 'transparent'
    } else if (strength < 1) {
      return '#ffcb00'
    } else if (strength < 2) {
      return 'orange'
    } else {
      return '#ff5622'
    }
  }

  const addRemoteAction = useCallback((data: GameAction) => {
    const dup = [...gameLog]
    if (data.kind === GameActionKind.Attack && data.abilityUse) {
      dup.push({
        kind: data.kind,
        isLocal: false,
        abilityUse: data.abilityUse,
      })
    } else if (data.kind === GameActionKind.Swap && data.newVaccimon) {
      dup.push({
        kind: data.kind,
        isLocal: false,
        newVaccimon: data.newVaccimon,
      })
    } else if (data.kind === GameActionKind.Wait || data.kind === GameActionKind.End) {
      dup.push({
        kind: data.kind,
        isLocal: false,
      })
    }

    setGameLog(dup)
  }, [gameLog])
  useEffect(() => {
    if (!Peer) {
      // XXX will never happen
      return
    }

    function initializeConnection (conn: DataConnection) {
      conn.on('open', () => {
        setHasStarted(true)
      })

      conn.on('data', addRemoteAction)

      conn.on('error', e => {
        console.error(e)
        alert(e.message)
      })

      conn.on('close', () => {
        alert('Connection closed :(')
        router.push('/')
      })
    }

    const peer = new Peer(undefined, { debug: 3 })

    peer.on('error', e => {
      console.error(e)
      alert(`Connection Error: ${e.type}`)
    })

    peer.on('connection', conn => {
      // we were first and someone just connected
      if (connection) {
        // more people? nope
        conn.close()
      } else {
        initializeConnection(conn)
        setConnection(conn)
        setHasStarted(true)
      }
    })

    peer.on('open', () => {
      if (window.location.hash) {
        // we were second and need to connect
        const id = window.location.hash.substr(1)
        const conn = peer.connect(id)
        initializeConnection(conn)
        setConnection(conn)
        setIsMyTurn(true)
      } else {
        // we were first and are waiting
        setGameId(peer.id)
      }
    })

    peer.on('disconnected', () => {
      alert('Connection to Lobby lost :(')
    })
  }, [router, connection, addRemoteAction])

  const calculateStrength = useCallback(function (v: Vaccimon): number {
    // base strength based on level
    let strength = [0.3, 0.6, 1][v.level - 1]

    // rare vaccine bonus
    if (!['Comirnaty', 'Spikevax', 'Vaxzevria', 'COVID-19 Vaccine Janssen'].includes(v.vaccine)) {
      strength *= 3
    }

    // bonus for other vaccimon with same family name
    const family = new Set(vaccimon.filter(x => x.lastName === v.lastName).map(x => x.fullName))
    strength *= Math.sqrt(family.size)

    // bonus for other vaccimon with same color
    const sameColor = new Set(vaccimon.filter(x => x.vaccine === v.vaccine).map(x => x.fullName))
    strength *= Math.sqrt(Math.sqrt(sameColor.size))

    // age bonus
    const age = (new Date()).getFullYear() - v.dateOfBirth.getFullYear()
    if (age < 14) {
      strength *= 0.6
    } else if (age < 18) {
      strength *= 0.8
    } else if (age < 30) {
      strength *= 1.3
    } else if (age < 60) {
      strength *= 1
    } else {
      strength *= 0.7
    }

    // TODO early adopter bonus?

    return strength
  }, [vaccimon])
  function calculateStrengthsOf (check: string | ((v: Vaccimon) => boolean)) {
    return vaccimon
      .filter(x => typeof check === 'string' ? x.vaccine === check : check(x))
      .map(x => calculateStrength(x))
      .reduce((a, b) => a + b, 0)
  }

  function getAbilities (v: LocalVaccimon): Ability[] {
    const result: Ability[] = []

    if (v.vaccine in baseAbilities) {
      result.push(baseAbilities[v.vaccine])
    } else {
      result.push(fallbackBaseAbility)
    }

    // TODO age based abilities?
    // TODO family based abilities?

    return result
  }

  function addAndTransmitAction (action: GameAction) {
    if (connection) {
      connection.send(action)
    }

    const dup = [...gameLog]
    dup.push(action)
    setGameLog(dup)

    setIsMyTurn(false)
  }

  function convertToLocalVaccimon (vaccimon: Vaccimon, strength: number): LocalVaccimon {
    return {
      certificate: vaccimon.certificate,
      id: vaccimon.id,
      firstName: vaccimon.firstName,
      lastName: vaccimon.lastName,
      fullName: vaccimon.fullName,
      dateOfBirth: vaccimon.dateOfBirth,
      vaccine: vaccimon.vaccine,
      vaccinationDate: vaccimon.vaccinationDate,
      level: vaccimon.level,
      country: vaccimon.country,
      avatarUrl: vaccimon.avatarUrl,
      certificateSigner: vaccimon.certificateSigner,
      isFullyVaccinated: vaccimon.isFullyVaccinated,
      health: 100,
      strength
    }
  }

  function trickTypescript (val: object): any {
    return val
  }

  const topList = useMemo(() => {
    const dup = vaccimon.map(v => convertToLocalVaccimon(v, calculateStrength(v)))
    dup.sort((a, b) => b.strength - a.strength)

    return dup
  }, [vaccimon, calculateStrength])

  function renderLobby () {
    return (
      <AppContainer>
          <AppNavbar title="Fight Lobby" />
          <Container>
            <h3>Your strengths</h3>
            <ListGroup>
              <ListGroup.Item>
                <span className={styles.vaccine}>Green Vaccímon</span>
                <span className={styles.strength}>{formatNum(calculateStrengthsOf('Comirnaty'))}</span>
              </ListGroup.Item>
              <ListGroup.Item>
                <span className={styles.vaccine}>Red Vaccímon</span>
                <span className={styles.strength}>{formatNum(calculateStrengthsOf('Spikevax'))}</span>
              </ListGroup.Item>
              <ListGroup.Item>
                <span className={styles.vaccine}>Blue Vaccímon</span>
                <span className={styles.strength}>{formatNum(calculateStrengthsOf('Vaxzevria'))}</span>
              </ListGroup.Item>
              <ListGroup.Item>
                <span className={styles.vaccine}>Yellow Vaccímon</span>
                <span className={styles.strength}>{formatNum(calculateStrengthsOf('COVID-19 Vaccine Janssen'))}</span>
              </ListGroup.Item>
              <ListGroup.Item>
                <span className={styles.vaccine}>White Vaccímon</span>
                <span className={styles.strength}>{formatNum(calculateStrengthsOf(v => !['Comirnaty', 'Spikevax', 'Vaxzevria', 'COVID-19 Vaccine Janssen'].includes(v.vaccine)))}</span>
              </ListGroup.Item>
            </ListGroup>

            <h3 className={styles.heading}>Your top Vaccímon</h3>
            <ListGroup>
              {topList.slice(0, 5).map((v, i) =>
                <ListGroup.Item key={i} action onClick={() => router.push(`/card#${v.id}`)}>
                  <span className={styles.vaccine}>{v.fullName}</span>
                  <span className={styles.strength}>{formatNum(v.strength)}</span>
                </ListGroup.Item>
              )}
            </ListGroup>

            <h3 className={styles.heading}>QR Code</h3>
            {!gameId && <p>No game generated yet...</p>}
            {gameId && <a className={styles.matchLink} href={`${window.location.origin}/fight#${gameId}`} target="_black" rel="noopener">
              <QRCodeCanvas className={styles.qrCode} width={1024} height={1024} value={`${window.location.origin}/fight#${gameId}`} />
            </a>}

            <h3 className={styles.heading}>Explanation</h3>
            <p>Let your opponent scan the above QR code to start an encrypted fight.</p>

            <p>You will take turns in attacking each other using your Vaccímons. Vaccímon have different abilities
            based on their color and different strengths based on their level and how many Vaccímon of the same
            color you have in your Vaccídex.</p>
          </Container>
          <AppTabbar />
      </AppContainer>
    )
  }

  function renderGame () {
    return (
      <div className={styles.vaccimons}>
        <div className={styles.opponentVaccimon}>
          {renderVaccimon(opponentVaccimon)}
        </div>
        <div className={styles.vsText}>
          VS
        </div>
        <div className={styles.myVaccimon}>
          {renderVaccimon(myVaccimon)}
        </div>
      </div>
    )
  }

  function renderVaccimon (vaccimon: RemoteVaccimon | LocalVaccimon | null) {
    if (!vaccimon) {
      return '-'
    }

    return (
      <>
        {vaccimon && (
          <div className={styles.vaccimonImage}>
            <Image src={vaccimon.avatarUrl} alt="" width="1024" height="1024" />
          </div>
        )}
        <span className={styles.vaccimonName}>
          {vaccimon ? vaccimon.fullName : 'No Vaccimon'}
        </span>
        <span className={styles.healthBar} style={trickTypescript({ '--health': vaccimon.health })}>
        </span>
      </>
    )
  }

  function renderMyTurn () {
    function performAbility (ability: Ability) {
      if (!myVaccimon) {
        return
      }

      const { minDamage, maxDamage, effects } = ability
      const strength = myVaccimon.strength
      const damage = strength * (minDamage + Math.round(Math.random() * (maxDamage - minDamage)))

      addAndTransmitAction({
        kind: GameActionKind.Attack,
        isLocal: true,

        abilityUse: {
          ability,
          damage,
          effects,
        }
      })
    }
    function swapTo (v: LocalVaccimon) {
      addAndTransmitAction({
        kind: GameActionKind.Swap,
        isLocal: true,

        newVaccimon: {
          fullName: v.fullName, // TODO only use last name?
          avatarUrl: v.avatarUrl,
          strength: v.strength,
          health: v.health, // TODO store health of already used Vaccímons?
        }
      })
      setShowSwapMenu(false)
      setMyVaccimon(v)
    }
    function skipTurn () {
      addAndTransmitAction({
        kind: GameActionKind.Wait,
        isLocal: true,
      })
    }
    function exitMatch () {
      addAndTransmitAction({
        kind: GameActionKind.End,
        isLocal: true,
      })
      router.replace('/')
    }

    return (
      <AppContainer>
        <AppNavbar title="Fight" />

        <Container className={styles.gameContainer}>
          <Modal show={!!showSwapMenu} onHide={() => setShowSwapMenu(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Select Vaccímon</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ListGroup>
                {topList.map((v, i) =>
                  <ListGroup.Item
                    key={i}
                    action
                    onClick={() => swapTo(v)}
                    className={styles.swapVaccimonItem}
                    style={trickTypescript({ '--badge-color': getStrengthColor(v.strength) })}>
                    <span className={styles.swapVaccimonAvatar}><Image src={v.avatarUrl} width={48} height={48} alt="" /></span>
                    <span className={styles.swapVaccimonName}>{v.fullName}</span>
                    <span className={styles.swapVaccimonPower}><span>{formatNum(v.strength)}</span></span>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Modal.Body>
          </Modal>

          {renderGame()}

          <div className={styles.gameActionBoxOurTurn}>
            <h5 className={styles.heading}>Your Turn</h5>
            <div className="d-grid gap-2">
              {myVaccimon && getAbilities(myVaccimon).map((ability, i) =>
                <Button size="lg" key={i} variant="outline-danger" disabled={!opponentVaccimon} onClick={() => performAbility(ability)}>
                  <span className={styles.abilityKind}>Attack:{' '}</span>
                  <span className={styles.abilityName}>{ability.name}</span>
                  <span className={styles.abilityEffects}>
                    <FontAwesomeIcon icon={faBullseye} fixedWidth />
                    {Math.round(100 * (1 - ability.failureRate))}%
                    {ability.maxDamage > 0 && <>
                      <FontAwesomeIcon icon={faFistRaised} fixedWidth />
                      {ability.minDamage} - {ability.maxDamage}
                    </>}
                    {ability.effects.map((effect, j) =>
                      <span key={j}>
                        <FontAwesomeIcon icon={effect === Effect.Poison ? faViruses : faBed} fixedWidth />
                      </span>
                    )}
                  </span>
                </Button>
              )}
              <Button size="lg" variant="outline-success" onClick={() => skipTurn()}>
                Skip Turn
              </Button>
              <Button size="lg" variant="outline-primary" onClick={() => setShowSwapMenu(true)}>
                Swap Vaccímon
              </Button>
              <Button size="lg" variant="outline-secondary" onClick={() => exitMatch()}>
                Flee
              </Button>
            </div>
          </div>
        </Container>
      </AppContainer>
    )
  }

  function renderMessageQueue () {
    let inner = null

    const action = gameLog[logPosition]
    if (!action) {
      inner = (
        <p>
          Waiting for next move...
        </p>
      )
    } else if (action.kind === GameActionKind.Attack && action.abilityUse && opponentVaccimon && myVaccimon) {
      const use = action.abilityUse
      inner = (
        <p>
          {action.isLocal ? 'Your ' : 'Your opponents '}
          <strong>{opponentVaccimon.fullName}</strong> uses <strong>{use.ability.name}</strong>
          {(use.damage !== 0 || use.effects.length === 0) &&
            <>
              {' '}dealing <strong>{formatNum(use.damage)}</strong> damage
              {use.effects.length !== 0 && ' and'}
            </>
          }
          {use.effects.includes(Effect.Poison) &&
            <>{' '} <strong>poisons</strong> {myVaccimon.fullName}</>
          }
          {use.effects.includes(Effect.Sleeping) &&
            <>{' '} puts {myVaccimon.fullName} <strong>to sleep</strong></>
          }
          .
        </p>
      )
    } else if (action.kind === GameActionKind.Swap && action.newVaccimon) {
      inner = (
        <p>
          {action.isLocal ? 'You swap your Vaccímon to ' : 'Your opponent swaps his Vaccímon to '}
          <strong>{action.newVaccimon.fullName}</strong>.
        </p>
      )
    } else if (action.kind === GameActionKind.Wait) {
      inner = (
        <p>
          {action.isLocal ? 'You do nothing' : 'Your opponent does nothing'}
        </p>
      )
    } else if (action.kind === GameActionKind.End) {
      inner = (
        <p>
          The game ended...
        </p>
      )
    } else {
      inner = (
        <p>
          Error: Invalid Game Action!
          <pre>{JSON.stringify(action)}</pre>
        </p>
      )
    }

    function performAction () {
      if (logPosition >= gameLog.length) {
        return
      }

      if (action.kind === GameActionKind.Attack && action.abilityUse) {
        if (action.isLocal && opponentVaccimon) {
          const health = opponentVaccimon.health - action.abilityUse.damage
          if (health <= 0) {
            setOpponentVaccimon(null)
          } else {
            setOpponentVaccimon({
              ...opponentVaccimon,
              health,
            })
          }
        } else if (!action.isLocal && myVaccimon) {
          const health = myVaccimon.health - action.abilityUse.damage
          if (health <= 0) {
            setMyVaccimon(null)
          } else {
            setMyVaccimon({ ...myVaccimon, health })
          }
        }
      } else if (action.kind === GameActionKind.Swap && action.newVaccimon) {
        if (action.isLocal) {
          // set already
        } else {
          setOpponentVaccimon(action.newVaccimon)
        }
      } else if (action.kind === GameActionKind.End) {
        if (connection) {
          connection.close()
        }

        alert('Other player quit the game! What a coward')
        router.push('/')
      }

      if (logPosition === gameLog.length - 1 && !action.isLocal) {
        setIsMyTurn(true)
      }
      setLogPosition(logPosition + 1)
    }

    return (
      <AppContainer>
        <AppNavbar title="Fight" />
        <Container onClick={() => performAction()} className={styles.gameContainer}>
          {renderGame()}
          <div className={styles.gameActionBox}>
            {inner}
          </div>
        </Container>
      </AppContainer>
    )
  }

  if (!hasStarted) {
    return renderLobby()
  } else if (logPosition < gameLog.length || !isMyTurn) {
    return renderMessageQueue()
  } else {
    return renderMyTurn()
  }
}
