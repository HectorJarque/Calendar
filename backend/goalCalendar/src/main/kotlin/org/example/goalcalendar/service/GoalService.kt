package org.example.goalcalendar.service

import org.example.goalcalendar.model.Goal
import org.example.goalcalendar.repository.GoalRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate

@Service
class GoalService(private val goalRepo: GoalRepository) {

    fun getGoalsForDate(userId: String, date: LocalDate): List<Goal> {
        carryOverIfNeeded(userId, date)
        return goalRepo.findByUserIdAndDate(userId, date)
    }

    fun createGoal(userId: String, label: String, targetValue: Int, date: LocalDate): Goal =
        goalRepo.save(
            Goal(userId = userId, label = label, targetValue = targetValue, date = date)
        )

    fun updateGoal(id: String, userId: String, currentValue: Int): Goal {
        val goal = goalRepo.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Meta no encontrada") }

        if (goal.userId != userId)
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Sin permiso")

        return goalRepo.save(
            goal.copy(
                currentValue = currentValue,
                completed = currentValue >= goal.targetValue
            )
        )
    }

    fun deleteGoal(id: String, userId: String) {
        val goal = goalRepo.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Meta no encontrada") }

        if (goal.userId != userId)
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Sin permiso")

        goalRepo.delete(goal)
    }

    private fun carryOverIfNeeded(userId: String, date: LocalDate) {
        val yesterday = date.minusDays(1)
        val pending = goalRepo.findByUserIdAndDateAndCompletedFalseAndCarriedOverFalse(userId, yesterday)

        pending.forEach { goal ->
            val remaining = goal.targetValue - goal.currentValue
            if (remaining > 0) {
                val existing = goalRepo.findByUserIdAndDateAndLabel(userId, date, goal.label)
                if (existing != null) {
                    goalRepo.save(existing.copy(
                        targetValue = existing.targetValue + remaining,
                        carriedOver = true
                    ))
                } else {
                    goalRepo.save(Goal(
                        userId = userId,
                        label = goal.label,
                        targetValue = remaining,
                        date = date,
                        carriedOver = true
                    ))
                }
                goalRepo.save(goal.copy(carriedOver = true))
            }
        }
    }
}