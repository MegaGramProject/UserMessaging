import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Convo } from './convo.component';
import axios from 'axios';

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
    @Output() notifyParentToUpdateSelectedConvo: EventEmitter<number> = new EventEmitter();
    @Output() notifyParentToShowMessagesOfThisRequestedGroupConvo: EventEmitter<string[][]> = new EventEmitter();
    @Input() authenticatedUsername!:string;

    async ngOnInit() {
        try {
            const response = await axios.get(`http://localhost:8012/getAllConvos/${this.authenticatedUsername}`);
            const fetchedRequestedConvosOfUser = response.data;
            for(let convo of fetchedRequestedConvosOfUser) {
                convo['promotedUsers'] = JSON.parse(convo['promotedUsers']);
                convo['convoInitiator'] = JSON.parse(convo['convoInitiator']);
                convo['members'] = JSON.parse(convo['members']);
                convo['isRequested'] = JSON.parse(convo['isRequested']);
                convo['isMuted'] = JSON.parse(convo['isMuted']);
                convo['hasUnreadMessage'] = JSON.parse(convo['hasUnreadMessage']);
                for(let i=0; i< convo['members'].length; i++) {
                    if(convo['members'][i][0]===this.authenticatedUsername) {
                        if(convo['isRequested'][i]==1) {
                            if(convo['members'].length==2) {
                                if(convo['members'][0][0]!=='rishavry') {
                                    this.listOfRequestedConvos.push([convo['latestMessageId'], convo['members'][0][0], convo['members'][0][1],
                                    Boolean(convo['hasUnreadMessage'][i]), Boolean(convo['isMuted'][i]), [], convo['convoTitle'], convo['promotedUsers'], convo['convoId']
                                    ]);
                                }
                                else {
                                    this.listOfRequestedConvos.push([convo['latestMessageId'], convo['members'][1][0], convo['members'][1][1],
                                    Boolean(convo['hasUnreadMessage'][i]), Boolean(convo['isMuted'][i]), [], convo['convoTitle'], convo['promotedUsers'], convo['convoId']
                                    ]);
                                }
                            }
                            else {
                                convo['members'] = convo['members'].filter((x: string[]) => (x[0] !== this.authenticatedUsername) && (x[0]!==convo['convoInitiator'][0]));
                                this.listOfRequestedConvos.push([convo['latestMessageId'], convo['convoInitiator'][0], convo['convoInitiator'][1],
                                Boolean(convo['hasUnreadMessage'][i]), Boolean(convo['isMuted'][i]), convo['members'], convo['convoTitle'], convo['promotedUsers'], convo['convoId']])
                            }
                            break;
                        }
                        else {
                            break;
                        }
                    }
                }
            }
            this.emitListOfRequestedConvosToParent.emit(this.listOfRequestedConvos);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
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
        this.listOfRequestedConvos = [];
        this.selectedConvo = -1;
    }

    updateSelectedConvo(convoIndex: number) {
        this.selectedConvo = convoIndex;
        this.notifyParentToUpdateSelectedConvo.emit(convoIndex);
    }

    showMessagesOfRequestedConvo(messageRecipientInfo: string[]) {
        this.notifyParentToShowMessagesOfThisRequestedConvo.emit(messageRecipientInfo);
    }

    showMessagesOfThisRequestedGroupConvo(groupMessagesRecipientInfo: string[][]) {
        this.notifyParentToShowMessagesOfThisRequestedGroupConvo.emit(groupMessagesRecipientInfo);
    }


}