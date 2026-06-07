import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoalService, Goal } from '../services/goal.service';
import { AuthService } from '../services/auth.service';

interface CalendarDay {
  date: Date;
  dateStr: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  goals: Goal[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  styles: [`
    .layout {
      max-width: 900px;
      margin: 0 auto;
      padding: 1rem;
      font-family: 'Segoe UI', sans-serif;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    h1 {
      font-size: 1.4rem;
      font-weight: 600;
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
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .nav button {
      background: #6366f1;
      color: white;
      border: none;
      padding: 0.4rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .month-title {
      font-size: 1.1rem;
      font-weight: 600;
    }

    .weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-size: 0.75rem;
      color: #888;
      margin-bottom: 0.5rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }

    .day {
      min-height: 80px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 6px;
      cursor: pointer;
      transition: background 0.15s;
      background: white;
    }

    .day:hover {
      background: #f5f3ff;
      border-color: #6366f1;
    }

    .day.other-month {
      background: #fafafa;
      opacity: 0.5;
    }

    .day.today {
      border-color: #6366f1;
      border-width: 2px;
    }

    .day.selected {
      background: #ede9fe;
      border-color: #6366f1;
    }

    .day-num {
      font-size: 0.8rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 4px;
    }

    .today .day-num {
      color: #6366f1;
    }

    .goal-pill {
      font-size: 0.65rem;
      background: #ede9fe;
      color: #4f46e5;
      border-radius: 4px;
      padding: 1px 4px;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .goal-pill.done {
      background: #dcfce7;
      color: #16a34a;
    }

    .goal-pill.carried {
      background: #fef3c7;
      color: #d97706;
    }

    /* Modal */
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .modal {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    }

    .modal h2 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #374151;
    }

    .modal-goals {
      margin-bottom: 1rem;
    }

    .goal-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      padding: 8px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .goal-row .label {
      flex: 1;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .goal-row .progress {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .goal-row input[type=number] {
      width: 70px;
      padding: 3px 6px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.85rem;
    }

    .goal-row .save {
      padding: 3px 8px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.75rem;
    }

    .goal-row .del {
      padding: 3px 6px;
      background: none;
      border: none;
      cursor: pointer;
      color: #dc2626;
      font-size: 0.9rem;
    }

    .carried-badge {
      font-size: 0.65rem;
      color: #d97706;
      margin-left: 4px;
    }

    .add-form {
      border-top: 1px solid #e5e7eb;
      padding-top: 1rem;
    }

    .add-form h3 {
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #374151;
    }

    .add-form input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      box-sizing: border-box;
    }

    .add-form input:focus {
      outline: none;
      border-color: #6366f1;
    }

    .form-row {
      display: flex;
      gap: 8px;
    }

    .form-row input {
      flex: 1;
    }

    .btn-add {
      width: 100%;
      padding: 0.6rem;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .btn-close {
      width: 100%;
      padding: 0.5rem;
      background: none;
      border: 1px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      color: #6b7280;
    }

    .progress-bar {
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      margin-top: 2px;
    }

    .progress-fill {
      height: 100%;
      background: #6366f1;
      border-radius: 2px;
      transition: width 0.3s;
    }

    .progress-fill.done {
      background: #16a34a;
    }
  `],
  template: `
    <div class="layout">
      <header>
        <h1>📅 Goal Calendar</h1>
        <button class="logout" (click)="authService.logout()">Cerrar sesión
        </button>
      </header>

      <div class="nav">
        <button (click)="prevMonth()">← Anterior</button>
        <span class="month-title">{{ monthName }} {{ year }}</span>
        <button (click)="nextMonth()">Siguiente →</button>
      </div>

      <div class="weekdays">
        <span>Lun</span><span>Mar</span><span>Mié</span>
        <span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
      </div>

      <div class="grid">
        <div
          *ngFor="let day of calendarDays"
          class="day"
          [class.other-month]="!day.isCurrentMonth"
          [class.today]="day.isToday"
          [class.selected]="selectedDay?.dateStr === day.dateStr"
          (click)="selectDay(day)">
          <div class="day-num">{{ day.date.getDate() }}</div>
          <div *ngFor="let g of day.goals">
            <div class="goal-pill"
                 [class.done]="g.completed"
                 [class.carried]="g.carriedOver">
              {{ g.label }}: {{ g.currentValue }}/{{ g.targetValue }}
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [class.done]="g.completed"
                   [style.width.%]="pct(g)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="overlay" *ngIf="selectedDay" (click)="closeModal($event)">
      <div class="modal" (click)="$event.stopPropagation()">
        <h2>{{ formatDate(selectedDay.date) }}</h2>

        <div class="modal-goals">
          <div *ngFor="let g of selectedDay.goals" class="goal-row">
            <div class="label">
              {{ g.label }}
              <span class="carried-badge"
                    *ngIf="g.carriedOver">↑ arrastrado</span>
            </div>
            <input type="number"
                   [(ngModel)]="g.currentValue"
                   min="0"
                   [max]="g.targetValue"/>
            <span class="progress">/ {{ g.targetValue }}</span>
            <button class="save" (click)="saveGoal(g)">✓</button>
            <button class="del" (click)="deleteGoal(g)">✕</button>
          </div>
          <p *ngIf="selectedDay.goals.length === 0"
             style="font-size:0.85rem;color:#9ca3af;text-align:center;padding:0.5rem 0">
            Sin metas para este día
          </p>
        </div>

        <div class="add-form">
          <h3>Añadir meta</h3>
          <input type="text"
                 [(ngModel)]="newLabel"
                 placeholder="Nombre (ej: Pasos)"
                 maxlength="50"/>
          <div class="form-row">
            <input type="number"
                   [(ngModel)]="newTarget"
                   placeholder="Objetivo (ej: 10000)"
                   min="1"/>
          </div>
          <button class="btn-add" (click)="addGoal()">+ Añadir</button>
        </div>

        <button class="btn-close" (click)="selectedDay = null">Cerrar</button>
      </div>
    </div>
  `
})
export class CalendarComponent implements OnInit {
  authService = inject(AuthService);
  private goalService = inject(GoalService);

  today = new Date();
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  calendarDays: CalendarDay[] = [];
  selectedDay: CalendarDay | null = null;
  newLabel = '';
  newTarget: number | null = null;

  monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  get monthName() {
    return this.monthNames[this.currentMonth];
  }

  get year() {
    return this.currentYear;
  }

  ngOnInit() {
    this.buildCalendar();
  }

  buildCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);

    // Lunes como primer día
    let startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const start = new Date(firstDay);
    start.setDate(start.getDate() - startDow);

    this.calendarDays = [];
    const d = new Date(start);

    for (let i = 0; i < 42; i++) {
      const dateStr = this.toDateStr(d);
      this.calendarDays.push({
        date: new Date(d),
        dateStr,
        isToday: dateStr === this.toDateStr(this.today),
        isCurrentMonth: d.getMonth() === this.currentMonth,
        goals: []
      });
      d.setDate(d.getDate() + 1);
    }

    // Cargar metas del mes
    this.loadMonthGoals();
  }

  loadMonthGoals() {
    const uniqueDates = this.calendarDays
      .filter(d => d.isCurrentMonth)
      .map(d => d.dateStr);

    uniqueDates.forEach(dateStr => {
      this.goalService.getGoals(dateStr).subscribe({
        next: goals => {
          const day = this.calendarDays.find(d => d.dateStr === dateStr);
          if (day) day.goals = goals;
        }
      });
    });
  }

  selectDay(day: CalendarDay) {
    this.selectedDay = day;
    this.newLabel = '';
    this.newTarget = null;
    this.goalService.getGoals(day.dateStr).subscribe({
      next: goals => {
        day.goals = goals;
        this.selectedDay = { ...day, goals };
      }
    });
  }

  addGoal() {
    if (!this.newLabel.trim() || !this.newTarget || this.newTarget < 1 || !this.selectedDay) return;
    this.goalService.createGoal({
      label: this.newLabel.trim(),
      targetValue: this.newTarget,
      date: this.selectedDay.dateStr
    }).subscribe({
      next: g => {
        this.selectedDay!.goals.push(g);
        const day = this.calendarDays.find(d => d.dateStr === this.selectedDay!.dateStr);
        if (day) day.goals = [...this.selectedDay!.goals];
        this.newLabel = '';
        this.newTarget = null;
      }
    });
  }

  saveGoal(g: Goal) {
    this.goalService.updateGoal(g.id, g.currentValue).subscribe({
      next: updated => {
        Object.assign(g, updated);
        const day = this.calendarDays.find(d => d.dateStr === this.selectedDay?.dateStr);
        if (day) day.goals = [...this.selectedDay!.goals];
      }
    });
  }

  deleteGoal(g: Goal) {
    this.goalService.deleteGoal(g.id).subscribe({
      next: () => {
        this.selectedDay!.goals = this.selectedDay!.goals.filter(x => x.id !== g.id);
        const day = this.calendarDays.find(d => d.dateStr === this.selectedDay!.dateStr);
        if (day) day.goals = [...this.selectedDay!.goals];
      }
    });
  }

  closeModal(event: MouseEvent) {
    this.selectedDay = null;
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else this.currentMonth--;
    this.buildCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else this.currentMonth++;
    this.buildCalendar();
  }

  pct(g: Goal) {
    return Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
  }

  toDateStr(d: Date) {
    return d.toISOString().split('T')[0];
  }

  formatDate(d: Date) {
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }
}
