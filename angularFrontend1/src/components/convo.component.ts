import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

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
    @Output() notifyParentOfSelectedConvo: EventEmitter<number> = new EventEmitter();
    @Input() convoIndex!:number;
    @Input() isSelected!: boolean;
    @Input() membersOfGroupChatBesidesInitator: any = [];
    @Output() notifyParentToShowMessagesOfThisGroupConvo: EventEmitter<any[][]> = new EventEmitter();
    @Input() convoTitle:any = "";
    @Input() convoId:any = "";
    profilePhotoString:string = "profileIcon.png";
    isActive:boolean = false;
    isIdle:boolean = false;
    @Input() socket!:WebSocket;
    constructor(private cdRef: ChangeDetectorRef) { }
    @Input() authenticatedUsername!:string;
    @Input() convoMembers!: string[][];
    @Output() notifyParentToUpdateConvo: EventEmitter<any[]> = new EventEmitter();
    @Input() isRequestedConvo!: boolean;
    @Output() notifyParentToUpdateNumberOfAcceptedConvosWithUnreadMessage: EventEmitter<number> = new EventEmitter();

    ngOnInit() {
        this.getProfilePhoto();
        this.socket.send(JSON.stringify(['activity-status', this.username]));
        if(!this.isMuted) {
            this.socket.send(JSON.stringify(['last-message-and-has-unread-message', this.convoId]));
            this.socket.send(JSON.stringify(['chronologically-latest-message', this.convoId]));
            this.socket.send(JSON.stringify(['convo-title', this.convoId]));
        }
        else {
            this.hasUnreadMessage = false;
        }

        this.socket.addEventListener('message', (event) => {
            const messageArray = JSON.parse(event.data);
            if( (messageArray[0]==='get-activity-status' || messageArray[0]==='update-activity-status') && messageArray[1]===this.username ) {
                if(messageArray[2]==='active') {
                    this.isActive = true;
                    this.isIdle = false;
                }
                else if(messageArray[2]==='idle') {
                    this.isActive = false;
                    this.isIdle = true;
                }
                else {
                    this.isActive = false;
                    this.isIdle = false;
                }
                this.cdRef.detectChanges();
            }

            else if( (messageArray[0]==='update-last-message') && messageArray[1]===this.convoId ) {
                this.lastMessage = this.getLatestMessageOfConvo(messageArray[2]);
                this.cdRef.detectChanges();
                this.notifyParentToUpdateConvo.emit([this.convoIndex, 'last-message', messageArray[2], this.lastMessage]);
            }

            else if( (messageArray[0]==='update-unread-message') && messageArray[1]===this.convoId ) {
                for(let i=0; i<this.convoMembers.length; i++) {
                    let member = this.convoMembers[i];
                    if(member[0]===this.authenticatedUsername) {
                        if(messageArray[2][i]===1) {
                            if(!this.hasUnreadMessage) {
                                this.notifyParentToUpdateNumberOfAcceptedConvosWithUnreadMessage.emit(1);
                            }
                            this.hasUnreadMessage = true;
                        }
                        else {
                            if(this.hasUnreadMessage) {
                                this.notifyParentToUpdateNumberOfAcceptedConvosWithUnreadMessage.emit(-1);
                            }
                            this.hasUnreadMessage = false;
                        }
                        break;
                    }
                }
                this.cdRef.detectChanges();
                this.notifyParentToUpdateConvo.emit([this.convoIndex, 'unread-message', messageArray[2], this.hasUnreadMessage]);
            }

            else if( (messageArray[0]==='update-convo-title') && messageArray[1]===this.convoId ) {
                this.convoTitle = messageArray[2];
                this.cdRef.detectChanges();
                this.notifyParentToUpdateConvo.emit([this.convoIndex, 'convo-title', messageArray[2]]);
            }
        });

    }

    getLatestMessageOfConvo(latestMessageOfConvoInfo: any[]) {
        if(latestMessageOfConvoInfo[0].startsWith(this.authenticatedUsername+":")) {
            return "You: " + latestMessageOfConvoInfo[0].substring(this.authenticatedUsername.length+2) + " · " + this.formatTimeSinceSent(latestMessageOfConvoInfo[1]);
        }
        return latestMessageOfConvoInfo[0].substring(latestMessageOfConvoInfo[0].indexOf(":")+2) + " · " + this.formatTimeSinceSent(latestMessageOfConvoInfo[1]);
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

    

    async getProfilePhoto() {
        const response = await fetch('http://localhost:8003/getProfilePhoto/'+this.username);
        if(!response.ok) {
            return;
        }
        const buffer = await response.arrayBuffer();
        const base64Flag = 'data:image/jpeg;base64,';
        const imageStr = this.arrayBufferToBase64(buffer);
        this.profilePhotoString = base64Flag + imageStr;
    }

    arrayBufferToBase64(buffer: ArrayBuffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }


    selectConvo() {
        this.showMessagesOfThisConvo();
        this.notifyParentOfSelectedConvo.emit(this.convoIndex);
    }

    getBackgroundColorBasedOnSelection() {
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (this.isSelected) {
            return {
                'background-color': '#e8e8e8',
                'color': 'black'
            };
        } else if (isDarkMode) {
            return {
                'background-color': '#282929',
            };
        } else {
            return {
                'background-color': 'white'
            };
        }
    }
    
    
    showMessagesOfThisConvo() {
        if(this.membersOfGroupChatBesidesInitator.length==0) {
            this.notifyParentToShowMessagesOfThisConvo.emit([this.username, this.fullName]);
        }
        else {
            let groupChatMemberData = [[this.username, this.fullName]];
            for(let member of this.membersOfGroupChatBesidesInitator) {
                groupChatMemberData.push(member)
            }
            this.notifyParentToShowMessagesOfThisGroupConvo.emit(groupChatMemberData);
        }
    }

    getFullNamesOfAllConvoMembers() {
        let fullNames = this.fullName;
        if(this.membersOfGroupChatBesidesInitator.length==1) {
            return fullNames + " & " + this.membersOfGroupChatBesidesInitator[0][1];
        }
        for(let i=0; i<this.membersOfGroupChatBesidesInitator.length-1; i++) {
            fullNames += ", " + this.membersOfGroupChatBesidesInitator[i][1];
        }
        if(this.membersOfGroupChatBesidesInitator.length>0) {
            fullNames += ", & " +  this.membersOfGroupChatBesidesInitator[this.membersOfGroupChatBesidesInitator.length-1][1];
        }
        return fullNames;
    }


}