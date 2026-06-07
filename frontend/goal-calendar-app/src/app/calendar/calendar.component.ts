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
  goalCount: number;
  hasCompleted: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  styles: [`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .page {
      min-height: 100vh;
      background: #fff0f6;
      padding: 1.5rem 1rem;
      font-family: 'Segoe UI', sans-serif;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.75rem;
    }

    .title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #9d174d;
      letter-spacing: -0.5px;
    }

    .btn-logout {
      background: white;
      border: 1.5px solid #fbcfe8;
      color: #be185d;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 600;
    }

    .btn-logout:hover {
      background: #fce7f3;
    }

    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .btn-nav {
      background: white;
      border: 1.5px solid #fbcfe8;
      color: #be185d;
      padding: 0.4rem 1.1rem;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .btn-nav:hover {
      background: #fdf2f8;
    }

    .month-label {
      font-size: 1.05rem;
      font-weight: 800;
      color: #9d174d;
    }

    .weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      margin-bottom: 6px;
    }

    .weekdays span {
      font-size: 0.7rem;
      font-weight: 700;
      color: #f9a8d4;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 0;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
    }

    .day {
      min-height: 72px;
      background: white;
      border: 1.5px solid #fce7f3;
      border-radius: 12px;
      padding: 7px 6px;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .day:hover {
      border-color: #f472b6;
      background: #fdf2f8;
    }

    .day.other-month {
      background: transparent;
      border-color: transparent;
      opacity: 0.35;
      cursor: default;
    }

    .day.other-month:hover {
      background: transparent;
      border-color: transparent;
    }

    .day.today {
      border-color: #ec4899;
      border-width: 2px;
      background: #fdf2f8;
    }

    .day-num {
      font-size: 0.78rem;
      font-weight: 700;
      color: #831843;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .today-ring {
      width: 18px;
      height: 18px;
      background: #ec4899;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 800;
    }

    .dots {
      display: flex;
      gap: 3px;
      flex-wrap: wrap;
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #f9a8d4;
    }

    .dot.done {
      background: #6ee7b7;
    }

    /* OVERLAY FIXED */
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(157, 23, 77, 0.18);
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal {
      background: white;
      border-radius: 20px;
      border: 2px solid #fbcfe8;
      width: 100%;
      max-width: 420px;
      max-height: 85vh;
      overflow-y: auto;
      padding: 1.5rem;
    }

    .modal-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .modal-date {
      font-size: 0.95rem;
      font-weight: 800;
      color: #9d174d;
    }

    .btn-x {
      width: 28px;
      height: 28px;
      background: #fce7f3;
      border: none;
      border-radius: 50%;
      color: #be185d;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      flex-shrink: 0;
    }

    .btn-x:hover {
      background: #fbcfe8;
    }

    .goal-card {
      background: #fff5f9;
      border: 1.5px solid #fce7f3;
      border-radius: 12px;
      padding: 10px 12px;
      margin-bottom: 8px;
    }

    .gc-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      gap: 8px;
    }

    .gc-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: #831843;
      flex: 1;
    }

    .badge {
      font-size: 0.62rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 10px;
      white-space: nowrap;
    }

    .badge-done {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-carried {
      background: #fef3c7;
      color: #92400e;
    }

    .gc-row {
      display: flex;
      align-items: center;
      gap: 7px;
      margin-bottom: 7px;
    }

    .gc-input {
      width: 68px;
      padding: 5px 8px;
      border: 1.5px solid #fbcfe8;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #831843;
      text-align: center;
      outline: none;
    }

    .gc-input:focus {
      border-color: #ec4899;
    }

    .gc-max {
      font-size: 0.8rem;
      color: #f9a8d4;
      font-weight: 600;
    }

    .btn-save {
      background: #ec4899;
      color: white;
      border: none;
      padding: 5px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .btn-save:hover {
      background: #db2777;
    }

    .btn-del {
      background: white;
      color: #e11d48;
      border: 1.5px solid #fecdd3;
      padding: 5px 10px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .btn-del:hover {
      background: #fff1f2;
    }

    .gc-bar {
      height: 5px;
      background: #fce7f3;
      border-radius: 3px;
      overflow: hidden;
    }

    .gc-fill {
      height: 100%;
      background: #f472b6;
      border-radius: 3px;
      transition: width 0.3s;
    }

    .gc-fill.done {
      background: #34d399;
    }

    .empty {
      text-align: center;
      color: #f9a8d4;
      font-size: 0.85rem;
      padding: 0.75rem 0;
      font-weight: 600;
    }

    .sep {
      border: none;
      border-top: 1.5px solid #fce7f3;
      margin: 1rem 0;
    }

    .add-label {
      font-size: 0.82rem;
      font-weight: 800;
      color: #be185d;
      margin-bottom: 0.6rem;
    }

    .field {
      width: 100%;
      padding: 0.55rem 0.85rem;
      border: 1.5px solid #fbcfe8;
      border-radius: 10px;
      font-size: 0.9rem;
      color: #831843;
      background: white;
      outline: none;
      margin-bottom: 8px;
      display: block;
    }

    .field:focus {
      border-color: #ec4899;
    }

    .field::placeholder {
      color: #f9a8d4;
    }

    .btn-add {
      width: 100%;
      background: #ec4899;
      color: white;
      border: none;
      padding: 0.6rem;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .btn-add:hover {
      background: #db2777;
    }

    .btn-close {
      width: 100%;
      background: white;
      color: #be185d;
      border: 1.5px solid #fbcfe8;
      padding: 0.5rem;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .btn-close:hover {
      background: #fdf2f8;
    }
  `],
  template: `
    <div class="page">
      <header>
        <span class="title">🌸 Goal Calendar</span>
        <button class="btn-logout" (click)="authService.logout()">Cerrar
          sesión
        </button>
      </header>

      <div class="nav">
        <button class="btn-nav" (click)="prevMonth()">← Anterior</button>
        <span class="month-label">{{ monthName }} {{ year }}</span>
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
             (click)="day.isCurrentMonth && selectDay(day)">
          <div class="day-num">
            <span class="today-ring"
                  *ngIf="day.isToday">{{ day.date.getDate() }}</span>
            <span *ngIf="!day.isToday">{{ day.date.getDate() }}</span>
          </div>
          <div class="dots" *ngIf="day.goalCount > 0">
            <span *ngFor="let g of arr(day.goalCount); let i = index"
                  class="dot" [class.done]="day.hasCompleted && i === 0"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- OVERLAY -->
    <div class="overlay" *ngIf="selectedDay" (click)="closeIfBackdrop($event)">
      <div class="modal" (click)="$event.stopPropagation()">

        <div class="modal-head">
          <span class="modal-date">{{ formatDate(selectedDay.date) }}</span>
          <button class="btn-x" (click)="selectedDay = null">✕</button>
        </div>

        <ng-container *ngIf="!loadingModal; else loading">

          <div *ngFor="let g of modalGoals" class="goal-card">
            <div class="gc-top">
              <span class="gc-name">{{ g.label }}</span>
              <span class="badge badge-carried"
                    *ngIf="g.carriedOver && !g.completed">↑ arrastrado</span>
              <span class="badge badge-done" *ngIf="g.completed">✓ listo</span>
            </div>
            <div class="gc-row">
              <input class="gc-input"
                     type="number"
                     [(ngModel)]="g.currentValue"
                     min="0"
                     [max]="g.targetValue"/>
              <span class="gc-max">/ {{ g.targetValue }}</span>
              <button class="btn-save" (click)="saveGoal(g)">Guardar</button>
              <button class="btn-del" (click)="deleteGoal(g)">Eliminar</button>
            </div>
            <div class="gc-bar">
              <div class="gc-fill"
                   [class.done]="g.completed"
                   [style.width.%]="pct(g)"></div>
            </div>
          </div>

          <p class="empty" *ngIf="modalGoals.length === 0">Sin metas para este
            día</p>

          <hr class="sep"/>
          <div class="add-label">+ Añadir nueva meta</div>
          <input class="field"
                 type="text"
                 [(ngModel)]="newLabel"
                 placeholder="Nombre (ej: Pasos, Agua...)"
                 maxlength="50"/>
          <input class="field"
                 type="number"
                 [(ngModel)]="newTarget"
                 placeholder="Objetivo (ej: 10000)"
                 min="1"/>
          <button class="btn-add" (click)="addGoal()">Añadir meta</button>
          <button class="btn-close" (click)="selectedDay = null">Cerrar</button>

        </ng-container>

        <ng-template #loading>
          <p class="empty">Cargando...</p>
        </ng-template>

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
  modalGoals: Goal[] = [];
  loadingModal = false;
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
    let dow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const start = new Date(firstDay);
    start.setDate(start.getDate() - dow);

    this.calendarDays = [];
    const d = new Date(start);
    for (let i = 0; i < 42; i++) {
      this.calendarDays.push({
        date: new Date(d),
        dateStr: this.toStr(d),
        isToday: this.toStr(d) === this.toStr(this.today),
        isCurrentMonth: d.getMonth() === this.currentMonth,
        goalCount: 0,
        hasCompleted: false
      });
      d.setDate(d.getDate() + 1);
    }
  }

  selectDay(day: CalendarDay) {
    this.selectedDay = day;
    this.modalGoals = [];
    this.loadingModal = true;
    this.newLabel = '';
    this.newTarget = null;

    this.goalService.getGoals(day.dateStr).subscribe({
      next: goals => {
        this.modalGoals = goals;
        this.loadingModal = false;
        day.goalCount = goals.length;
        day.hasCompleted = goals.some(g => g.completed);
      },
      error: () => this.loadingModal = false
    });
  }

  closeIfBackdrop(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('overlay')) {
      this.selectedDay = null;
    }
  }

  addGoal() {
    if (!this.newLabel.trim() || !this.newTarget || this.newTarget < 1 || !this.selectedDay) return;
    this.goalService.createGoal({
      label: this.newLabel.trim(),
      targetValue: this.newTarget,
      date: this.selectedDay.dateStr
    }).subscribe({
      next: g => {
        this.modalGoals = [...this.modalGoals, g];
        this.selectedDay!.goalCount = this.modalGoals.length;
        this.newLabel = '';
        this.newTarget = null;
      }
    });
  }

  saveGoal(g: Goal) {
    this.goalService.updateGoal(g.id, g.currentValue).subscribe({
      next: updated => {
        const i = this.modalGoals.findIndex(x => x.id === g.id);
        if (i > -1) this.modalGoals[i] = updated;
        this.selectedDay!.hasCompleted = this.modalGoals.some(x => x.completed);
      }
    });
  }

  deleteGoal(g: Goal) {
    this.goalService.deleteGoal(g.id).subscribe({
      next: () => {
        this.modalGoals = this.modalGoals.filter(x => x.id !== g.id);
        this.selectedDay!.goalCount = this.modalGoals.length;
        this.selectedDay!.hasCompleted = this.modalGoals.some(x => x.completed);
      }
    });
  }

  prevMonth() {
    this.selectedDay = null;
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else this.currentMonth--;
    this.buildCalendar();
  }

  nextMonth() {
    this.selectedDay = null;
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else this.currentMonth++;
    this.buildCalendar();
  }

  arr(n: number) {
    return Array(Math.min(n, 5));
  }

  pct(g: Goal) {
    return Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
  }

  toStr(d: Date) {
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
