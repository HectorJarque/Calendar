import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { GoalService, Goal } from '../services/goal.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, DatePipe],
  styles: [`
    .layout {
      max-width: 700px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    h1 {
      font-size: 1.4rem;
    }

    .logout {
      background: none;
      border: 1px solid #ddd;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      cursor: pointer;
    }

    .nav {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .nav button {
      background: #6366f1;
      color: white;
      border: none;
      padding: 0.4rem 1rem;
      border-radius: 6px;
      cursor: pointer;
    }

    .nav span {
      font-weight: 500;
    }

    .add-form {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .add-form input[type=text] {
      flex: 2;
      min-width: 120px;
    }

    .add-form input[type=number] {
      flex: 1;
      min-width: 80px;
    }

    .add-form input {
      padding: 0.6rem 0.8rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.95rem;
    }

    .add-form button {
      padding: 0.6rem 1.2rem;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }

    .goal {
      background: white;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 0.75rem;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    }

    .goal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .goal-label {
      font-weight: 500;
    }

    .carried {
      font-size: 0.75rem;
      color: #f59e0b;
      margin-left: 0.5rem;
    }

    .done {
      color: #16a34a;
      font-size: 0.85rem;
    }

    .progress-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #6366f1;
      border-radius: 4px;
      transition: width 0.3s;
    }

    .progress-fill.complete {
      background: #16a34a;
    }

    input.progress-input {
      width: 80px;
      padding: 0.3rem 0.5rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .save-btn {
      padding: 0.3rem 0.7rem;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .empty {
      text-align: center;
      color: #9ca3af;
      margin-top: 3rem;
    }
  `],
  template: `
    <div class="layout">
      <header>
        <h1>📅 Goal Calendar</h1>
        <button class="logout" (click)="auth.logout()">Cerrar sesión</button>
      </header>

      <div class="nav">
        <button (click)="changeDay(-1)">← Anterior</button>
        <span>{{ currentDate | date:'EEEE, d MMMM yyyy':'':'es' }}</span>
        <button (click)="changeDay(1)" [disabled]="isToday()">Siguiente →
        </button>
      </div>

      <div class="add-form">
        <input type="text"
               [(ngModel)]="newLabel"
               placeholder="Nombre (ej: Pasos)"
               maxlength="50"/>
        <input type="number"
               [(ngModel)]="newTarget"
               placeholder="Objetivo"
               min="1"/>
        <button (click)="addGoal()">+ Añadir</button>
      </div>

      <div *ngFor="let g of goals" class="goal">
        <div class="goal-header">
          <span class="goal-label">
            {{ g.label }}
            <span class="carried" *ngIf="g.carriedOver">↑ arrastrado</span>
          </span>
          <span class="done" *ngIf="g.completed">✓ Completado</span>
        </div>
        <div class="progress-row">
          <div class="progress-bar">
            <div class="progress-fill" [class.complete]="g.completed"
                 [style.width.%]="progressPct(g)"></div>
          </div>
          <input class="progress-input"
                 type="number"
                 [(ngModel)]="g.currentValue"
                 min="0"
                 [max]="g.targetValue"/>
          <span style="font-size:0.85rem;color:#6b7280">/ {{ g.targetValue }}</span>
          <button class="save-btn" (click)="saveGoal(g)">Guardar</button>
        </div>
      </div>

      <p class="empty" *ngIf="goals.length === 0 && !loading">No hay metas para
        este día. ¡Añade una!</p>
    </div>
  `
})
export class CalendarComponent implements OnInit {
  auth = inject(AuthService);
  private goalService = inject(GoalService);

  currentDate = new Date();
  goals: Goal[] = [];
  loading = false;
  newLabel = '';
  newTarget: number | null = null;

  ngOnInit() {
    this.loadGoals();
  }

  loadGoals() {
    this.loading = true;
    this.goalService.getGoals(this.dateStr()).subscribe({
      next: g => {
        this.goals = g;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  changeDay(delta: number) {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + delta);
    this.currentDate = d;
    this.loadGoals();
  }

  isToday() {
    const t = new Date();
    return this.currentDate.toDateString() === t.toDateString();
  }

  addGoal() {
    if (!this.newLabel.trim() || !this.newTarget || this.newTarget < 1) return;
    this.goalService.createGoal({
      label: this.newLabel.trim(),
      targetValue: this.newTarget,
      date: this.dateStr()
    })
      .subscribe({
        next: g => {
          this.goals.push(g);
          this.newLabel = '';
          this.newTarget = null;
        }
      });
  }

  saveGoal(g: Goal) {
    this.goalService.updateGoal(g.id, g.currentValue).subscribe({
      next: updated => Object.assign(g, updated)
    });
  }

  progressPct(g: Goal) {
    return Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
  }

  private dateStr() {
    return this.currentDate.toISOString().split('T')[0];
  }
}
