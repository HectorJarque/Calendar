package org.example.goalcalendar.model

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "goals")
data class Goal(
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    val id: String = "",

    @Column(nullable = false)
    val userId: String = "",

    val label: String = "",
    val targetValue: Int = 0,
    val currentValue: Int = 0,
    val date: LocalDate = LocalDate.now(),
    val completed: Boolean = false,
    val carriedOver: Boolean = false
)