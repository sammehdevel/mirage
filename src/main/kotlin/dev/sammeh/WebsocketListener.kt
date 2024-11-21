package dev.sammeh

import io.quarkus.websockets.next.OnTextMessage
import io.quarkus.websockets.next.WebSocket
import io.smallrye.mutiny.Uni
import io.smallrye.mutiny.uni

@WebSocket(path = "/websocket")
class WebsocketListener {
    data class Pointer(val x: Double, val y: Double, val z: Double)
    @OnTextMessage
    fun onMessage(pointer: List<Double>) : Uni<List<Double>>{
        return uni { pointer }
    }
}