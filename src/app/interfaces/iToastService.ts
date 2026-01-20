import { Observable } from "rxjs";

export interface ToastConfiguration {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

export interface IToastService {
    toast$: Observable<ToastConfiguration>;
    showToast(message: string, type: ToastConfiguration['type'], duration?: number): void;
    success(message: string, duration?: number): void;
    error(message: string, duration?: number): void;
    warning(message: string, duration?: number): void;
    info(message: string, duration?: number): void;
}
