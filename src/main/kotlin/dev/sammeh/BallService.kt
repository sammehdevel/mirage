package dev.sammeh

import io.smallrye.mutiny.Uni
import io.smallrye.mutiny.uni
import jakarta.enterprise.context.ApplicationScoped
import kotlin.random.Random

@ApplicationScoped
class BallService {
    fun getBalls(): Uni<List<Ball>> {
        // Simulate fetching balls from a database or API
        return uni { createRandomBalls(5000) }
    }


    fun createRandomBalls(capacity: Int): List<Ball> {
        val density = 16.0
        return (1..capacity).map {
            Ball(
                it.toLong(), Point(
                    Random.nextDouble(-capacity / density, capacity / density),
                    Random.nextDouble(-capacity / density, capacity / density),
                    Random.nextDouble(-capacity / density, capacity / density),
                ),
                Point(
                    Random.nextDouble(-1.0, 1.0),
                    Random.nextDouble(-1.0, 1.0),
                    Random.nextDouble(-1.0, 1.0),
                )
            )
        }
    }
}