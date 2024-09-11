import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import axios from 'axios';
import { Convo } from './convo.component';
import { Note } from './note.component';


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
    @Output() notifyParentToShowNoteSection: EventEmitter<string[]> = new EventEmitter();
    @Output() notifyParentToShowMessagesOfThisConvo: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToShowNewMessagePopup: EventEmitter<string> = new EventEmitter();
    @Output() notifyParentToShowMessagesOfThisGroupConvo: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToSendNoteReply: EventEmitter<string[]> = new EventEmitter();
    @Output() notifyParentToUpdateNumberOfAcceptedConvosWithUnreadMessage: EventEmitter<number> = new EventEmitter();

    //first boolean is true if there is an unread message; second boolean is true if convo is muted. then it is the list of the group-members besides the initiator.
    //then it is the convo-title if any, and finally it is the list of promoted usernames.
    listOfConvos:Array<Array<any>> = [
    ];

    @Output() emitListOfConvosToParent: EventEmitter<any[][]> = new EventEmitter();
    @Output() notifyExpansionToParent: EventEmitter<boolean> = new EventEmitter();
    isExpanded:boolean = true;
    @Output() notifyParentToShowListOfMessageRequestsSection: EventEmitter<string> = new EventEmitter();
    selectedConvo!:number;
    @Output() notifyParentOfSelectedConvo: EventEmitter<number> = new EventEmitter();
    @Output() emitUserBlockingsToParent: EventEmitter<string[]> = new EventEmitter();
    @Output() emitUserFollowingsToParent: EventEmitter<any[]> = new EventEmitter();
    usersThatYouFollow:string[] = [];
    latestUnexpiredNotesListOfUsersYouFollow:string[] = [];
    @Input() socket!:WebSocket;
    @Output() notifyParentToUpdateConvoInfo: EventEmitter<any[]> = new EventEmitter();
    numberOfAcceptedConvosWithUnreadMessage:number = 0;
    convoSessionKeys: { [convoId: string]: any[] } = {};
    @Output() emitConvoSessionKeysToParent: EventEmitter<{ [convoId: string]: any }> = new EventEmitter();

    toggleExpansion() {
        this.isExpanded = !this.isExpanded;
        this.notifyExpansionToParent.emit(this.isExpanded);
    }

    
    async ngOnInit() {
        try {
            const response0 = await fetch('http://localhost:8013/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                query {
                    getAllUserBlockings(filter: { username: "${this.authenticatedUsername}" }) {
                        blocker
                        blockee
                    }
                }
                `
                })
            });
            if(!response0.ok) {
                throw new Error('Network response not ok');
            }
            let userBlockings = await response0.json();
            userBlockings = userBlockings['data']['getAllUserBlockings'];
            for(let i=0; i<userBlockings.length; i++) {
                if(userBlockings[i]['blocker']===this.authenticatedUsername) {
                    userBlockings[i] = userBlockings[i]['blockee'];
                }
                else {
                    userBlockings[i] = userBlockings[i]['blocker'];
                }
            }
            
            const listOfConvoIds = [];
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
                            if(Boolean(convo['hasUnreadMessage'][i])) {
                                this.numberOfAcceptedConvosWithUnreadMessage++;
                            }
                            listOfConvoIds.push(convo['convoId']);
                            if(convo['members'].length==2) {
                                if(convo['members'][0][0]!==this.authenticatedUsername && !userBlockings.includes(convo['members'][0][0])) {
                                    this.listOfConvos.push([this.getLatestMessageOfConvo(convo['latestMessage']), convo['members'][0][0], convo['members'][0][1],
                                    Boolean(convo['hasUnreadMessage'][i]), Boolean(convo['isMuted'][i]), [], convo['convoTitle'], convo['promotedUsers'], convo['convoId'],
                                    convo['isMuted'], convo['hasUnreadMessage'], i, convo['isRequested'], convo['isDeleted'], true, new Date(convo['latestMessage'][1]), convo['latestMessage'][0],
                                    convo['convoInitiator'], convo['members']
                                    ]);
                                }
                                else if(convo['members'][1][0]!==this.authenticatedUsername && !userBlockings.includes(convo['members'][1][0])) {
                                    this.listOfConvos.push([this.getLatestMessageOfConvo(convo['latestMessage']), convo['members'][1][0], convo['members'][1][1],
                                    Boolean(convo['hasUnreadMessage'][i]), Boolean(convo['isMuted'][i]), [], convo['convoTitle'], convo['promotedUsers'], convo['convoId'],
                                    convo['isMuted'], convo['hasUnreadMessage'], i, convo['isRequested'], convo['isDeleted'], true, new Date(convo['latestMessage'][1]), convo['latestMessage'][0],
                                    convo['convoInitiator'], convo['members']
                                    ]);
                                }
                            }
                            else {
                                //add code to ensure that all the members of the convo aren't blocked cuz if all are then do not add to listOfConvos
                                let unfilteredConvoMembers = convo['members'];
                                convo['members'] = convo['members'].filter((x: string[]) => (x[0] !== this.authenticatedUsername) && (x[0]!==convo['convoInitiator'][0]));
                                this.listOfConvos.push([this.getLatestMessageOfConvo(convo['latestMessage']), convo['convoInitiator'][0], convo['convoInitiator'][1],
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
            this.emitListOfConvosToParent.emit([this.listOfConvos, [this.numberOfAcceptedConvosWithUnreadMessage]]);
            this.emitUserBlockingsToParent.emit(userBlockings);
            const response2 = await fetch('http://localhost:8013/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
                    query {
                        getAllUserFollowings(filter: { username: "${this.authenticatedUsername}" }) {
                            follower
                            followee
                        }
                    }
                    `
                    })
                });
            if(!response2.ok) {
                throw new Error('Network response not ok');
            }
            let userFollowings = await response2.json();
            userFollowings = userFollowings['data']['getAllUserFollowings'];
            this.emitUserFollowingsToParent.emit(userFollowings);

            let usersThatYouFollow = [];
            for(let userFollowing of userFollowings) {
                if(userFollowing['follower']===this.authenticatedUsername) {
                    usersThatYouFollow.push(userFollowing['followee']);
                }
            }

            const response3 = await fetch('http://localhost:8015/getLatestUnexpiredNotesOfEachUser', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    listOfUsers: usersThatYouFollow
                })
            });
            if(!response3.ok) {
                throw new Error('network response not ok');
            }
            const latestUnexpiredNotesList = await response3.json();
            this.usersThatYouFollow = usersThatYouFollow;
            this.latestUnexpiredNotesListOfUsersYouFollow = latestUnexpiredNotesList;

            const response4 = await fetch('http://localhost:8017/getCurrentlyActiveSessionKeys/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(listOfConvoIds)
            });
            if(!response4.ok) {
                throw new Error('network response not ok');
            }
            const getCurrentlyActiveSessionKeys = await response4.json();
            for(let activeSessionKey of getCurrentlyActiveSessionKeys) {
                this.convoSessionKeys[activeSessionKey['convoId']] = activeSessionKey['sessionId'];
            }
            this.emitConvoSessionKeysToParent.emit(this.convoSessionKeys);

        } catch (error) {
            console.error('Error fetching notes/convos:', error);
        }

    }

    getLatestMessageOfConvo(latestMessageOfConvoInfo: any[]) {
        if(latestMessageOfConvoInfo[0].startsWith(this.authenticatedUsername+":")) {
            return "You: " + latestMessageOfConvoInfo[0].substring(this.authenticatedUsername.length+2) + " · " + this.formatTimeSinceSent(latestMessageOfConvoInfo[1]);
        }
        return latestMessageOfConvoInfo[0].substring(latestMessageOfConvoInfo[0].indexOf(":")+2) + " · " + this.formatTimeSinceSent(latestMessageOfConvoInfo[1]);
    }


    takeUserToLogin() {
        window.location.href = "http://localhost:8000/login";
    }

    showCreateNewNote() {
        this.notifyParentToCreateNewNote.emit('Show createNewNote');
    }

    handleShowNoteSectionNotfication(usernameAndFullName: string[]) {
        this.notifyParentToShowNoteSection.emit(usernameAndFullName);
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

    notifyParentToUpdateConvo(convoUpdateInfo: any[]) {
        this.notifyParentToUpdateConvoInfo.emit(convoUpdateInfo);
    }

    tellParentToUpdateNumberOfAcceptedConvosWithUnreadMessages(info: number) {
        this.notifyParentToUpdateNumberOfAcceptedConvosWithUnreadMessage.emit(info);
    }

}
