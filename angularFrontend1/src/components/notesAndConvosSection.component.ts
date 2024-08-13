import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Convo } from './convo.component';
import { Note } from './note.component';
import { group } from 'console';
import axios from 'axios';


@Component({
    selector: 'NotesAndConvosSection',
    standalone: true,
    imports: [CommonModule, Note, Convo],
    templateUrl: '../templates/notesAndConvosSection.component.html',
    styleUrl: '../styles.css'
})
export class NotesAndConvosSection {
    @Input() authenticatedUsername!:string;
    @Output() notifyParentToCreateNewNote: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToShowNoteSection: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToShowMessagesOfThisConvo: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToShowNewMessagePopup: EventEmitter<string> = new EventEmitter();
    @Output() notifyParentToShowMessagesOfThisGroupConvo: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToSendNoteReply: EventEmitter<string[]> = new EventEmitter();


    //first boolean is true if there is an unread message; second boolean is true if convo is muted. then it is the list of the group-members besides the initiator.
    //then it is the convo-title if any, and finally it is the list of promoted usernames.
    listOfConvos:Array<Array<any>> = [
    ];

    @Output() emitListOfConvosToParent: EventEmitter<Array<Array<any>>> = new EventEmitter();
    @Output() notifyExpansionToParent: EventEmitter<boolean> = new EventEmitter();
    isExpanded:boolean = true;
    @Output() notifyParentToShowListOfMessageRequestsSection: EventEmitter<string> = new EventEmitter();
    selectedConvo!:number;
    @Output() notifyParentOfSelectedConvo: EventEmitter<number> = new EventEmitter();

    toggleExpansion() {
        this.isExpanded = !this.isExpanded;
        this.notifyExpansionToParent.emit(this.isExpanded);
    }

    
    async ngOnInit() {
        try {
            const response = await axios.get(`http://localhost:8012/getAllConvos/${this.authenticatedUsername}`);
            const fetchedConvosOfUser = response.data;
            for(let convo of fetchedConvosOfUser) {
                convo['latestMessage'] = JSON.parse(convo['latestMessage']);
                if(convo['latestMessage'][1].charAt(convo['latestMessage'][1].length - 1)!=='Z'){
                    convo['latestMessage'][1]+= "Z";
                }
                convo['promotedUsers'] = JSON.parse(convo['promotedUsers']);
                convo['convoInitiator'] = JSON.parse(convo['convoInitiator']);
                convo['members'] = JSON.parse(convo['members']);
                convo['isRequested'] = JSON.parse(convo['isRequested']);
                convo['isMuted'] = JSON.parse(convo['isMuted']);
                convo['hasUnreadMessage'] = JSON.parse(convo['hasUnreadMessage']);
                convo['isDeleted'] = JSON.parse(convo['isDeleted']);
                for(let i=0; i< convo['members'].length; i++) {
                    if(convo['members'][i][0]===this.authenticatedUsername) {
                        if(convo['isRequested'][i]==0) {
                            if(convo['members'].length==2) {
                                if(convo['members'][0][0]!==this.authenticatedUsername) {
                                    this.listOfConvos.push([convo['latestMessage'][0] + " · " + this.formatTimeSinceSent(convo['latestMessage'][1]), convo['members'][0][0], convo['members'][0][1],
                                    Boolean(convo['hasUnreadMessage'][i]), Boolean(convo['isMuted'][i]), [], convo['convoTitle'], convo['promotedUsers'], convo['convoId'],
                                    convo['isMuted'], convo['hasUnreadMessage'], i, convo['isRequested'], convo['isDeleted'], true, new Date(convo['latestMessage'][1]), convo['latestMessage'][0],
                                    convo['convoInitiator'], convo['members']
                                    ]);
                                }
                                else {
                                    this.listOfConvos.push([convo['latestMessage'][0] + " · " + this.formatTimeSinceSent(convo['latestMessage'][1]), convo['members'][1][0], convo['members'][1][1],
                                    Boolean(convo['hasUnreadMessage'][i]), Boolean(convo['isMuted'][i]), [], convo['convoTitle'], convo['promotedUsers'], convo['convoId'],
                                    convo['isMuted'], convo['hasUnreadMessage'], i, convo['isRequested'], convo['isDeleted'], true, new Date(convo['latestMessage'][1]), convo['latestMessage'][0],
                                    convo['convoInitiator'], convo['members']
                                    ]);
                                }
                            }
                            else {
                                let unfilteredConvoMembers = convo['members'];
                                convo['members'] = convo['members'].filter((x: string[]) => (x[0] !== this.authenticatedUsername) && (x[0]!==convo['convoInitiator'][0]));
                                this.listOfConvos.push([convo['latestMessage'][0] + " · " + this.formatTimeSinceSent(convo['latestMessage'][1]), convo['convoInitiator'][0], convo['convoInitiator'][1],
                                Boolean(convo['hasUnreadMessage'][i]), Boolean(convo['isMuted'][i]), convo['members'], convo['convoTitle'], convo['promotedUsers'], convo['convoId'],
                                convo['isMuted'], convo['hasUnreadMessage'], i, convo['isRequested'], convo['isDeleted'], true, new Date(convo['latestMessage'][1]), convo['latestMessage'][0],
                                convo['convoInitiator'], unfilteredConvoMembers
                                ]);
                            }
                            break;
                        }
                        else {
                            break;
                        }
                    }
                }

            }
            this.listOfConvos = this.listOfConvos.sort((a, b) => {
                const dateA = a[15].getTime();
                const dateB = b[15].getTime();
            
                return dateB - dateA;
            });
            this.emitListOfConvosToParent.emit(this.listOfConvos);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }

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

    updateSelectedConvo(convoId: any) {
        this.selectedConvo = convoId;
        this.notifyParentOfSelectedConvo.emit(convoId);
    }

    tellParentToSendNoteReply(noteReplyInfo: string[]) {
        this.notifyParentToSendNoteReply.emit(noteReplyInfo);
    }

    isConvoDeletedByUser(convoIndex: number) {
        return this.listOfConvos[convoIndex][13][this.listOfConvos[convoIndex][11]] == 1;
    }

    formatTimeSinceSent(date: any): string {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
        let interval = seconds / 31536000;
        
        if (interval > 1) {
            return Math.floor(interval) + 'y';
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + 'mo';
        }
        interval = seconds / 604800;
        if (interval > 1) {
            return Math.floor(interval) + 'w';
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return Math.floor(interval) + 'd';
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return Math.floor(interval) + 'h';
        }
        interval = seconds / 60;
        if (interval > 1) {
            return Math.floor(interval) + 'm';
        }
        return Math.floor(seconds) + 's';
    }

}
