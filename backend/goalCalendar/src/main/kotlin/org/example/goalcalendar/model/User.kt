package org.example.goalcalendar.model

import jakarta.persistence.*
import jakarta.validation.constraints.Email
import java.time.LocalDateTime

@Entity
@Table(name = "users")
class User {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    var id: String = ""

    @Column(unique = true, nullable = false)
    @Email var email: String = ""

    @Column(nullable = false)
    var password: String = ""

    var createdAt: LocalDateTime = LocalDateTime.now()
}