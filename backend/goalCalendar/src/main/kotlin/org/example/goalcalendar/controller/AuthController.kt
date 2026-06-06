package org.example.goalcalendar.controller

import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Size
import org.example.goalcalendar.service.AuthService
import org.example.goalcalendar.service.RateLimitService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

data class AuthRequest(
    @field:Email(message = "Email no válido")
    val email: String,

    @field:Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    val password: String
)

data class AuthResponse(val token: String)

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
    private val rateLimitService: RateLimitService
) {

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    fun register(
        @Valid @RequestBody req: AuthRequest,
        request: HttpServletRequest
    ): AuthResponse {
        rateLimitService.checkRegister(request.remoteAddr)
        return AuthResponse(authService.register(req.email, req.password))
    }

    @PostMapping("/login")
    fun login(
        @Valid @RequestBody req: AuthRequest,
        request: HttpServletRequest
    ): AuthResponse {
        rateLimitService.checkLogin(request.remoteAddr)
        return AuthResponse(authService.login(req.email, req.password))
    }
}