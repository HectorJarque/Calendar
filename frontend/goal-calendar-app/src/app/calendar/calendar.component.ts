import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
      font-family: 'Segoe UI', system-ui, sans-serif;
    }

    /* HEADER */
    .topbar {
      background: white;
      border-bottom: 1.5px solid #fce7f3;
      padding: 0.9rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #9d174d;
    }

    .btn-logout {
      background: #fce7f3;
      border: none;
      color: #be185d;
      padding: 0.4rem 0.9rem;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 700;
      -webkit-tap-highlight-color: transparent;
    }

    /* NAV */
    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.9rem 1rem 0.5rem;
    }

    .btn-nav {
      background: white;
      border: 1.5px solid #fbcfe8;
      color: #be185d;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-tap-highlight-color: transparent;
    }

    .btn-nav:active {
      background: #fce7f3;
    }

    .month-label {
      font-size: 1rem;
      font-weight: 800;
      color: #9d174d;
    }

    /* WEEKDAYS */
    .weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      padding: 0 0.75rem;
      margin-bottom: 4px;
    }

    .weekdays span {
      text-align: center;
      font-size: 0.65rem;
      font-weight: 700;
      color: #f9a8d4;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      padding: 4px 0;
    }

    /* GRID */
    .grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      padding: 0 0.75rem 1rem;
    }

    .day {
      aspect-ratio: 1;
      background: white;
      border: 1.5px solid #fce7f3;
      border-radius: 10px;
      padding: 4px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      -webkit-tap-highlight-color: transparent;
      transition: border-color 0.1s;
      position: relative;
      overflow: hidden;
    }

    .day:active {
      background: #fdf2f8;
    }

    .day.other-month {
      background: transparent;
      border-color: transparent;
      pointer-events: none;
      opacity: 0.2;
    }

    .day.today {
      border-color: #ec4899;
      border-width: 2px;
      background: #fff5f9;
    }

    .day.selected {
      background: #fce7f3;
      border-color: #db2777;
      border-width: 2px;
    }

    .day-num {
      font-size: 0.72rem;
      font-weight: 700;
      color: #9d174d;
      line-height: 1;
      margin-bottom: 3px;
    }

    .today-circle {
      width: 18px;
      height: 18px;
      background: #ec4899;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: 800;
      margin-bottom: 3px;
    }

    .day-bar {
      width: 100%;
      height: 3px;
      background: #fce7f3;
      border-radius: 2px;
      overflow: hidden;
      margin-top: auto;
    }

    .day-bar-fill {
      height: 100%;
      border-radius: 2px;
      background: #f472b6;
      transition: width 0.3s;
    }

    .day-bar-fill.all-done {
      background: #34d399;
    }

    .day-count {
      font-size: 0.58rem;
      color: #f9a8d4;
      font-weight: 700;
      margin-top: 2px;
    }

    .day-count.has-goals {
      color: #be185d;
    }

    /* OVERLAY */
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(100, 20, 60, 0.25);
      z-index: 999;
      display: flex;
      align-items: flex-end;
      padding: 0;
    }

    @media (min-width: 600px) {
      .overlay {
        align-items: center;
        padding: 1rem;
      }
      .modal {
        border-radius: 20px !important;
        max-height: 85vh !important;
      }
    }

    .modal {
      background: white;
      border-radius: 20px 20px 0 0;
      border-top: 2px solid #fbcfe8;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      max-height: 90vh;
      overflow-y: auto;
      padding: 0 1rem 2rem;
      animation: slideUp 0.2s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-handle {
      width: 36px;
      height: 4px;
      background: #fbcfe8;
      border-radius: 2px;
      margin: 0.75rem auto 1rem;
    }

    .modal-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding: 0 0.25rem;
    }

    .modal-date {
      font-size: 0.95rem;
      font-weight: 800;
      color: #9d174d;
    }

    .btn-x {
      width: 30px;
      height: 30px;
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
    }

    .loading {
      text-align: center;
      color: #f9a8d4;
      font-size: 0.9rem;
      padding: 2rem 0;
    }

    /* SUMMARY */
    .summary {
      display: flex;
      gap: 8px;
      margin-bottom: 1rem;
    }

    .sum-chip {
      flex: 1;
      padding: 0.6rem;
      border-radius: 12px;
      text-align: center;
    }

    .sum-chip.total {
      background: #fff0f6;
      border: 1.5px solid #fce7f3;
    }

    .sum-chip.done {
      background: #f0fdf4;
      border: 1.5px solid #bbf7d0;
    }

    .sum-chip.pending {
      background: #fffbeb;
      border: 1.5px solid #fde68a;
    }

    .sum-num {
      font-size: 1.3rem;
      font-weight: 800;
      display: block;
    }

    .sum-chip.total .sum-num {
      color: #be185d;
    }

    .sum-chip.done .sum-num {
      color: #065f46;
    }

    .sum-chip.pending .sum-num {
      color: #92400e;
    }

    .sum-label {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      opacity: 0.7;
    }

    /* GOAL CARD */
    .goal-card {
      border-radius: 14px;
      padding: 12px 14px;
      margin-bottom: 8px;
      border: 1.5px solid #fce7f3;
      background: #fff5f9;
    }

    .goal-card.done-card {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .gc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .gc-label {
      font-size: 0.9rem;
      font-weight: 700;
      color: #831843;
    }

    .gc-label-input {
      font-size: 0.9rem;
      font-weight: 700;
      color: #831843;
      border: 1.5px solid #fbcfe8;
      border-radius: 8px;
      padding: 3px 8px;
      outline: none;
      width: 100%;
    }

    .gc-label-input:focus {
      border-color: #ec4899;
    }

    .badge-done {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 10px;
      background: #d1fae5;
      color: #065f46;
    }

    .badge-pend {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 10px;
      background: #fce7f3;
      color: #9d174d;
    }

    .gc-progress {
      margin-bottom: 10px;
    }

    .gc-bar {
      height: 6px;
      background: #fce7f3;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .gc-fill {
      height: 100%;
      border-radius: 3px;
      background: #f472b6;
      transition: width 0.3s;
    }

    .gc-fill.done {
      background: #34d399;
    }

    .gc-pct {
      font-size: 0.7rem;
      color: #be185d;
      font-weight: 700;
    }

    .gc-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .gc-input {
      flex: 1;
      padding: 8px 10px;
      border: 1.5px solid #fbcfe8;
      border-radius: 10px;
      font-size: 0.95rem;
      color: #831843;
      text-align: center;
      outline: none;
      min-width: 0;
    }

    .gc-input:focus {
      border-color: #ec4899;
    }

    .gc-sep {
      color: #f9a8d4;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .gc-target-input {
      flex: 1;
      padding: 8px 10px;
      border: 1.5px solid #fde68a;
      border-radius: 10px;
      font-size: 0.95rem;
      color: #92400e;
      text-align: center;
      outline: none;
      min-width: 0;
    }

    .gc-target-val {
      font-size: 0.85rem;
      color: #f9a8d4;
      font-weight: 600;
      white-space: nowrap;
    }

    .gc-actions {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }

    .btn-sm {
      flex: 1;
      padding: 8px 4px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 700;
      border: none;
      -webkit-tap-highlight-color: transparent;
    }

    .btn-save-sm {
      background: #ec4899;
      color: white;
    }

    .btn-save-sm:active {
      background: #db2777;
    }

    .btn-edit-sm {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1.5px solid #bfdbfe !important;
    }

    .btn-del-sm {
      background: #fff1f2;
      color: #e11d48;
      border: 1.5px solid #fecdd3 !important;
    }

    .empty {
      text-align: center;
      color: #f9a8d4;
      font-size: 0.9rem;
      padding: 1.5rem 0;
      font-weight: 600;
    }

    /* ADD FORM */
    .sep {
      border: none;
      border-top: 1.5px solid #fce7f3;
      margin: 1rem 0;
    }

    .add-title {
      font-size: 0.82rem;
      font-weight: 800;
      color: #be185d;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .field {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1.5px solid #fbcfe8;
      border-radius: 12px;
      font-size: 0.95rem;
      color: #831843;
      background: white;
      outline: none;
      margin-bottom: 10px;
      display: block;
      -webkit-appearance: none;
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
      padding: 0.85rem;
      border-radius: 14px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 8px;
      -webkit-tap-highlight-color: transparent;
    }

    .btn-add:active {
      background: #db2777;
    }

    .btn-cancel {
      width: 100%;
      background: white;
      color: #be185d;
      border: 1.5px solid #fbcfe8;
      padding: 0.75rem;
      border-radius: 14px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
    }
  `],
  template: `
    <div class="page">

      <div class="topbar">
        <span class="title">🌸 Goal Calendar</span>
        <button class="btn-logout" (click)="authService.logout()">Salir</button>
      </div>

      <div class="nav">
        <button class="btn-nav" (click)="prevMonth()">‹</button>
        <span class="month-label">{{ monthName }} {{ year }}</span>
        <button class="btn-nav" (click)="nextMonth()">›</button>
      </div>

      <div class="weekdays">
        <span>L</span><span>M</span><span>X</span>
        <span>J</span><span>V</span><span>S</span><span>D</span>
      </div>

      <div class="grid">
        <div *ngFor="let day of calendarDays"
             class="day"
             [class.other-month]="!day.isCurrentMonth"
             [class.today]="day.isToday"
             [class.selected]="selectedDay?.dateStr === day.dateStr"
             (click)="selectDay(day)">

          <div class="today-circle"
               *ngIf="day.isToday">{{ day.date.getDate() }}
          </div>
          <div class="day-num"
               *ngIf="!day.isToday">{{ day.date.getDate() }}
          </div>

          <ng-container *ngIf="day.goalCount > 0">
            <div class="day-bar">
              <div class="day-bar-fill"
                   [class.all-done]="day.completedCount === day.goalCount"
                   [style.width.%]="(day.completedCount / day.goalCount) * 100"></div>
            </div>
            <div class="day-count" [class.has-goals]="day.goalCount > 0">
              {{ day.completedCount }}/{{ day.goalCount }}
            </div>
          </ng-container>
        </div>
      </div>

    </div>

    <!-- MODAL BOTTOM SHEET -->
    <div class="overlay" *ngIf="selectedDay" (click)="onOverlayClick($event)">
      <div class="modal" (click)="$event.stopPropagation()">

        <div class="modal-handle"></div>

        <div class="modal-head">
          <span class="modal-date">{{ formatDate(selectedDay.date) }}</span>
          <button class="btn-x" (click)="closeModal()">✕</button>
        </div>

        <div *ngIf="loadingModal" class="loading">Cargando... 🌸</div>

        <ng-container *ngIf="!loadingModal">

          <!-- RESUMEN -->
          <div class="summary" *ngIf="modalGoals.length > 0">
            <div class="sum-chip total">
              <span class="sum-num">{{ modalGoals.length }}</span>
              <span class="sum-label">Total</span>
            </div>
            <div class="sum-chip done">
              <span class="sum-num">{{ completedGoals }}</span>
              <span class="sum-label">Hechas</span>
            </div>
            <div class="sum-chip pending">
              <span class="sum-num">{{ modalGoals.length - completedGoals }}</span>
              <span class="sum-label">Pendientes</span>
            </div>
          </div>

          <!-- GOALS -->
          <div *ngFor="let g of modalGoals; trackBy: trackGoal"
               class="goal-card"
               [class.done-card]="g.completed">

            <div class="gc-header">
              <div style="flex:1; margin-right:8px">
                <input *ngIf="editingId === g.id" class="gc-label-input"
                       type="text" [(ngModel)]="editLabel"/>
                <span class="gc-label"
                      *ngIf="editingId !== g.id">{{ g.label }}</span>
              </div>
              <span class="badge-done" *ngIf="g.completed">✓ hecho</span>
              <span class="badge-pend" *ngIf="!g.completed">pendiente</span>
            </div>

            <div class="gc-progress">
              <div class="gc-bar">
                <div class="gc-fill"
                     [class.done]="g.completed"
                     [style.width.%]="pct(g)"></div>
              </div>
              <span class="gc-pct">{{ g.currentValue }}
                / {{ editingId === g.id ? editTarget : g.targetValue }}
                ({{ pct(g) }}%)</span>
            </div>

            <div class="gc-controls">
              <input class="gc-input"
                     type="number"
                     [(ngModel)]="g.currentValue"
                     min="0"/>
              <span class="gc-sep">de</span>
              <input *ngIf="editingId === g.id"
                     class="gc-target-input"
                     type="number"
                     [(ngModel)]="editTarget"
                     min="1"/>
              <span class="gc-target-val"
                    *ngIf="editingId !== g.id">{{ g.targetValue }}</span>
            </div>

            <div class="gc-actions">
              <button class="btn-sm btn-save-sm" (click)="saveGoal(g)">Guardar
              </button>
              <button class="btn-sm btn-edit-sm"
                      style="border:1.5px solid #bfdbfe"
                      (click)="toggleEdit(g)">
                {{ editingId === g.id ? 'Cancelar' : 'Editar' }}
              </button>
              <button class="btn-sm btn-del-sm"
                      style="border:1.5px solid #fecdd3"
                      (click)="deleteGoal(g)">Eliminar
              </button>
            </div>

          </div>

          <p class="empty" *ngIf="modalGoals.length === 0">Sin metas — ¡añade
            una!</p>

          <hr class="sep"/>

          <div class="add-title">Nueva meta</div>
          <input class="field" type="text" [(ngModel)]="newLabel"
                 placeholder="Nombre (ej: Pasos, Agua...)" maxlength="50"/>
          <input class="field" type="number" [(ngModel)]="newTarget"
                 placeholder="Objetivo (ej: 10000)" min="1"/>
          <button class="btn-add" (click)="addGoal()">+ Añadir meta</button>
          <button class="btn-cancel" (click)="closeModal()">Cerrar</button>

        </ng-container>
      </div>
    </div>
  `
})
export class CalendarComponent implements OnInit {
  authService = inject(AuthService);
  private goalService = inject(GoalService);
  private cdr = inject(ChangeDetectorRef);

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

  get completedGoals() {
    return this.modalGoals.filter(g => g.completed).length;
  }

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
    this.cdr.detectChanges();

    this.goalService.getGoals(day.dateStr).subscribe({
      next: goals => {
        this.modalGoals = [...goals];
        this.loadingModal = false;
        day.goalCount = goals.length;
        day.completedCount = goals.filter(g => g.completed).length;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingModal = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleEdit(g: Goal) {
    this.editingId = this.editingId === g.id ? null : g.id;
    if (this.editingId) {
      this.editLabel = g.label;
      this.editTarget = g.targetValue;
    }
    this.cdr.detectChanges();
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
        this.newLabel = '';
        this.newTarget = null;
        this.syncDots();
        this.cdr.detectChanges();
      }
    });
  }

  saveGoal(g: Goal) {
    const isEditing = this.editingId === g.id;
    this.goalService.updateGoal(g.id, {
      currentValue: g.currentValue,
      ...(isEditing && { label: this.editLabel, targetValue: this.editTarget })
    }).subscribe({
      next: updated => {
        this.modalGoals = this.modalGoals.map(x => x.id === g.id ? { ...updated } : x);
        this.editingId = null;
        this.syncDots();
        this.cdr.detectChanges();
      }
    });
  }

  deleteGoal(g: Goal) {
    this.goalService.deleteGoal(g.id).subscribe({
      next: () => {
        this.modalGoals = this.modalGoals.filter(x => x.id !== g.id);
        this.syncDots();
        this.cdr.detectChanges();
      }
    });
  }

  syncDots() {
    const day = this.calendarDays.find(d => d.dateStr === this.selectedDay?.dateStr);
    if (day) {
      day.goalCount = this.modalGoals.length;
      day.completedCount = this.modalGoals.filter(g => g.completed).length;
    }
  }

  closeModal() {
    this.selectedDay = null;
    this.editingId = null;
    this.cdr.detectChanges();
  }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.closeModal();
  }

  prevMonth() {
    this.closeModal();
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else this.currentMonth--;
    this.buildCalendar();
  }

  nextMonth() {
    this.closeModal();
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else this.currentMonth++;
    this.buildCalendar();
  }

  trackGoal(_: number, g: Goal) {
    return g.id;
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
