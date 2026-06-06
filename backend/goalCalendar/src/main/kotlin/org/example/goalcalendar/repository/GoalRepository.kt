package org.example.goalcalendar.repository

import org.example.goalcalendar.model.Goal
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate

interface GoalRepository : JpaRepository<Goal, String> {
    fun findByUserIdAndDate(userId: String, date: LocalDate): List<Goal>
    fun findByUserIdAndDateAndLabel(userId: String, date: LocalDate, label: String): Goal?
    fun findByUserIdAndDateAndCompletedFalseAndCarriedOverFalse(userId: String, date: LocalDate): List<Goal>
}