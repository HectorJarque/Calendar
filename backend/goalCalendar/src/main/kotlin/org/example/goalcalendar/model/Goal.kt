package org.example.goalcalendar.model

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "goals")
class Goal {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    var id: String = ""

    @Column(nullable = false)
    var userId: String = ""

    var label: String = ""
    var targetValue: Int = 0
    var currentValue: Int = 0
    var date: LocalDate = LocalDate.now()
    var completed: Boolean = false
}