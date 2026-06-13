package org.example.goalcalendar.service

import org.example.goalcalendar.controller.UpdateGoalRequest
import org.example.goalcalendar.model.Goal
import org.example.goalcalendar.repository.GoalRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate

@Service
class GoalService(private val goalRepo: GoalRepository) {

    fun getGoalsForDate(userId: String, date: LocalDate): List<Goal> =
        goalRepo.findByUserIdAndDate(userId, date)

    fun createGoal(userId: String, label: String, targetValue: Int, date: LocalDate): Goal {
        val goal = Goal()
        goal.userId = userId
        goal.label = label
        goal.targetValue = targetValue
        goal.date = date
        return goalRepo.save(goal)
    }

    fun updateGoal(id: String, userId: String, req: UpdateGoalRequest): Goal {
        val goal = goalRepo.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        if (goal.userId != userId) throw ResponseStatusException(HttpStatus.FORBIDDEN)
        goal.currentValue = req.currentValue
        if (req.label != null) goal.label = req.label
        if (req.targetValue != null) goal.targetValue = req.targetValue
        goal.completed = goal.currentValue >= goal.targetValue
        return goalRepo.save(goal)
    }

    fun deleteGoal(id: String, userId: String) {
        val goal = goalRepo.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        if (goal.userId != userId) throw ResponseStatusException(HttpStatus.FORBIDDEN)
        goalRepo.delete(goal)
    }
}