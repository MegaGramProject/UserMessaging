import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'RequestedMessagesOfAChat',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/requestedMessagesOfAChat.component.html',
    styleUrl: '../styles.css'
})
export class RequestedMessagesOfAChat {
    @Input() isExpanded!:boolean;
    @Input() messageRecipientInfo!:string[];
    @Input() convoDetailsPanelIsExpanded!: boolean;
    @Output() notifyParentToToggleConvoDetailsPanel:EventEmitter<string> = new EventEmitter();
    @Output() notifyParentToDeleteRequestedConvo:EventEmitter<string> = new EventEmitter();

    getWidthAndHorizontalStartOfSection() {
        if(this.isExpanded && this.convoDetailsPanelIsExpanded) {
            return {
                'width': '70%',
                'left': '7%'
            };
        }
        else if(this.isExpanded && !this.convoDetailsPanelIsExpanded) {
            return {
                'width': '88%',
                'left': '7%'
            };
        }
        else if(!this.isExpanded && this.convoDetailsPanelIsExpanded) {
            return {
                'width': '52.6%',
                'left': '27.3%'
            };
        }
        else {
            return {
                'width': '70.6%',
                'left': '27.3%'
            };
        }
    }

    toggleConvoDetailsPanel() {
        this.notifyParentToToggleConvoDetailsPanel.emit("toggle convo-details panel");
    }


    blockUser() {
        //code for blocking user
        this.deleteRequestedConvo();
    }

    deleteRequestedConvo() {
        this.notifyParentToDeleteRequestedConvo.emit("delete the selected requested convo");
    }

    acceptRequestedConvo() {

    }

}