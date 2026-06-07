package org.example.goalcalendar

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration
import org.springframework.boot.runApplication

@SpringBootApplication(exclude = [UserDetailsServiceAutoConfiguration::class])
class GoalCalendarApplication

fun main(args: Array<String>) {
	runApplication<GoalCalendarApplication>(*args)
}