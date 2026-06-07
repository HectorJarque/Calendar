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
    * {
      box-sizing: border-box;
    }

    .layout {
      max-width: 960px;
      margin: 0 auto;
      padding: 1.5rem 1rem;
      background: #faf9f7;
      min-height: 100vh;
      font-family: 'Segoe UI', sans-serif;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .app-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: #3d3a56;
      letter-spacing: -0.3px;
    }

    .btn-logout {
      background: white;
      border: 1.5px solid #e8e4f0;
      color: #7c7a8a;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.15s;
    }

    .btn-logout:hover {
      background: #f5f0ff;
      border-color: #c4b5fd;
      color: #5b4ba0;
    }

    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .btn-nav {
      background: white;
      border: 1.5px solid #e8e4f0;
      color: #5b4ba0;
      padding: 0.4rem 1.1rem;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.15s;
    }

    .btn-nav:hover {
      background: #f0ebff;
    }

    .month-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #3d3a56;
    }

    .weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      margin-bottom: 0.5rem;
    }

    .weekdays span {
      font-size: 0.72rem;
      font-weight: 700;
      color: #a09db5;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 0.25rem 0;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
    }

    .day {
      min-height: 88px;
      border-radius: 12px;
      padding: 7px 6px 6px;
      cursor: pointer;
      transition: all 0.15s;
      background: white;
      border: 1.5px solid #eeebf5;
    }

    .day:hover {
      border-color: #c4b5fd;
      background: #faf7ff;
      transform: translateY(-1px);
    }

    .day.other-month {
      background: transparent;
      border-color: transparent;
      opacity: 0.4;
    }

    .day.other-month:hover {
      transform: none;
    }

    .day.today {
      border-color: #a78bfa;
      background: #faf7ff;
    }

    .day.selected {
      border-color: #7c3aed;
      background: #f5f0ff;
    }

    .day-num {
      font-size: 0.78rem;
      font-weight: 700;
      color: #5c5878;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .today .day-num {
      color: #7c3aed;
    }

    .today-dot {
      width: 5px;
      height: 5px;
      background: #7c3aed;
      border-radius: 50%;
      display: inline-block;
    }

    .pill {
      font-size: 0.62rem;
      font-weight: 600;
      border-radius: 5px;
      padding: 2px 5px;
      margin-bottom: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pill.pending {
      background: #ede9fe;
      color: #5b4ba0;
    }

    .pill.done {
      background: #d1fae5;
      color: #065f46;
    }

    .pill.carried {
      background: #fef3c7;
      color: #92400e;
    }

    .bar {
      height: 3px;
      background: #ede9fe;
      border-radius: 2px;
      margin-bottom: 3px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: #a78bfa;
      border-radius: 2px;
      transition: width 0.3s;
    }

    .bar-fill.done {
      background: #34d399;
    }

    /* MODAL — sin position:fixed, todo en flujo normal */
    .modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(60, 50, 80, 0.35);
      z-index: 200;
      pointer-events: all;
    }

    .modal-wrap {
      position: absolute;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      width: 92%;
      max-width: 420px;
      z-index: 201;
      pointer-events: all;
    }

    .modal {
      background: white;
      border-radius: 20px;
      border: 1.5px solid #e8e4f0;
      padding: 1.5rem;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .modal-title {
      font-size: 1rem;
      font-weight: 700;
      color: #3d3a56;
    }

    .btn-close-x {
      background: #f5f0ff;
      border: none;
      color: #7c3aed;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }

    .btn-close-x:hover {
      background: #ede9fe;
    }

    .goals-list {
      margin-bottom: 1.25rem;
    }

    .goal-item {
      background: #faf9fc;
      border: 1.5px solid #eeebf5;
      border-radius: 12px;
      padding: 10px 12px;
      margin-bottom: 8px;
    }

    .goal-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .goal-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #3d3a56;
    }

    .badge-carried {
      font-size: 0.65rem;
      background: #fef3c7;
      color: #92400e;
      padding: 1px 6px;
      border-radius: 10px;
      font-weight: 600;
    }

    .badge-done {
      font-size: 0.65rem;
      background: #d1fae5;
      color: #065f46;
      padding: 1px 6px;
      border-radius: 10px;
      font-weight: 600;
    }

    .goal-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .goal-controls input {
      width: 72px;
      padding: 5px 8px;
      border: 1.5px solid #e0dbf0;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #3d3a56;
      outline: none;
      text-align: center;
    }

    .goal-controls input:focus {
      border-color: #a78bfa;
    }

    .goal-max {
      font-size: 0.8rem;
      color: #a09db5;
    }

    .btn-save {
      background: #7c3aed;
      color: white;
      border: none;
      padding: 5px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      transition: background 0.15s;
    }

    .btn-save:hover {
      background: #6d28d9;
    }

    .btn-del {
      background: #fff0f0;
      color: #dc2626;
      border: 1.5px solid #fecaca;
      padding: 5px 10px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.15s;
    }

    .btn-del:hover {
      background: #fee2e2;
    }

    .goal-bar {
      height: 4px;
      background: #ede9fe;
      border-radius: 2px;
      margin-top: 6px;
      overflow: hidden;
    }

    .goal-bar-fill {
      height: 100%;
      background: #a78bfa;
      border-radius: 2px;
      transition: width 0.3s;
    }

    .goal-bar-fill.done {
      background: #34d399;
    }

    .empty-msg {
      text-align: center;
      color: #b0adc0;
      font-size: 0.85rem;
      padding: 1rem 0;
    }

    .divider {
      border: none;
      border-top: 1.5px solid #f0ebff;
      margin: 0 0 1.25rem;
    }

    .add-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #5b4ba0;
      margin-bottom: 0.75rem;
    }

    .add-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .add-form input {
      padding: 0.55rem 0.85rem;
      border: 1.5px solid #e0dbf0;
      border-radius: 10px;
      font-size: 0.9rem;
      color: #3d3a56;
      outline: none;
    }

    .add-form input:focus {
      border-color: #a78bfa;
    }

    .btn-add {
      background: #7c3aed;
      color: white;
      border: none;
      padding: 0.6rem;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      transition: background 0.15s;
    }

    .btn-add:hover {
      background: #6d28d9;
    }

    .btn-cancel {
      background: white;
      color: #7c7a8a;
      border: 1.5px solid #e0dbf0;
      padding: 0.5rem;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.85rem;
      margin-top: 2px;
    }

    .btn-cancel:hover {
      background: #f9f7ff;
    }
  `],
  template: `
    <div class="layout" style="position:relative">

      <header>
        <span class="app-title">📅 Goal Calendar</span>
        <button class="btn-logout" (click)="authService.logout()">Cerrar
          sesión
        </button>
      </header>

      <div class="nav">
        <button class="btn-nav" (click)="prevMonth()">← Anterior</button>
        <span class="month-title">{{ monthName }} {{ year }}</span>
        <button class="btn-nav" (click)="nextMonth()">Siguiente →</button>
      </div>

      <div class="weekdays">
        <span>Lun</span><span>Mar</span><span>Mié</span>
        <span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
      </div>

      <div class="grid">
        <div *ngFor="let day of calendarDays"
             class="day"
             [class.other-month]="!day.isCurrentMonth"
             [class.today]="day.isToday"
             [class.selected]="selectedDay?.dateStr === day.dateStr"
             (click)="selectDay(day)">
          <div class="day-num">
            {{ day.date.getDate() }}
            <span class="today-dot" *ngIf="day.isToday"></span>
          </div>
          <ng-container *ngFor="let g of day.goals">
            <div class="pill"
                 [class.done]="g.completed"
                 [class.carried]="g.carriedOver && !g.completed"
                 [class.pending]="!g.completed && !g.carriedOver">
              {{ g.label }}: {{ g.currentValue }}/{{ g.targetValue }}
            </div>
            <div class="bar">
              <div class="bar-fill"
                   [class.done]="g.completed"
                   [style.width.%]="pct(g)"></div>
            </div>
          </ng-container>
        </div>
      </div>

      <!-- Backdrop -->
      <div class="modal-backdrop"
           *ngIf="selectedDay"
           (click)="selectedDay = null"></div>

      <!-- Modal -->
      <div class="modal-wrap" *ngIf="selectedDay">
        <div class="modal" (click)="$event.stopPropagation()">

          <div class="modal-header">
            <span class="modal-title">{{ formatDate(selectedDay.date) }}</span>
            <button class="btn-close-x" (click)="selectedDay = null">✕</button>
          </div>

          <div class="goals-list">
            <div *ngFor="let g of selectedDay.goals" class="goal-item">
              <div class="goal-top">
                <span class="goal-name">{{ g.label }}</span>
                <span class="badge-carried"
                      *ngIf="g.carriedOver && !g.completed">↑ arrastrado</span>
                <span class="badge-done" *ngIf="g.completed">✓ Completado</span>
              </div>
              <div class="goal-controls">
                <input type="number"
                       [(ngModel)]="g.currentValue"
                       min="0"
                       [max]="g.targetValue"/>
                <span class="goal-max">/ {{ g.targetValue }}</span>
                <button class="btn-save" (click)="saveGoal(g)">Guardar</button>
                <button class="btn-del" (click)="deleteGoal(g)">Eliminar
                </button>
              </div>
              <div class="goal-bar">
                <div class="goal-bar-fill"
                     [class.done]="g.completed"
                     [style.width.%]="pct(g)"></div>
              </div>
            </div>
            <p class="empty-msg" *ngIf="selectedDay.goals.length === 0">Sin
              metas para este día</p>
          </div>

          <hr class="divider"/>

          <div class="add-title">Añadir meta</div>
          <div class="add-form">
            <input type="text"
                   [(ngModel)]="newLabel"
                   placeholder="Nombre (ej: Pasos)"
                   maxlength="50"/>
            <input type="number"
                   [(ngModel)]="newTarget"
                   placeholder="Objetivo (ej: 10000)"
                   min="1"/>
            <button class="btn-add" (click)="addGoal()">+ Añadir meta</button>
            <button class="btn-cancel" (click)="selectedDay = null">Cerrar
            </button>
          </div>

        </div>
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
    let startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const start = new Date(firstDay);
    start.setDate(start.getDate() - startDow);

    this.calendarDays = [];
    const d = new Date(start);
    for (let i = 0; i < 42; i++) {
      this.calendarDays.push({
        date: new Date(d),
        dateStr: this.toDateStr(d),
        isToday: this.toDateStr(d) === this.toDateStr(this.today),
        isCurrentMonth: d.getMonth() === this.currentMonth,
        goals: []
      });
      d.setDate(d.getDate() + 1);
    }
    this.loadMonthGoals();
  }

  loadMonthGoals() {
    this.calendarDays
      .filter(d => d.isCurrentMonth)
      .forEach(day => {
        this.goalService.getGoals(day.dateStr).subscribe({
          next: goals => day.goals = goals
        });
      });
  }

  selectDay(day: CalendarDay) {
    this.newLabel = '';
    this.newTarget = null;
    this.goalService.getGoals(day.dateStr).subscribe({
      next: goals => {
        day.goals = goals;
        this.selectedDay = { ...day, goals: [...goals] };
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
        this.selectedDay!.goals = [...this.selectedDay!.goals, g];
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
        const idx = this.selectedDay!.goals.findIndex(x => x.id === g.id);
        if (idx > -1) this.selectedDay!.goals[idx] = updated;
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

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else this.currentMonth--;
    this.selectedDay = null;
    this.buildCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else this.currentMonth++;
    this.selectedDay = null;
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
