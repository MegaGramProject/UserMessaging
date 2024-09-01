import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisibilityService {
  private isActiveSubject = new BehaviorSubject<boolean>(this.checkInitialState());
  isActive$ = this.isActiveSubject.asObservable();

  constructor(private ngZone: NgZone) {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('focus', this.handleFocus.bind(this));
      window.addEventListener('blur', this.handleBlur.bind(this));
    });
  }

  private checkInitialState(): boolean {
    return document.hasFocus() && !document.hidden;
  }


  private handleFocus() {
    const isActive = !document.hidden;
    this.ngZone.run(() => this.isActiveSubject.next(isActive));
  }

  private handleBlur() {
    this.ngZone.run(() => this.isActiveSubject.next(false));
  }
}
