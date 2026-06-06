package org.example.goalcalendar.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

@Service
class RateLimitService {

    private val loginAttempts = ConcurrentHashMap<String, MutableList<Long>>()
    private val registerAttempts = ConcurrentHashMap<String, MutableList<Long>>()

    fun checkLogin(ip: String) = check(loginAttempts, ip, maxRequests = 20)
    fun checkRegister(ip: String) = check(registerAttempts, ip, maxRequests = 10)

    private fun check(map: ConcurrentHashMap<String, MutableList<Long>>, ip: String, maxRequests: Int) {
        val now = Instant.now().epochSecond
        val windowStart = now - 3600 // última hora

        val timestamps = map.getOrPut(ip) { mutableListOf() }
        synchronized(timestamps) {
            timestamps.removeIf { it < windowStart }
            if (timestamps.size >= maxRequests)
                throw ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Demasiados intentos. Espera un rato.")
            timestamps.add(now)
        }
    }
}