package org.example.goalcalendar.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val jwtFilter: JwtAuthFilter,
    @Value("\${app.cors.allowed-origin}") private val allowedOrigin: String
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain = http
        .csrf { it.disable() }
        .cors { it.configurationSource(corsConfig()) }
        .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
        .authorizeHttpRequests {
            it.requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
        }
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter::class.java)
        .build()

    @Bean
    fun passwordEncoder() = BCryptPasswordEncoder(12)

    @Bean
    fun corsConfig() = UrlBasedCorsConfigurationSource().apply {
        registerCorsConfiguration("/**", CorsConfiguration().apply {
            allowedOrigins = listOf(allowedOrigin)
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
            allowedHeaders = listOf("*")
        })
    }
}