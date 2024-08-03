import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LeftSidebarPopupComponent } from './leftSidebarPopup.component';

@Component({
    selector: 'LeftSidebar',
    standalone: true,
    imports: [CommonModule, LeftSidebarPopupComponent],
    templateUrl: '../templates/leftSidebar.component.html',
    styleUrl: '../styles.css'
})
export class LeftSidebarComponent {
    showLeftSidebarPopup:boolean = false;

    toggleShowLeftSidebarPopup() {
        this.showLeftSidebarPopup = !this.showLeftSidebarPopup;
    }

    takeUserToHomeScreen() {
        window.location.href = "http://localhost:3100/";
    }
}