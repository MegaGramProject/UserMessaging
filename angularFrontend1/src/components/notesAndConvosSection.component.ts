import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Convo } from './convo.component';
import { Note } from './note.component';
import { group } from 'console';



@Component({
    selector: 'NotesAndConvosSection',
    standalone: true,
    imports: [CommonModule, Note, Convo],
    templateUrl: '../templates/notesAndConvosSection.component.html',
    styleUrl: '../styles.css'
})
export class NotesAndConvosSection {
    @Output() notifyParentToCreateNewNote: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToShowNoteSection: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToShowMessagesOfThisConvo: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToShowNewMessagePopup: EventEmitter<string> = new EventEmitter();
    @Output() notifyParentToShowMessagesOfThisGroupConvo: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToSendNoteReply: EventEmitter<string[]> = new EventEmitter();


    //first boolean is true if there is an unread message; second boolean is true if convo is muted. then it is the list of the group-members besides the initiator.
    //then it is the convo-title if any, and finally it is the list of promoted usernames.
    listOfConvos:Array<Array<any>> = [
        ["Message #1 • 1d", "rishavry2", "Rishav Ray2", false , false, [], "Non-Group Convo", []],
        ["Message #2 • 2w", "rishavry", "Rishav Ray", false , false, [['rishavry4', 'Rishav Ray4'], ['rishavry6', 'Rishav Ray6'], ['rishavry7', 'Rishav Ray7']], "Group Convo", []],
       // ["Message #2 • 2w", "rishavry3", "Rishav Ray3", false, false, []],
       // ["Message #3 • 3mo", "rishavry4", "Rishav Ray4", false, false, [["rishavry6", "Rishav Ray6"]]],
    ];

    @Output() emitListOfConvosToParent: EventEmitter<Array<Array<any>>> = new EventEmitter();
    @Output() notifyExpansionToParent: EventEmitter<boolean> = new EventEmitter();
    isExpanded:boolean = true;
    @Output() notifyParentToShowListOfMessageRequestsSection: EventEmitter<string> = new EventEmitter();
    selectedConvo:number = -1;
    @Output() notifyParentOfSelectedConvo: EventEmitter<number> = new EventEmitter();

    toggleExpansion() {
        this.isExpanded = !this.isExpanded;
        this.notifyExpansionToParent.emit(this.isExpanded);
    }

    
    ngOnInit() {
        this.emitListOfConvosToParent.emit(this.listOfConvos);
    }


    takeUserToLogin() {
        window.location.href = "http://localhost:8000/login";
    }

    showCreateNewNote() {
        this.notifyParentToCreateNewNote.emit('Show createNewNote');
    }

    handleShowNoteSectionNotfication(username: string) {
        this.notifyParentToShowNoteSection.emit(username);
    }

    showMessagesOfConvo(messageRecipientInfo: Array<string>) {
        this.notifyParentToShowMessagesOfThisConvo.emit(messageRecipientInfo);
    }


    showMessagesOfThisGroupConvo(groupConvoMembers:any[][]) {
        this.notifyParentToShowMessagesOfThisGroupConvo.emit(groupConvoMembers);
    }

    showNewMessagePopup() {
        this.notifyParentToShowNewMessagePopup.emit("show new message popup");
    }

    showListOfMessageRequestsSection() {
        this.notifyParentToShowListOfMessageRequestsSection.emit("show list of message requests section");
    }

    updateSelectedConvo(convoIndex: number) {
        this.selectedConvo = convoIndex;
        this.notifyParentOfSelectedConvo.emit(convoIndex);
    }

    tellParentToSendNoteReply(noteReplyInfo: string[]) {
        this.notifyParentToSendNoteReply.emit(noteReplyInfo);
    }
}