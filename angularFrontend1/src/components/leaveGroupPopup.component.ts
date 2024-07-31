import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'LeaveGroupPopup',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/leaveGroupPopup.component.html',
    styleUrl: '../styles.css'
})
export class LeaveGroupPopup {
    @Input() messageRecipientInfo!: string[];
    @Output() notifyParentToCancelLeaveGroup: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToLeaveGroup: EventEmitter<any> = new EventEmitter();

    cancelLeaveGroup() {
        this.notifyParentToCancelLeaveGroup.emit("cancel leave group");
    }

    leaveGroup() {
        this.notifyParentToLeaveGroup.emit("leave group");
    }

}