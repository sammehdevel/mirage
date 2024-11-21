import {Canvas, useFrame} from "@react-three/fiber";
import {Line, OrbitControls, PerspectiveCamera, Sphere} from "@react-three/drei";
import {MeshStandardMaterial, SphereGeometry, Vector3} from "three";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import useWebSocket from "react-use-websocket";
import {useQuery} from "@tanstack/react-query";

async function fetchBalls() {
    const response = await fetch("/balls")
    return await response.json()
}
function App() {

    const {data, isLoading} = useQuery<Ball[]>({queryKey: ["balls"], queryFn: fetchBalls})

    return (
        <div className={"canvas__root"}>
            <Canvas>
                {data && <Model balls={data!}/>}
            </Canvas>
        </div>
    )
}

const balls = 5000
const density = 16


interface Pointer {
    x: number
    y: number
    z: number
}
interface Ball {
    id: number
    position: Pointer
    velocity: Pointer
}

function Model(props: {balls: Ball[]}) {
    return <>
        <PerspectiveCamera makeDefault position={[0, 0, 40]}/>
        <OrbitControls zoomToCursor={true} zoomSpeed={0.75}/>
        <ambientLight/>

        <MouseTrace/>
        {/*<pointLight position={[0, 0, 0]} intensity={0.5}/>*/}
        {/*<spotLight intensity={2.5} position={[50, 50, 50]} castShadow/>*/}
        {props.balls.map(ball => {
            return <Ball key={ball.id} position={ball.position} velocity={ball.velocity}/>
         })}
    </>
}

function isSamePosition(a, b) {
    const threshold = 0.05
    return Math.abs(a[0] - b[0]) < threshold && Math.abs(a[1] - b[1]) < threshold && Math.abs(a[2] - b[2]) < threshold
}

const useThrottle = (callback, limit) => {
    const lastCallRef = useRef(0);
    return useCallback((...args) => {
        const now = Date.now();
        if (now - lastCallRef.current >= limit) {
            lastCallRef.current = now;
            callback(...args);
        }
    }, [callback, limit]);
};


function MouseTrace() {
    const {lastJsonMessage, sendJsonMessage} = useWebSocket<number[]>("/websocket")

    const sendPosition = useThrottle((point: number[]) => {
        sendJsonMessage(point.map(p => parseFloat(p.toPrecision(4))))
    }, 0)
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
            sendPosition(point.toArray())
        }
        // meshRef.current.position.set(point)
    })
    return <>
        <Line ref={meshRef} points={points} lineWidth={5} color={"green"}/>
        <Sphere position={new Vector3(...position)} args={[1, 8, 8]} material-color={"blue"}/>
    </>
}

function Ball({position, velocity}) {

    const [hovering, setHovering] = useState(false)
    const posVec = useMemo(() => new Vector3(position.x, position.y, position.z), [position])

    const meshRef = useRef()
    useFrame((_, d) => {
        meshRef.current.position.x += velocity.x * d
        meshRef.current.position.y += velocity.y * d
        meshRef.current.position.z += velocity.z * d
    })
    const geom = useMemo(() => new SphereGeometry(1, 8, 8), [])
    const mat = useMemo(() => new MeshStandardMaterial({color: 'red'}), [])
    return (
        <mesh visible
              scale={hovering ? [1.5, 1.5, 1.5] : [1, 1, 1]}
              onPointerEnter={() => setHovering(true)}
              onPointerLeave={() => setHovering(false)}
              ref={meshRef}
              position={posVec}
              rotation={[Math.PI / 2, 0, 0]} geometry={geom} material={mat}>
        </mesh>
    )
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min
}

export default App
