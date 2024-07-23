import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeftSidebarPopupComponent } from './leftSidebarPopup.component';

@Component({
    selector: 'LeftSidebar',
    standalone: true,
    imports: [CommonModule, LeftSidebarPopupComponent],
    templateUrl: '../templates/leftSidebar.component.html',
    styleUrl: '../styles.css'
})
export class LeftSidebarComponent {
    showLeftSidebarPopup:boolean = true;

    toggleShowLeftSidebarPopup() {
        this.showLeftSidebarPopup = !this.showLeftSidebarPopup;
    }
}