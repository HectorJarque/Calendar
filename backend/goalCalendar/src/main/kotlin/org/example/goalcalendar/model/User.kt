package org.example.goalcalendar.model

import jakarta.persistence.*
import jakarta.validation.constraints.Email
import java.time.LocalDateTime

@Entity
@Table(name = "users")
data class User(
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    val id: String = "",

    @Column(unique = true, nullable = false)
    @Email val email: String = "",

    @Column(nullable = false)
    val password: String = "",

    val createdAt: LocalDateTime = LocalDateTime.now()
)