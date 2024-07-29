import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { Convo } from './convo.component';

@Component({
    selector: 'ListOfMessageRequestsSection',
    standalone: true,
    imports: [CommonModule, Convo],
    templateUrl: '../templates/listOfMessageRequestsSection.component.html',
    styleUrl: '../styles.css'
})
export class ListOfMessageRequestsSection {
    isExpanded:boolean = true;
    @Output() notifyExpansionToParent: EventEmitter<boolean> = new EventEmitter();
    @Output() notifyParentToCloseSection: EventEmitter<string> = new EventEmitter();
    whoCanMessageTextHovered:boolean = false;
    listOfConvos:Array<Array<any>> = [
        ["Message #1 • 1d", "rishavry2", "Rishav Ray2", false , false],
        ["Message #2 • 2w", "rishavry3", "Rishav Ray3", false, false],
        ["Message #3 • 3mo", "rishavry4", "Rishav Ray4", false, false],
    ];
    selectedConvo:number = -1;
    @Output() notifyParentToShowMessagesOfThisRequestedConvo: EventEmitter<string[]> = new EventEmitter();
    @Output() emitListOfRequestedConvosToParent: EventEmitter<Array<Array<any>>> = new EventEmitter();

    ngOnInit() {
        this.emitListOfRequestedConvosToParent.emit(this.listOfConvos);
    }


    toggleExpansion() {
        this.isExpanded = !this.isExpanded;
        this.notifyExpansionToParent.emit(this.isExpanded);
    }

    closeSection() {
        this.notifyParentToCloseSection.emit("close section");
        this.isExpanded = true;
    }

    decideWhoCanMessageTextHovered() {
        this.whoCanMessageTextHovered = true;
    }

    decideWhoCanMessageTextUnhovered() {
        this.whoCanMessageTextHovered = false;
    }

    getColorOfDecideWhoCanMessageText() {
        return this.whoCanMessageTextHovered ?
        {
            'color': 'black'
        } :
        {
            'color': '#348ceb'
        };
    }

    takeUserToWhoCanSeeMessageTextSettings() {
        window.location.href = "https://www.instagram.com/accounts/message_settings/";
    }

    deleteAllRequestedConvos() {
        this.listOfConvos = [];
    }

    updateSelectedConvo(convoIndex: number) {
        this.selectedConvo = convoIndex;
    }

    showMessagesOfRequestedConvo(messageRecipientInfo: Array<string>) {
        this.notifyParentToShowMessagesOfThisRequestedConvo.emit(messageRecipientInfo);
    }


}