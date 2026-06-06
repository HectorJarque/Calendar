import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Goal {
  id: string;
  label: string;
  targetValue: number;
  currentValue: number;
  date: string;
  completed: boolean;
  carriedOver: boolean;
}

@Injectable({ providedIn: 'root' })
export class GoalService {
  private http = inject(HttpClient);

  getGoals(date: string) {
    return this.http.get<Goal[]>(`${environment.apiUrl}/goals?date=${date}`);
  }

  createGoal(goal: { label: string; targetValue: number; date: string }) {
    return this.http.post<Goal>(`${environment.apiUrl}/goals`, goal);
  }

  updateGoal(id: string, currentValue: number) {
    return this.http.put<Goal>(`${environment.apiUrl}/goals/${id}`, { currentValue });
  }

  deleteGoal(id: string) {
    return this.http.delete(`${environment.apiUrl}/goals/${id}`);
  }
}
