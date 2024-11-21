package dev.sammeh

import io.smallrye.mutiny.Uni
import io.smallrye.mutiny.uni
import jakarta.enterprise.context.ApplicationScoped
import jakarta.ws.rs.GET
import jakarta.ws.rs.Path

@ApplicationScoped
@Path("/balls")
class BallsController(private val ballService: BallService) {
    @GET
    fun getBalls(): Uni<List<Ball>> {
        return ballService.getBalls()
    }

    @GET
    @Path("/trucks")
    fun getPath(): String? {
        return BallsController::class.java.classLoader.getResource("jsonFile.json")?.readText()
    }
    @GET
    @Path("/excavators")
    fun getExcavators(): String? {
        return BallsController::class.java.classLoader.getResource("test/test.txt")?.readText()
    }
}

data class Point(val x: Double, val y: Double, val z: Double)
data class Ball(val id: Long, val position: Point, val velocity: Point)