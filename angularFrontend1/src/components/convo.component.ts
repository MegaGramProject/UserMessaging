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
    @Input() lastMessage!: any;
    @Input() username!: any;
    @Input() fullName!: any;
    @Input() hasUnreadMessage!: any;
    @Input() isMuted!:any;
    @Output() notifyParentToShowMessagesOfThisConvo: EventEmitter<any> = new EventEmitter();

    selectConvo() {
        this.hasUnreadMessage = false;
        this.showMessagesOfThisConvo();
    }
    
    showMessagesOfThisConvo() {
        this.notifyParentToShowMessagesOfThisConvo.emit([this.username, this.fullName]);
    }

}