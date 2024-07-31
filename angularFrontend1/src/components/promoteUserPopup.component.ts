import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'PromoteUserPopup',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/promoteUserPopup.component.html',
    styleUrl: '../styles.css'
})
export class PromoteUserPopup {
    @Input() messageRecipientInfo!: string[];
    @Output() notifyParentToCancelPromoteUser: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToPromoteUser: EventEmitter<any> = new EventEmitter();

    cancelPromoteUser() {
        this.notifyParentToCancelPromoteUser.emit("cancel promote user");
    }

    promoteUser() {
        this.notifyParentToPromoteUser.emit("promote user");
    }

}