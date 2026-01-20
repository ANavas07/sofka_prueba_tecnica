import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Toast } from "../shared/components/toast/toast";

export interface ToastConfiguration {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {

    private toastSubject = new Subject<ToastConfiguration>();
    //Stream observable para escuchar las notificaciones
    toast$ = this.toastSubject.asObservable();

    private counter = 0;

    showToast(message: string, type: ToastConfiguration['type'] = 'info', duration: number = 3000): void {
        console.log('showToast llamado:', { message, type, duration });
        const toast: ToastConfiguration = {
            id: this.counter++,
            message,
            type,
            duration,
        };
        this.toastSubject.next(toast);
        console.log('Toast emitido:', toast);
    }

    success(message: string, duration?: number): void {
        this.showToast(message, 'success', duration);
    }

    error(message: string, duration?: number): void {
        this.showToast(message, 'error', duration);
    }

    warning(message: string, duration?: number): void {
        this.showToast(message, 'warning', duration);
    }

    info(message: string, duration?: number): void {
        this.showToast(message, 'info', duration);
    }

}