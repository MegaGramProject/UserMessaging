import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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
    @Input() numberOfAcceptedConvosWithUnreadMessage!:number;

    toggleShowLeftSidebarPopup() {
        this.showLeftSidebarPopup = !this.showLeftSidebarPopup;
    }

    takeUserToHomeScreen() {
        window.location.href = "http://localhost:3100/";
    }
}