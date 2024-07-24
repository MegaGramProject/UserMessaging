import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'Message',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/message.component.html',
    styleUrl: '../styles.css'
})
export class Message {
    @Input() lastMessage: string = "Gotcha • 29w";
    @Input() username: string = "rishavry";
    @Input() fullName: string = "Rishav Ray";
}