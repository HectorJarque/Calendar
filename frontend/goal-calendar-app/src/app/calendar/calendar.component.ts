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
  completedCount: number;
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
      transition: all 0.15s;
      display: flex;
      flex-direction: column;
    }

    .day:hover {
      border-color: #f472b6;
      background: #fdf2f8;
    }

    .day.other-month {
      background: transparent;
      border-color: transparent;
      opacity: 0.3;
      pointer-events: none;
    }

    .day.today {
      border-color: #ec4899;
      border-width: 2.5px;
      background: #fff0f9;
      box-shadow: 0 0 0 3px #fce7f3;
    }

    .day.selected {
      background: #fce7f3;
      border-color: #db2777;
    }

    .day-num {
      font-size: 0.78rem;
      font-weight: 700;
      color: #9d174d;
      margin-bottom: 4px;
    }

    .today-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background: #ec4899;
      color: white;
      border-radius: 50%;
      font-size: 0.7rem;
      font-weight: 800;
    }

    .day-dots {
      display: flex;
      gap: 3px;
      flex-wrap: wrap;
      margin-top: auto;
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

    .dot.carried {
      background: #fcd34d;
    }

    /* OVERLAY */
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(157, 23, 77, 0.2);
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
      max-width: 440px;
      max-height: 88vh;
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
      font-size: 1rem;
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

    .loading {
      text-align: center;
      color: #f9a8d4;
      font-size: 0.85rem;
      padding: 1.5rem 0;
      font-weight: 600;
    }

    /* GOAL CARD */
    .goal-card {
      border-radius: 12px;
      padding: 10px 12px;
      margin-bottom: 8px;
      border: 1.5px solid #fce7f3;
    }

    .goal-card.normal {
      background: #fff5f9;
    }

    .goal-card.carried-card {
      background: #fffbeb;
      border-color: #fde68a;
    }

    .goal-card.done-card {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .gc-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 6px;
      margin-bottom: 8px;
    }

    .gc-name {
      font-size: 0.88rem;
      font-weight: 700;
      color: #831843;
      flex: 1;
    }

    .gc-name input {
      font-size: 0.85rem;
      font-weight: 700;
      color: #831843;
      border: 1.5px solid #fbcfe8;
      border-radius: 8px;
      padding: 3px 7px;
      outline: none;
      width: 100%;
    }

    .gc-name input:focus {
      border-color: #ec4899;
    }

    .badges {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .badge {
      font-size: 0.62rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 10px;
      white-space: nowrap;
    }

    .b-done {
      background: #d1fae5;
      color: #065f46;
    }

    .b-carried {
      background: #fef3c7;
      color: #92400e;
    }

    .gc-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 7px;
      flex-wrap: wrap;
    }

    .gc-input {
      width: 65px;
      padding: 5px 7px;
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

    .gc-target {
      width: 65px;
      padding: 5px 7px;
      border: 1.5px solid #fde68a;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #92400e;
      text-align: center;
      outline: none;
    }

    .gc-target:focus {
      border-color: #f59e0b;
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
      padding: 5px 10px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .btn-save:hover {
      background: #db2777;
    }

    .btn-carry {
      background: #fef3c7;
      color: #92400e;
      border: 1.5px solid #fde68a;
      padding: 5px 8px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .btn-carry:hover {
      background: #fde68a;
    }

    .btn-edit {
      background: #f0f9ff;
      color: #0369a1;
      border: 1.5px solid #bae6fd;
      padding: 5px 8px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .btn-edit:hover {
      background: #e0f2fe;
    }

    .btn-del {
      background: white;
      color: #e11d48;
      border: 1.5px solid #fecdd3;
      padding: 5px 8px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.72rem;
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
      margin-top: 2px;
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

    .gc-fill.carried {
      background: #fbbf24;
    }

    .carried-info {
      font-size: 0.72rem;
      color: #92400e;
      margin-top: 4px;
      font-weight: 600;
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
             [class.selected]="selectedDay?.dateStr === day.dateStr"
             (click)="selectDay(day)">
          <div class="day-num">
            <span class="today-badge"
                  *ngIf="day.isToday">{{ day.date.getDate() }}</span>
            <span *ngIf="!day.isToday">{{ day.date.getDate() }}</span>
          </div>
          <div class="day-dots" *ngIf="day.goalCount > 0">
            <span *ngFor="let i of arr(day.goalCount); let idx = index"
                  class="dot"
                  [class.done]="idx < day.completedCount"
                  [class.carried]="idx >= day.completedCount"></span>
          </div>
        </div>
      </div>
    </div>

    <div class="overlay" *ngIf="selectedDay" (click)="onOverlayClick($event)">
      <div class="modal" (click)="$event.stopPropagation()">

        <div class="modal-head">
          <span class="modal-date">{{ formatDate(selectedDay.date) }}</span>
          <button class="btn-x" (click)="selectedDay = null">✕</button>
        </div>

        <div *ngIf="loadingModal" class="loading">Cargando metas... 🌸</div>

        <ng-container *ngIf="!loadingModal">

          <div *ngFor="let g of modalGoals"
               class="goal-card"
               [class.done-card]="g.completed"
               [class.carried-card]="g.carriedOver && !g.completed"
               [class.normal]="!g.completed && !g.carriedOver">

            <div class="gc-top">
              <div class="gc-name">
                <input *ngIf="editingId === g.id"
                       type="text"
                       [(ngModel)]="editLabel"/>
                <span *ngIf="editingId !== g.id">{{ g.label }}</span>
              </div>
              <div class="badges">
                <span class="badge b-carried"
                      *ngIf="g.carriedOver && !g.completed">↑ arrastrado</span>
                <span class="badge b-done"
                      *ngIf="g.completed">✓ completado</span>
              </div>
            </div>

            <div class="gc-row">
              <input class="gc-input"
                     type="number"
                     [(ngModel)]="g.currentValue"
                     min="0"/>
              <span *ngIf="editingId !== g.id"
                    class="gc-max">/ {{ g.targetValue }}</span>
              <input *ngIf="editingId === g.id"
                     class="gc-target"
                     type="number"
                     [(ngModel)]="editTarget"
                     min="1"/>
              <button class="btn-save" (click)="saveGoal(g)">Guardar</button>
              <button class="btn-edit" (click)="toggleEdit(g)">
                {{ editingId === g.id ? 'Cancelar' : 'Editar' }}
              </button>
              <button class="btn-carry"
                      *ngIf="!g.carriedOver && !g.completed"
                      (click)="carryOver(g)"
                      title="Arrastrar al día siguiente">↑ Arrastrar
              </button>
              <button class="btn-del" (click)="deleteGoal(g)">Eliminar</button>
            </div>

            <div class="gc-bar">
              <div class="gc-fill"
                   [class.done]="g.completed"
                   [class.carried]="g.carriedOver && !g.completed"
                   [style.width.%]="pct(g)"></div>
            </div>

            <div class="carried-info" *ngIf="g.carriedOver && !g.completed">
              Meta arrastrada de un día anterior —
              quedan {{ g.targetValue - g.currentValue }} por completar
            </div>
          </div>

          <p class="empty" *ngIf="modalGoals.length === 0">Sin metas para este
            día — ¡añade una!</p>

          <hr class="sep"/>
          <div class="add-label">+ Nueva meta</div>
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

  editingId: string | null = null;
  editLabel = '';
  editTarget = 0;

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
    // Carga automática del día de hoy
    const todayDay = this.calendarDays.find(d => d.isToday);
    if (todayDay) this.selectDay(todayDay);
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
        completedCount: 0
      });
      d.setDate(d.getDate() + 1);
    }
  }

  selectDay(day: CalendarDay) {
    if (!day.isCurrentMonth) return;
    this.selectedDay = day;
    this.modalGoals = [];
    this.loadingModal = true;
    this.editingId = null;
    this.newLabel = '';
    this.newTarget = null;

    this.goalService.getGoals(day.dateStr).subscribe({
      next: goals => {
        this.modalGoals = goals;
        this.loadingModal = false;
        day.goalCount = goals.length;
        day.completedCount = goals.filter(g => g.completed).length;
      },
      error: () => this.loadingModal = false
    });
  }

  toggleEdit(g: Goal) {
    if (this.editingId === g.id) {
      this.editingId = null;
    } else {
      this.editingId = g.id;
      this.editLabel = g.label;
      this.editTarget = g.targetValue;
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
        this.updateDayDots();
        this.newLabel = '';
        this.newTarget = null;
      }
    });
  }

  saveGoal(g: Goal) {
    const label = this.editingId === g.id ? this.editLabel : undefined;
    const targetValue = this.editingId === g.id ? this.editTarget : undefined;

    this.goalService.updateGoal(g.id, g.currentValue, label, targetValue).subscribe({
      next: updated => {
        const i = this.modalGoals.findIndex(x => x.id === g.id);
        if (i > -1) this.modalGoals[i] = updated;
        this.editingId = null;
        this.updateDayDots();
      }
    });
  }

  carryOver(g: Goal) {
    this.goalService.carryOver(g.id).subscribe({
      next: updated => {
        const i = this.modalGoals.findIndex(x => x.id === g.id);
        if (i > -1) this.modalGoals[i] = updated;
        this.updateDayDots();
      }
    });
  }

  deleteGoal(g: Goal) {
    this.goalService.deleteGoal(g.id).subscribe({
      next: () => {
        this.modalGoals = this.modalGoals.filter(x => x.id !== g.id);
        this.updateDayDots();
      }
    });
  }

  updateDayDots() {
    if (!this.selectedDay) return;
    const day = this.calendarDays.find(d => d.dateStr === this.selectedDay!.dateStr);
    if (day) {
      day.goalCount = this.modalGoals.length;
      day.completedCount = this.modalGoals.filter(g => g.completed).length;
    }
  }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('overlay')) {
      this.selectedDay = null;
    }
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
