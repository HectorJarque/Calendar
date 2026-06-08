package org.example.goalcalendar.controller

import jakarta.validation.Valid
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.example.goalcalendar.service.GoalService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.time.LocalDate

data class CreateGoalRequest(
    @field:NotBlank @field:Size(max = 50) val label: String,
    @field:Min(1) val targetValue: Int,
    val date: String
)

data class UpdateGoalRequest(
    @field:Min(0) val currentValue: Int,
    @field:Size(max = 50) val label: String? = null,
    @field:Min(1) val targetValue: Int? = null
)

@RestController
@RequestMapping("/api/goals")
class GoalController(private val goalService: GoalService) {

    @GetMapping
    fun getGoals(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate,
        principal: Principal
    ) = goalService.getGoalsForDate(principal.name, date)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createGoal(@Valid @RequestBody req: CreateGoalRequest, principal: Principal) =
        goalService.createGoal(principal.name, req.label, req.targetValue, LocalDate.parse(req.date))

    @PutMapping("/{id}")
    fun updateGoal(
        @PathVariable id: String,
        @Valid @RequestBody req: UpdateGoalRequest,
        principal: Principal
    ) = goalService.updateGoal(id, principal.name, req)

    @PatchMapping("/{id}/carry")
    fun carryOver(@PathVariable id: String, principal: Principal) =
        goalService.manualCarryOver(id, principal.name)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteGoal(@PathVariable id: String, principal: Principal) =
        goalService.deleteGoal(id, principal.name)
}