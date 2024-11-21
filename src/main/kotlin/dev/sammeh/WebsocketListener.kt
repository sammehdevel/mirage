package dev.sammeh

import io.quarkus.websockets.next.OnBinaryMessage
import io.quarkus.websockets.next.OnClose
import io.quarkus.websockets.next.OnError
import io.quarkus.websockets.next.OnOpen
import io.quarkus.websockets.next.OnTextMessage
import io.quarkus.websockets.next.WebSocket
import io.smallrye.mutiny.Multi

@WebSocket(path = "/websocket")
class WebsocketListener {
    data class Pointer(val x: Double, val y: Double, val z: Double)

    @OnTextMessage
    fun onMessage(pointer: Multi<List<Double>>): Multi<List<Double>> {
        return pointer
    }
}