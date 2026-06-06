package org.example.goalcalendar.repository

import org.example.goalcalendar.model.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, String> {
    fun findByEmail(email: String): User?
}