import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import axios from 'axios';
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
    listOfRequestedConvos:Array<Array<any>> = [
    ];
    selectedConvo:number = -1;
    @Output() notifyParentToShowMessagesOfThisRequestedConvo: EventEmitter<string[]> = new EventEmitter();
    @Output() emitListOfRequestedConvosToParent: EventEmitter<Array<Array<any>>> = new EventEmitter();
    @Output() notifyParentToShowMessagesOfThisRequestedGroupConvo: EventEmitter<string[][]> = new EventEmitter();
    @Input() authenticatedUsername!:string;
    @Output() notifyParentOfSelectedConvo: EventEmitter<number> = new EventEmitter();
    @Output() notifyParentToDeleteAllRequestedConvos: EventEmitter<string> = new EventEmitter();

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

            const response = await axios.get(`http://localhost:8012/getAllConvos/${this.authenticatedUsername}`);
            const fetchedRequestedConvosOfUser = response.data;
            for(let convo of fetchedRequestedConvosOfUser) {
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
                        if(convo['isRequested'][i]==1) {
                            if(convo['members'].length==2) {
                                if(convo['members'][0][0]!==this.authenticatedUsername && !userBlockings.includes(convo['members'][0][0])) {
                                    this.listOfRequestedConvos.push([this.getLatestMessageOfConvo(convo['latestMessage']), convo['members'][0][0], convo['members'][0][1],
                                    Boolean(convo['hasUnreadMessage'][i]), Boolean(convo['isMuted'][i]), [], convo['convoTitle'], convo['promotedUsers'], convo['convoId'],
                                    convo['isMuted'], convo['hasUnreadMessage'], i, convo['isRequested'], convo['isDeleted'], true, new Date(convo['latestMessage'][1]), convo['latestMessage'][0],
                                    convo['convoInitiator'], convo['members']
                                    ]);
                                }
                                else if(convo['members'][1][0]!==this.authenticatedUsername && !userBlockings.includes(convo['members'][1][0])) {
                                    this.listOfRequestedConvos.push([this.getLatestMessageOfConvo(convo['latestMessage']), convo['members'][1][0], convo['members'][1][1],
                                    Boolean(convo['hasUnreadMessage'][i]), Boolean(convo['isMuted'][i]), [], convo['convoTitle'], convo['promotedUsers'], convo['convoId'],
                                    convo['isMuted'], convo['hasUnreadMessage'], i, convo['isRequested'], convo['isDeleted'], true, new Date(convo['latestMessage'][1]), convo['latestMessage'][0],
                                    convo['convoInitiator'], convo['members']
                                    ]);
                                }
                            }
                            else {
                                 //add code to ensure that all the members of the convo aren't blocked cuz if all are then do not add to listOfRequestedConvos
                                let unfilteredConvoMembers = convo['members'];
                                convo['members'] = convo['members'].filter((x: string[]) => (x[0] !== this.authenticatedUsername) && (x[0]!==convo['convoInitiator'][0]));
                                this.listOfRequestedConvos.push([this.getLatestMessageOfConvo(convo['latestMessage']), convo['convoInitiator'][0], convo['convoInitiator'][1],
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
            this.listOfRequestedConvos = this.listOfRequestedConvos.sort((a, b) => {
                const dateA = a[15].getTime();
                const dateB = b[15].getTime();
    
                return dateB - dateA;
            });
            this.emitListOfRequestedConvosToParent.emit(this.listOfRequestedConvos);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    }

    getLatestMessageOfConvo(latestMessageOfConvoInfo: any[]) {
        if(latestMessageOfConvoInfo[0].startsWith(this.authenticatedUsername+":")) {
            return "You: " + latestMessageOfConvoInfo[0].substring(this.authenticatedUsername.length+2) + " · " + this.formatTimeSinceSent(latestMessageOfConvoInfo[1]);
        }
        return latestMessageOfConvoInfo[0].substring(latestMessageOfConvoInfo[0].indexOf(":")+2) + " · " + this.formatTimeSinceSent(latestMessageOfConvoInfo[1]);
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
        this.notifyParentToDeleteAllRequestedConvos.emit('delete all requested convos');
    }

    updateSelectedConvo(convoIndex: any) {
        this.selectedConvo = convoIndex;
        this.notifyParentOfSelectedConvo.emit(convoIndex);
    }

    showMessagesOfRequestedConvo(messageRecipientInfo: string[]) {
        this.notifyParentToShowMessagesOfThisRequestedConvo.emit(messageRecipientInfo);
    }

    showMessagesOfThisRequestedGroupConvo(groupMessagesRecipientInfo: string[][]) {
        this.notifyParentToShowMessagesOfThisRequestedGroupConvo.emit(groupMessagesRecipientInfo);
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