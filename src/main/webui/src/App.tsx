import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {Line, OrbitControls, OrthographicCamera, PerspectiveCamera, RoundedBox, Sphere, Stage} from "@react-three/drei";
import {MeshStandardMaterial, SphereGeometry, Vector3} from "three";
import {useEffect, useMemo, useRef, useState} from "react";
import useWebSocket from "react-use-websocket";

function App() {

    return (
        <div className={"canvas__root"}>
            <Canvas>
                <Model/>
            </Canvas>
        </div>
    )
}

const balls = 1000
const density = 32

function Model() {
    return <>
        <PerspectiveCamera makeDefault position={[0, 0, 40]}/>
        <OrbitControls zoomToCursor={true} zoomSpeed={0.75}/>
        <ambientLight/>

        <MouseTrace/>
        {/*<pointLight position={[0, 0, 0]} intensity={0.5}/>*/}
        {/*<spotLight intensity={2.5} position={[50, 50, 50]} castShadow/>*/}
        {[...Array(balls)].map((_, i) => (i)).map(i => (
            <Ball key={i} i={i}/>
        ))}
    </>
}

function isSamePosition(a, b) {
    const threshold = 0.01
    return Math.abs(a[0] - b[0]) < threshold && Math.abs(a[1] - b[1]) < threshold && Math.abs(a[2] - b[2]) < threshold
}

interface Pointer {
    x: number
    y: number
    z: number
}

function MouseTrace() {
    const {lastJsonMessage, sendJsonMessage} = useWebSocket<number[]>("/websocket")

    const [points, setPoints] = useState<number[][]>([[0, 0, 0]])
    const [position, setPosition] = useState([0, 0, 0])
    const meshRef = useRef()
    useEffect(() => {
        if (lastJsonMessage) {
            const newPoints = [...points, lastJsonMessage]

            while (newPoints.length > 100) {
                newPoints.shift()
            }

            setPoints(newPoints)
            setPosition(lastJsonMessage)
        }
    }, [lastJsonMessage]);
    useFrame((state) => {
        // console.log(state.pointer, state.size)?
        const raycaster = state.raycaster
        raycaster.setFromCamera(state.pointer, state.camera)
        const point = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(50))
        if (!isSamePosition(points[points.length - 1], point.toArray())) {
            sendJsonMessage(point.toArray())
        }
        // meshRef.current.position.set(point)
    })
    return <>
        <Line ref={meshRef} points={points} lineWidth={5} color={"green"}/>
        <Sphere position={new Vector3(...position)} args={[1, 8, 8]} material-color={"blue"}/>
    </>
}

function Ball({i}) {
    const [position, setPosition] = useState<number[]>([randomBetween(-balls / density, balls / density), randomBetween(-balls / density, balls / density), randomBetween(-balls / density, balls / density)])
    const velocity = useMemo<number[]>(() => ([randomBetween(-1, 1), randomBetween(-1, 1), randomBetween(-1, 1)]), [])
    const [hovering, setHovering] = useState(false)

    const meshRef = useRef()
    useFrame((_, d) => {
        meshRef.current.position.x += velocity[0] * d
        meshRef.current.position.y += velocity[1] * d
        meshRef.current.position.z += velocity[2] * d
    })
    const geom = useMemo(() => new SphereGeometry(1, 8, 8), [])
    const mat = useMemo(() => new MeshStandardMaterial({color: 'red'}), [])
    return (
        <mesh visible
              scale={hovering ? [1.5, 1.5, 1.5] : [1, 1, 1]}
              onPointerEnter={() => setHovering(true)}
              onPointerLeave={() => setHovering(false)}
              ref={meshRef}
              position={position}
              rotation={[Math.PI / 2, 0, 0]} geometry={geom} material={mat}>
        </mesh>
    )
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min
}

export default App
