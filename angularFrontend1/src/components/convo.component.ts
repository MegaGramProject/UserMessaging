import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'Convo',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/convo.component.html',
    styleUrl: '../styles.css'
})
export class Convo {
    @Input() lastMessage!: string;
    @Input() username!: string;
    @Input() fullName!: string;
    @Input() hasUnreadMessage!: boolean;
    @Output() notifyParentToShowMessagesOfThisConvo: EventEmitter<any> = new EventEmitter();

    selectConvo() {
        this.hasUnreadMessage = false;
        this.showMessagesOfThisConvo();
    }
    
    showMessagesOfThisConvo() {
        this.notifyParentToShowMessagesOfThisConvo.emit([this.username, this.fullName]);
    }

}