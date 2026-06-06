package org.example.goalcalendar

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class GoalCalendarApplication

fun main(args: Array<String>) {
	runApplication<GoalCalendarApplication>(*args)
}