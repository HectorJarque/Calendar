package org.example.goalcalendar.service

import org.example.goalcalendar.model.User
import org.example.goalcalendar.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class AuthService(
    private val userRepo: UserRepository,
    private val jwtService: JwtService,
    private val passwordEncoder: PasswordEncoder
) {
    fun register(email: String, rawPassword: String): String {
        if (userRepo.findByEmail(email) != null)
            throw ResponseStatusException(HttpStatus.CONFLICT, "Email ya registrado")

        val user = User()
        user.email = email
        user.password = passwordEncoder.encode(rawPassword)

        val saved = userRepo.save(user)
        return jwtService.generateToken(saved.id)
    }

    fun login(email: String, rawPassword: String): String {
        val user = userRepo.findByEmail(email)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas")

        if (!passwordEncoder.matches(rawPassword, user.password))
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas")

        return jwtService.generateToken(user.id)
    }
}