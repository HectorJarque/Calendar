package org.example.goalcalendar.service

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.Date

@Service
class JwtService(
    @Value("\${jwt.secret}") private val secret: String,
    @Value("\${jwt.expiration}") private val expiration: Long
) {
    private fun key() = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret))

    fun generateToken(userId: String): String =
        Jwts.builder()
            .subject(userId)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + expiration))
            .signWith(key())
            .compact()

    fun extractUserId(token: String): String =
        Jwts.parser()
            .verifyWith(key())
            .build()
            .parseSignedClaims(token)
            .payload
            .subject

    fun isValid(token: String): Boolean = runCatching {
        Jwts.parser().verifyWith(key()).build().parseSignedClaims(token)
        true
    }.getOrDefault(false)
}