    import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { BlockUserPopup } from '../components/blockUserPopup.component';
import { ConvoDetailsPanel } from '../components/convoDetailsPanel.component';
import { CreateNewNote } from '../components/createNewNote.component';
import { DeleteChatPopup } from '../components/deleteChatPopup.component';
import { LeaveGroupPopup } from '../components/leaveGroupPopup.component';
import { LeftSidebarComponent } from '../components/leftSidebar.component';
import { ListOfMessageRequestsSection } from '../components/listOfMessageRequestsSection.component';
import { MessageReactionsPopup } from '../components/messageReactionsPopup.component';
import { MessagesOfAChat } from '../components/messagesOfAChat.component';
import { NewMessagePopup } from '../components/newMessagePopup.component';
import { NoteSection } from '../components/noteSection.component';
import { NotesAndConvosSection } from '../components/notesAndConvosSection.component';
import { PromoteUserPopup } from '../components/promoteUserPopup.component';
import { RequestedMessagesOfAChat } from '../components/requestedMessagesOfAChat.component';
import { UserSettingsPopup } from '../components/userSettingsPopup.component';
import { Note } from '../note.model';



    @Component({
    selector: 'app2',
    standalone: true,
    imports: [RouterOutlet, LeftSidebarComponent, CommonModule, NotesAndConvosSection,
    MessagesOfAChat, CreateNewNote, NoteSection, MessageReactionsPopup, NewMessagePopup, ConvoDetailsPanel,
    DeleteChatPopup, BlockUserPopup, ListOfMessageRequestsSection, RequestedMessagesOfAChat, LeaveGroupPopup,
    UserSettingsPopup, PromoteUserPopup],
    templateUrl: './app2.component.html',
    styleUrl: '../styles.css'
    })
    export class App2 {
    showMessagesOfAChat:boolean = true;
    showCreateNewNote:boolean = false;
    showNoteSection:boolean = false;
    noteSectionUsername:string = "";
    noteSectionIsOwnAccount:boolean = false;
    authenticatedUsername!: string;
    messageRecipientInfo:string[] = [];
    showMessageReactionsPopup:boolean = false;
    messageReactionsInfo:string[][] = [];
    showNewMessagePopup:boolean = false;
    listOfConvos!:any[][];
    messagesOfAChatIsExpanded:boolean = false;
    showConvoDetailsPanel:boolean = false;
    displayDeleteChatPopup:boolean = false;
    displayBlockUserPopup:boolean = false;
    isForwarding:boolean = false;
    messageToForward!:string;
    messageData!:any[][];
    requestedMessageData!:any[][];
    fileToForward:any[] = [];
    displayListOfMessageRequestsSection:boolean = false;
    requestedMessagesOfAChatIsExpanded:boolean = false;
    convoIsRequested:boolean = false;
    listOfRequestedConvos!: any[][];
    isRequestingConvoWithRecipient:boolean=false;
    username: string | null = '';
    constructor(private route: ActivatedRoute) { }
    groupMessageRecipientsInfo:any[][]=[];
    selectedConvo:number = -1;
    selectedConvoTitle:any = "";
    selectedConvoId:any = "";
    displayLeaveGroupPopup:boolean = false;
    displayAddMembersPopup:boolean = false;
    isAddingNewMembers:boolean = false;
    displayUserSettingsPopup:boolean = false;
    userSettingsPopupGroupMessageMember!:string[];
    blockedUsernames:string[]=[];
    selectedConvoPromotedUsernames:string[] = [];
    displayPromoteUserPopup:boolean = false;
    listOfNotes1!:Note[];
    isSelectedConvoMuted!:boolean;
    hasSelectedConvoBeenAdded!: boolean;

    ngOnInit() {
        this.username = this.route.snapshot.paramMap.get('username');
        /*
        if(this.username!==null) {
            this.authenticateUser(<string>this.username);
            if(this.authenticatedUsername!.length>0) {
                localStorage.setItem("defaultUsername", this.authenticatedUsername!);
            }
        }
        else {
            if(localStorage.getItem("defaultUsername")) {
                this.authenticateUser(<string>localStorage.getItem("defaultUsername"));
            }
        }
        */
        this.authenticatedUsername = <string>this.username;
    }

    async authenticateUser(username: string) {
        const response = await fetch('http://localhost:8003/cookies/authenticateUser/'+username, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
        });
        if(!response.ok) {
            throw new Error('Network response not ok');
        }
        const isAuth = await response.json();
        if(isAuth) {
            this.authenticatedUsername = username;
            return;
        }
        else {
            const data = {'username':username};
            const response2 = await fetch('http://localhost:8003/cookies/updateAuthToken', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            if(!response2.ok) {
                throw new Error('Network response not ok');
            }
            const response2Data = await response2.text();
            if(response2Data === "Cookie updated successfully") {
                const response3 = await fetch('http://localhost:8003/cookies/authenticateUser/'+username, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });
                if(!response3.ok) {
                    throw new Error('Network response not ok');
                }
                const isAuth = await response.json();
                if(isAuth) {
                    this.authenticatedUsername = username;
                    return;
                }
            }
            else if(response2Data === "Invalid refresh token for username") {
                const response4 = await fetch('http://localhost:8003/cookies/updateRefreshToken', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data),
                    credentials: 'include',
                });
                if(!response4.ok) {
                    throw new Error('Network response not ok');
                }
                const response4Data = await response4.text();
                if(response4Data === "Cookie updated successfully"){
                    const response5 = await fetch('http://localhost:8003/cookies/authenticateUser/'+username, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include'
                    });
                    if(!response5.ok) {
                        throw new Error('Network response not ok');
                    }
                    const isAuth = await response.json();
                    if(isAuth) {
                        this.authenticatedUsername = username;
                        return;
                    }
                    }
                }
                window.location.href = "http://localhost:8000/login";
                }
    }

    enterCreateNewNote() {
    this.showCreateNewNote = true;
    this.showMessagesOfAChat = false;
    this.showNoteSection = false;
    }

    exitOutOfCreateNewNote() {
    this.showCreateNewNote = false;
    this.showMessagesOfAChat = true;
    this.showNoteSection = false;
    }

    handleExitCreateNewNoteNotification(){
        this.exitOutOfCreateNewNote();
    }

    handleShowCreateNewNoteNotification() {
    this.enterCreateNewNote();
    }

    handleShowNoteSectionNotification(username: string) {
    this.noteSectionUsername = username;
    this.noteSectionIsOwnAccount = username===this.authenticatedUsername;
    this.enterNoteSection();
    }

    enterNoteSection() {
    this.showNoteSection = true;
    this.showCreateNewNote = false;
    this.showMessagesOfAChat = false;
    }

    exitNoteSection() {
    this.showMessagesOfAChat = true;
    this.showNoteSection = false;
    }

    async showMessagesOfConvo(messageRecipientInfo: Array<string>) {
        this.messageRecipientInfo = messageRecipientInfo;
        this.groupMessageRecipientsInfo = [];
        this.showMessagesOfAChat = true;
    }

    showMessageReactions(messageReactionsInfo: Array<Array<string>>) {
    this.showMessageReactionsPopup = true;
    this.messageReactionsInfo = messageReactionsInfo;
    }

    closeMessageReactionsPopup() {
    this.showMessageReactionsPopup = false;
    this.messageReactionsInfo = [];
    }

    displayNewMessagePopup() {
    this.isForwarding = false;
    this.fileToForward = [];
    this.messageToForward = "";
    this.showNewMessagePopup = true;
    this.isAddingNewMembers = false;
    }

    getStyleBasedOnPopups() {
    return this.showNewMessagePopup || this.displayDeleteChatPopup || this.displayBlockUserPopup || this.displayLeaveGroupPopup
    || this.displayUserSettingsPopup || this.showMessageReactionsPopup || this.displayPromoteUserPopup ?
    {
        'opacity': '0.15',
        'pointer-events': 'none'
    } :
    {
        'opacity': 1,
        'pointer-events': 'auto'
    };
    }

    closeNewMessagePopup() {
    this.showNewMessagePopup = false;
    }

    flattenAndSort(arr: string[][]) {
        return arr.reduce((acc, val) => acc.concat(val), []).sort();
    }

    groupConvoIsNotFoundInRequestedConvos(groupMessageMembers: string[][]) {
        const flattenedAndSortedMembers = this.flattenAndSort(groupMessageMembers);
        let twoConvosAreEqual;
        let convoInListOfConvos;
        for(let i=0; i<this.listOfRequestedConvos.length; i++) {
            let convo = this.listOfRequestedConvos[i];
            twoConvosAreEqual = true;
            if(convo[1]!==this.authenticatedUsername) {
                convoInListOfConvos = this.flattenAndSort([convo[1], convo[2],  this.flattenAndSort(convo[5])]);
            }
            else {
                convoInListOfConvos = this.flattenAndSort(convo[5]);
            }
            if(convoInListOfConvos.length!==flattenedAndSortedMembers.length) {
                twoConvosAreEqual = false;
            }
            else {
                for(let j=0; j < flattenedAndSortedMembers.length; j++) {
                    if(flattenedAndSortedMembers[j]!==convoInListOfConvos[j]) {
                        twoConvosAreEqual = false;
                        break;
                    }
                }
            }
            if(twoConvosAreEqual) {
                return i;
            }
            
        }
        return true;
    }

    groupConvoIsNew(groupMessageMembers: string[][]) {
        const flattenedAndSortedMembers = this.flattenAndSort(groupMessageMembers);
        let twoConvosAreEqual;
        let convoInListOfConvos;
        for(let i=0; i<this.listOfConvos.length; i++) {
            let convo = this.listOfConvos[i];
            twoConvosAreEqual = true;
            if(convo[1]!==this.authenticatedUsername) {
                convoInListOfConvos = this.flattenAndSort([convo[1], convo[2],  this.flattenAndSort(convo[5])]);
            }
            else {
                convoInListOfConvos = this.flattenAndSort(convo[5]);
            }
            if(convoInListOfConvos.length!==flattenedAndSortedMembers.length) {
                twoConvosAreEqual = false;
            }
            else {
                for(let j=0; j < flattenedAndSortedMembers.length; j++) {
                    if(flattenedAndSortedMembers[j]!==convoInListOfConvos[j]) {
                        twoConvosAreEqual = false;
                        break;
                    }
                }
            }
            if(twoConvosAreEqual) {
                return i;
            }
            
        }
        return true;
    }

    async startMessagingSelectedUsers(selectedUsers: string[][]) {
        this.showNewMessagePopup = false;
        selectedUsers = selectedUsers.filter(x=>x[0]!==this.authenticatedUsername);
        const newConvoId = uuidv4();
        if(selectedUsers.length==1) {
            if(this.listOfConvos.filter(x=>x[1]===selectedUsers[0][0] && x[5].length==0).length==0) {
                for(let i=0; i<this.listOfRequestedConvos.length; i++) {
                    let requestedConvo = this.listOfRequestedConvos[i];
                    if(requestedConvo[1]===selectedUsers[0][0]) {
                        this.selectedConvo = i;
                        this.selectedConvoTitle = requestedConvo[6];
                        this.selectedConvoId = requestedConvo[8];
                        this.displayListOfMessageRequestsSection = true;
                        await this.acceptRequestedConvo();
                        this.displayListOfMessageRequestsSection = false;
                        this.showMessagesOfConvo(selectedUsers[0]);
                        await this.updateSelectedConvo(this.listOfConvos.length-1);
                        return;
                    }
                }
                this.listOfConvos.push(["", selectedUsers[0][0], selectedUsers[0][1], false, false, [], "", [], newConvoId, [0, 0], [0, 0], 0,
            [0, 0], [0, 0], false]);

                await this.updateSelectedConvo(this.listOfConvos.length-1);

                this.showMessagesOfConvo(selectedUsers[0]);

            }
            else {
                this.showMessagesOfConvo(selectedUsers[0]);

                for(let i=0; i<this.listOfConvos.length; i++) {
                    let convo = this.listOfConvos[i];
                    if(convo[1]===selectedUsers[0][0] && convo[5].length==0) {
                        await this.updateSelectedConvo(i);
                        if(convo[13][convo[11]] == 1) {
                            convo[13][convo[11]] = 0;
                            const response = await fetch('http://localhost:8012/editConvo/'+this.selectedConvoId, {
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                convoTitle: this.selectedConvoTitle,
                                members: JSON.stringify(this.getMembersOfSelectedConvo()),
                                convoInitiator: JSON.stringify([convo[1], convo[2]]),
                                latestMessage: JSON.stringify([convo[16], convo[15]]),
                                promotedUsers: JSON.stringify(convo[7]),
                                isMuted: JSON.stringify(convo[9]),
                                hasUnreadMessage: JSON.stringify(convo[10]),
                                isRequested: JSON.stringify(convo[12]),
                                isDeleted: JSON.stringify(convo[13])
                                })
                            });
                            if(!response.ok) {
                                throw new Error('Network response not ok');
                            }
                        }
                        return;
                    }
                }
        }
        }
        else if(selectedUsers.length>1) {
            let x = this.groupConvoIsNew(selectedUsers);
            if (typeof x === 'boolean') {
                let y = this.groupConvoIsNotFoundInRequestedConvos(selectedUsers);
                if(typeof y === 'boolean') {
                    this.listOfConvos.push(["", this.authenticatedUsername, "Rishav Ray", false, false, selectedUsers, "", [], uuidv4(), new Array(selectedUsers.length+1).fill(0),
                    new Array(selectedUsers.length+1).fill(0), 0, new Array(selectedUsers.length+1).fill(0), false]);
        
                    await this.updateSelectedConvo(this.listOfConvos.length-1);
                    
                    let thisUser = [[this.authenticatedUsername, "Rishav Ray"]];
                    this.showMessagesOfThisGroupConvo(thisUser.concat(selectedUsers));
                }
                else {
                    let requestedConvo = this.listOfRequestedConvos[y];
                    this.selectedConvo = y;
                    this.selectedConvoTitle = requestedConvo[6];
                    this.selectedConvoId = requestedConvo[8];
                    this.displayListOfMessageRequestsSection = true;
                    await this.acceptRequestedConvo();
                    this.displayListOfMessageRequestsSection = false;
                    this.showMessagesOfThisGroupConvo(selectedUsers);
                    await this.updateSelectedConvo(this.listOfConvos.length-1);
                }
            }
            else {
                let convo = this.listOfConvos[x];
                let thisUser = []
                if(convo[1]==this.authenticatedUsername) {
                    thisUser.push([convo[1], convo[2]]);
                }
                this.showMessagesOfThisGroupConvo(thisUser.concat(selectedUsers));
                await this.updateSelectedConvo(x);
            }
        }
    }
    


    receiveListOfConvos(listOfConvos: any[][]) {
    this.listOfConvos = listOfConvos;
    }

    receiveListOfRequestedConvos(listOfRequestedConvos: any[][]) {
    this.listOfRequestedConvos = listOfRequestedConvos;
    }

    receiveMessageData(messageData: any[][]) {
    this.messageData = messageData;
    }

    receiveRequestedMessageData(requestedMessageData: any[][]) {
        this.requestedMessageData = requestedMessageData;
    }

    formatTimeSinceSent(date: Date): string {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
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

    async updateLatestMessageInConvo(latestMessageInfo: any[]) {
        const data = {
            convoTitle: this.selectedConvoTitle,
            members: JSON.stringify(this.getMembersOfSelectedConvo()),
            convoInitiator: JSON.stringify([this.listOfConvos[this.selectedConvo][1], this.listOfConvos[this.selectedConvo][2]]),
            latestMessage: JSON.stringify([latestMessageInfo[0], latestMessageInfo[1]]),
            promotedUsers: JSON.stringify(this.listOfConvos[this.selectedConvo][7]),
            isMuted: JSON.stringify(this.listOfConvos[this.selectedConvo][9]),
            hasUnreadMessage: JSON.stringify(this.listOfConvos[this.selectedConvo][10]),
            isRequested: JSON.stringify(this.listOfConvos[this.selectedConvo][12]),
            isDeleted: JSON.stringify(this.listOfConvos[this.selectedConvo][13])
        };
        const response = await fetch("http://localhost:8012/editConvo/" + this.selectedConvoId, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if(!response.ok) {
            throw new Error('Network response not ok');
        }
        this.listOfConvos[this.selectedConvo][0] = latestMessageInfo[0] + " · " + this.formatTimeSinceSent(latestMessageInfo[1]);
        this.listOfConvos[this.selectedConvo][16] = latestMessageInfo[0];
        this.listOfConvos[this.selectedConvo][15] = latestMessageInfo[1];

    }

    async deleteConvo(convoRecipient: string) {
        const response = await fetch('http://localhost:8012/deleteConvo/'+this.selectedConvoId, {
            method: 'DELETE'
        });
        if(!response.ok) {
            throw new Error('Network response not ok');
        }
        this.listOfConvos.splice(this.selectedConvo, 1);
        this.messageRecipientInfo = [];
        this.groupMessageRecipientsInfo = [];
    }

    updateExpansionOfMessagesOfAChat(notesAndConvosSectionIsExpanded: boolean) {
    this.messagesOfAChatIsExpanded = !notesAndConvosSectionIsExpanded;
    }

    toggleConvoDetails() {
    this.convoIsRequested = false;
    if(!this.showConvoDetailsPanel) {
        this.showConvoDetailsPanel = true;
        this.isSelectedConvoMuted = this.listOfConvos[this.selectedConvo][4];
    }
    else {
        this.showConvoDetailsPanel = false;
        this.isSelectedConvoMuted = this.listOfConvos[this.selectedConvo][4];
    }
    }

    toggleRequestedConvoDetails() {
    this.convoIsRequested = true;
    this.showConvoDetailsPanel = !this.showConvoDetailsPanel;
    }

    showDeleteChatPopup() {
    this.displayDeleteChatPopup =true;
    }

    showBlockUserPopup() {
    this.displayBlockUserPopup = true;
    }

    cancelDeleteChat() {
    this.displayDeleteChatPopup = false;
    }

    async deleteChat() {
        if(!this.displayListOfMessageRequestsSection) {
            this.listOfConvos[this.selectedConvo][13][this.listOfConvos[this.selectedConvo][11]] = 1;
            const data = {
                convoTitle: this.selectedConvoTitle,
                members: JSON.stringify(this.getMembersOfSelectedConvo()),
                convoInitiator: JSON.stringify([this.listOfConvos[this.selectedConvo][1], this.listOfConvos[this.selectedConvo][2]]),
                latestMessage: JSON.stringify([this.listOfConvos[this.selectedConvo][16], this.listOfConvos[this.selectedConvo][15]]),
                promotedUsers: JSON.stringify(this.listOfConvos[this.selectedConvo][7]),
                isMuted: JSON.stringify(this.listOfConvos[this.selectedConvo][9]),
                hasUnreadMessage: JSON.stringify(this.listOfConvos[this.selectedConvo][10]),
                isRequested: JSON.stringify(this.listOfConvos[this.selectedConvo][12]),
                isDeleted: JSON.stringify(this.listOfConvos[this.selectedConvo][13])
            };
            const response = await fetch('http://localhost:8012/editConvo/'+this.selectedConvoId, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            if(!response.ok) {
                throw new Error('Network response not ok');
            }
            this.listOfConvos.splice(this.selectedConvo,1);
            this.messageRecipientInfo = [];
            this.groupMessageRecipientsInfo = [];
            this.displayDeleteChatPopup = false;
            this.showConvoDetailsPanel = false;
        }
        else {
            this.listOfRequestedConvos.splice(this.selectedConvo,1);
            this.messageRecipientInfo = [];
            this.groupMessageRecipientsInfo = [];
            this.displayDeleteChatPopup = false;
            this.showConvoDetailsPanel = false;
        }
    }

    cancelBlockUser() {
    this.displayBlockUserPopup = false;
    }

    blockUser() {
    // code for blocking user
    if(!this.displayListOfMessageRequestsSection) {
            this.listOfConvos.splice(this.selectedConvo, 1);
            this.messageRecipientInfo = [];
            this.groupMessageRecipientsInfo = [];
            this.displayBlockUserPopup = false;
            this.showConvoDetailsPanel = false;
    }
    else {
            this.listOfRequestedConvos.splice(this.selectedConvo,1);
            this.messageRecipientInfo = [];
            this.groupMessageRecipientsInfo = [];
            this.displayBlockUserPopup = false;
            this.showConvoDetailsPanel = false;
        }
    }

    async toggleMutedMessageIconInConvo() {
        const url = "http://localhost:8012/editConvo/"+ this.selectedConvoId;
        if(this.listOfConvos[this.selectedConvo][9][this.listOfConvos[this.selectedConvo][11]]==0) {
            this.listOfConvos[this.selectedConvo][9][this.listOfConvos[this.selectedConvo][11]] = 1;
        }
        else {
            this.listOfConvos[this.selectedConvo][9][this.listOfConvos[this.selectedConvo][11]] = 0;
        }
        const data = {
            convoTitle: this.selectedConvoTitle,
            members: JSON.stringify(this.getMembersOfSelectedConvo()),
            convoInitiator: JSON.stringify([this.listOfConvos[this.selectedConvo][1], this.listOfConvos[this.selectedConvo][2]]),
            latestMessage: JSON.stringify([this.listOfConvos[this.selectedConvo][16], this.listOfConvos[this.selectedConvo][15]]),
            promotedUsers: JSON.stringify(this.listOfConvos[this.selectedConvo][7]),
            isMuted: JSON.stringify(this.listOfConvos[this.selectedConvo][9]),
            hasUnreadMessage: JSON.stringify(this.listOfConvos[this.selectedConvo][10]),
            isRequested: JSON.stringify(this.listOfConvos[this.selectedConvo][12]),
            isDeleted: JSON.stringify(this.listOfConvos[this.selectedConvo][13])
        };
        try {
            const response = await axios.patch(url, data);
            if(response.data) {
                this.listOfConvos[this.selectedConvo][4] = !this.listOfConvos[this.selectedConvo][4];
            }
        } catch (error) {
            console.error('Error updating data:', error);
            throw error;
        }
    }

    showForwardMessagePopup(messageToForward: string) {
    this.isForwarding = true;
    this.isAddingNewMembers = false;
    this.fileToForward = [];
    this.messageToForward = messageToForward;
    this.showNewMessagePopup = true;
    }

    showForwardFilePopup(fileToForward: Array<any>) {
    this.isForwarding = true;
    this.isAddingNewMembers = false;
    this.fileToForward = fileToForward;
    this.showNewMessagePopup = true;
    }

    getUsernamesOfMembers(members:string[][]) {
        let usernamesOfMembers:string = members[0][0];
        for(let i = 1; i < members.length-1; i++) {
            usernamesOfMembers+= ", " + members[i][0];
        }
        usernamesOfMembers += ", & " + members[members.length-1][0];
        return usernamesOfMembers;
    }

    async forwardMessageToSelectedUsers(forwardMessageInfo:any[]) {
        await this.startMessagingSelectedUsers(forwardMessageInfo[1]);
        const newMessageId = uuidv4();
        let message;
        if(forwardMessageInfo[2].length==1) {
            message = ["Forward", forwardMessageInfo[2][0][0],  forwardMessageInfo[0]];
            this.messageData[0].push([this.authenticatedUsername, ["Forward", "forwarded a message from a conversation with " + forwardMessageInfo[2][0][0],  forwardMessageInfo[0], newMessageId], new Date()]);
        }
        else {
            message = ["Forward", this.getUsernamesOfMembers(forwardMessageInfo[2]),  forwardMessageInfo[0]];
            this.messageData[0].push([this.authenticatedUsername, ["Forward", "forwarded a message from a conversation with " + this.getUsernamesOfMembers(forwardMessageInfo[2]),  forwardMessageInfo[0], newMessageId], new Date()]);
        }
        this.messageData[1].push([]);
        this.messageData[2].push([]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([-1, -1]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);
        const responseForSendingForwardedMessage = await fetch('http://localhost:8012/addMessage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                messageId: newMessageId,
                convoId: this.selectedConvoId,
                message: JSON.stringify(message),
                sender: this.authenticatedUsername,
                messageSentAt: new Date()
            })
        });
        
        if(!responseForSendingForwardedMessage.ok) {
            throw new Error('Network response not ok');
        }
        
    }

    forwardFileToSelectedUsers(forwardMessageInfo:any[]) {
    this.startMessagingSelectedUsers(forwardMessageInfo[1]);
    if(forwardMessageInfo[1].length==1 && forwardMessageInfo[2].length==1) {
        this.messageData[0].push([this.authenticatedUsername, "", new Date(), forwardMessageInfo[2][0][0]]);
        this.messageData[1].push([]);
        this.messageData[2].push([]);
        this.messageData[3].push([forwardMessageInfo[0][0]]);
        this.messageData[4].push([forwardMessageInfo[0][1]]);
        this.messageData[5].push([-1, -1]);
        this.messageData[6].push([[]]);
        this.messageData[7].push([[]]);
    }

    }

    showListOfMessageRequestsSection() {
    this.messageRecipientInfo = [];
    this.groupMessageRecipientsInfo = [];
    this.displayListOfMessageRequestsSection = true;
    this.showMessagesOfAChat = false;
    this.selectedConvo = -1;
    }


    updateExpansionOfRequestedMessagesOfAChat(notesAndConvosSectionIsExpanded: boolean) {
    this.requestedMessagesOfAChatIsExpanded = !notesAndConvosSectionIsExpanded;
    }

    closeListOfMessageRequestsSection() {
    this.displayListOfMessageRequestsSection = false;
    this.messageRecipientInfo = []
    this.groupMessageRecipientsInfo = [];
    this.showMessagesOfAChat = true;
    this.selectedConvo = -1;
    }

    showMessagesOfRequestedConvo(messageRecipientInfo: string[]) {
        this.messageRecipientInfo = messageRecipientInfo;
        this.groupMessageRecipientsInfo = [];
    }

    showMessagesOfRequestedGroupConvo(groupMessageRecipientsInfo: string[][]) {
        this.groupMessageRecipientsInfo = groupMessageRecipientsInfo;
        this.messageRecipientInfo = [];
    }

    deleteRequestedConvo() {
        this.listOfRequestedConvos.splice(this.selectedConvo, 1);
        this.messageRecipientInfo = [];
        this.groupMessageRecipientsInfo = [];
        this.selectedConvo = -1;
    }

    async acceptRequestedConvo() {
        const url = "http://localhost:8012/editConvo/"+ this.selectedConvoId;
        this.listOfRequestedConvos[this.selectedConvo][12][this.listOfRequestedConvos[this.selectedConvo][11]] = 0;
        const data = {
            convoTitle: this.selectedConvoTitle,
            members: JSON.stringify(this.getMembersOfSelectedConvo()),
            convoInitiator: JSON.stringify([this.listOfRequestedConvos[this.selectedConvo][1], this.listOfRequestedConvos[this.selectedConvo][2]]),
            latestMessage: JSON.stringify([this.listOfRequestedConvos[this.selectedConvo][16], this.listOfRequestedConvos[this.selectedConvo][15]]),
            promotedUsers: JSON.stringify(this.listOfRequestedConvos[this.selectedConvo][7]),
            isMuted: JSON.stringify(this.listOfRequestedConvos[this.selectedConvo][9]),
            hasUnreadMessage: JSON.stringify(this.listOfRequestedConvos[this.selectedConvo][10]),
            isRequested: JSON.stringify(this.listOfRequestedConvos[this.selectedConvo][12]),
            isDeleted: JSON.stringify(this.listOfRequestedConvos[this.selectedConvo][13])
        };
        try {
            const response = await axios.patch(url, data);
            if(response.data) {
                this.listOfConvos.push(this.listOfRequestedConvos[this.selectedConvo]);
                this.listOfRequestedConvos.splice(this.selectedConvo,1);
                this.messageRecipientInfo = [];
                this.groupMessageRecipientsInfo = [];
                this.selectedConvo = -1;
            }
        } catch (error) {
            console.error('Error updating data:', error);
            throw error;
        }

    }

    noteSectionDynamicStyle() {
        return this.showNoteSection ?
        {
            'opacity': 1,
            'pointer-events': 'auto'
        } :
        {
            'opacity': 0,
            'pointer-events': 'none'
        };
    }

    messageRequestsDynamicStyle() {
    return this.displayListOfMessageRequestsSection ?
    {
        'opacity': 1,
        'pointer-events': 'auto'
    } :
    {
        'opacity': 0,
        'pointer-events': 'none'
    };
    }

    messagesDynamicStyle() {
        return !this.displayListOfMessageRequestsSection
        ? {
            'opacity': 1,
            'pointer-events': 'auto'
            }
        : {
            'opacity': 0,
            'pointer-events': 'none'
            };
    }

    showMessagesOfThisGroupConvo(groupConvoMembers:any[][]) {
        this.messageRecipientInfo = [];
        this.groupMessageRecipientsInfo = groupConvoMembers;
        this.showMessagesOfAChat = true;
    }


    async updateSelectedConvo(convoIndex:number) {
            this.selectedConvo = convoIndex;
            if(!this.displayListOfMessageRequestsSection) {
                this.selectedConvoTitle = this.listOfConvos[this.selectedConvo][6];
                this.selectedConvoPromotedUsernames = this.listOfConvos[this.selectedConvo][7];
                this.selectedConvoId = this.listOfConvos[this.selectedConvo][8];
                this.isSelectedConvoMuted = this.listOfConvos[this.selectedConvo][4];
                this.hasSelectedConvoBeenAdded = this.listOfConvos[this.selectedConvo][14];
                this.listOfConvos[this.selectedConvo][0] = this.listOfConvos[this.selectedConvo][16] + " · " + this.formatTimeSinceSent(this.listOfConvos[this.selectedConvo][15]);
                for(let messageDataPart of this.messageData) {
                    while(messageDataPart.length>0) {
                        messageDataPart.splice(messageDataPart.length-1, 1);
                    }
                }
            }
            else {
                this.selectedConvoTitle = this.listOfRequestedConvos[this.selectedConvo][6];
                this.selectedConvoPromotedUsernames = this.listOfRequestedConvos[this.selectedConvo][7];
                this.selectedConvoId = this.listOfRequestedConvos[this.selectedConvo][8];
                this.isSelectedConvoMuted = this.listOfRequestedConvos[this.selectedConvo][4];
                this.hasSelectedConvoBeenAdded = this.listOfRequestedConvos[this.selectedConvo][14];
                this.listOfRequestedConvos[this.selectedConvo][0] = this.listOfRequestedConvos[this.selectedConvo][16] + " · " + this.formatTimeSinceSent(this.listOfRequestedConvos[this.selectedConvo][15]);
                for(let messageDataPart of this.requestedMessageData) {
                    while(messageDataPart.length>0) {
                        messageDataPart.splice(messageDataPart.length-1, 1);
                    }
                }
            }
    

            const response = await fetch('http://localhost:8012/getMessagesForConvo/'+this.selectedConvoId);
            if(!response.ok) {
                throw new Error('Network response not ok');
            }

    
            const messages = await response.json();


            for(let message of messages) {
                message['message'] = JSON.parse(message['message']);
                if(message['message'][0]==='Regular-Message') {
                    if(!this.displayListOfMessageRequestsSection) {
                        this.messageData[0].push([message['sender'], message['message'][1], new Date(message['messageSentAt']+"Z"), message['messageId']]);
                        this.messageData[1].push([]);
                        this.messageData[2].push([]);
                        this.messageData[3].push([]);
                        this.messageData[4].push([]);
                        this.messageData[5].push([-1, -1]);
                        this.messageData[6].push([]);
                        this.messageData[7].push([]);
                    }
                    else {
                        this.requestedMessageData[0].push([message['sender'], message['message'][1], new Date(message['messageSentAt']+"Z"), message['messageId']]);
                        this.requestedMessageData[1].push([]);
                        this.requestedMessageData[2].push([]);
                        this.requestedMessageData[3].push([]);
                        this.requestedMessageData[4].push([]);
                        this.requestedMessageData[5].push([-1, -1]);
                        this.requestedMessageData[6].push([]);
                        this.requestedMessageData[7].push([]);
                    }
                }
                else if(message['message'][0]==='Reply') {
                    if(!this.displayListOfMessageRequestsSection) {
                        this.messageData[0].push([ message['sender'], [ "Reply", "replied to " + message['message'][1],  message['message'][2],
                        message['message'][3], message['messageId'] ], new Date(message['messageSentAt']+"Z") ]);
                        this.messageData[1].push([]);
                        this.messageData[2].push([]);
                        this.messageData[3].push([]);
                        this.messageData[4].push([]);
                        this.messageData[5].push([-1, -1]);
                        this.messageData[6].push([]);
                        this.messageData[7].push([]);
                    }
                    else {
                        this.requestedMessageData[0].push([message['sender'], [ "Reply", "replied to " + message['message'][1],  message['message'][2],
                        message['message'][3], message['messageId'] ], new Date(message['messageSentAt']+"Z")]);
                        this.requestedMessageData[1].push([]);
                        this.requestedMessageData[2].push([]);
                        this.requestedMessageData[3].push([]);
                        this.requestedMessageData[4].push([]);
                        this.requestedMessageData[5].push([-1, -1]);
                        this.requestedMessageData[6].push([]);
                        this.requestedMessageData[7].push([]);
                    }
                }
            else if(message['message'][0]==='Forward') {
                if(!this.displayListOfMessageRequestsSection) {
                    this.messageData[0].push([message['sender'], ["Forward", "forwarded a message from a conversation with " + message['message'][1],  message['message'][2], message['messageId']],
                    new Date(message['messageSentAt']+"Z") ]);
                    this.messageData[1].push([]);
                    this.messageData[2].push([]);
                    this.messageData[3].push([]);
                    this.messageData[4].push([]);
                    this.messageData[5].push([-1, -1]);
                    this.messageData[6].push([]);
                    this.messageData[7].push([]);
                }
                else {
                    this.requestedMessageData[0].push([message['sender'], ["Forward", "forwarded a message from a conversation with " + message['message'][1],  message['message'][2], message['messageId']],
                    new Date(message['messageSentAt']+"Z") ]);
                    this.requestedMessageData[1].push([]);
                    this.requestedMessageData[2].push([]);
                    this.requestedMessageData[3].push([]);
                    this.requestedMessageData[4].push([]);
                    this.requestedMessageData[5].push([-1, -1]);
                    this.requestedMessageData[6].push([]);
                    this.requestedMessageData[7].push([]);
                }
                }
            }
            
    }

    getMembersOfSelectedConvo() {
        let output = [[this.authenticatedUsername, "Rishav Ray"]];
        if(!this.displayListOfMessageRequestsSection) {
            if(this.listOfConvos[this.selectedConvo][1]!==this.authenticatedUsername) {
                output.push([this.listOfConvos[this.selectedConvo][1], this.listOfConvos[this.selectedConvo][2]])
            }
            for(let elem of this.listOfConvos[this.selectedConvo][5]) {
                output.push(elem);
            }
        }

        else {
            if(this.listOfRequestedConvos[this.selectedConvo][1]!==this.authenticatedUsername) {
                output.push([this.listOfRequestedConvos[this.selectedConvo][1], this.listOfRequestedConvos[this.selectedConvo][2]])
            }
            for(let elem of this.listOfRequestedConvos[this.selectedConvo][5]) {
                output.push(elem);
            }

        }

        return output;
    }


    async updateConvoTitle(newConvoTitle: string) {
        const url = "http://localhost:8012/editConvo/"+ this.selectedConvoId;
        const data = {
            convoTitle: newConvoTitle,
            members: JSON.stringify(this.getMembersOfSelectedConvo()),
            convoInitiator: JSON.stringify([this.listOfConvos[this.selectedConvo][1], this.listOfConvos[this.selectedConvo][2]]),
            latestMessage: JSON.stringify([this.listOfConvos[this.selectedConvo][16], this.listOfConvos[this.selectedConvo][15]]),
            promotedUsers: JSON.stringify(this.listOfConvos[this.selectedConvo][7]),
            isMuted: JSON.stringify(this.listOfConvos[this.selectedConvo][9]),
            hasUnreadMessage: JSON.stringify(this.listOfConvos[this.selectedConvo][10]),
            isRequested: JSON.stringify(this.listOfConvos[this.selectedConvo][12]),
            isDeleted: JSON.stringify(this.listOfConvos[this.selectedConvo][13])
        };
        try {
            const response = await axios.patch(url, data);
            if(response.data) {
                this.selectedConvoTitle = newConvoTitle;
                this.listOfConvos[this.selectedConvo][6] = newConvoTitle;
            }
        } catch (error) {
            console.error('Error updating data:', error);
            throw error;
        }
    }

    showLeaveGroupPopup() {
        this.displayLeaveGroupPopup = true;
    }

    leaveGroup() {
        this.listOfConvos.splice(this.selectedConvo, 1);
        this.groupMessageRecipientsInfo = [];
        this.displayLeaveGroupPopup = false;
        this.showConvoDetailsPanel = false;
    }

    cancelLeaveGroup() {
        this.displayLeaveGroupPopup = false;
    }

    showAddMembersPopup() {
        this.isAddingNewMembers = true;
        this.showNewMessagePopup = true;
    }

    addNewMemberToConvo(selectedUsers: any[]) {
        this.showNewMessagePopup = false;
        if(this.groupMessageRecipientsInfo.length>0) {
            for(let user of selectedUsers) {
                if(!this.userIsAlreadyInGroup(user)) {
                    this.listOfConvos[this.selectedConvo][5].push(user);
                    this.groupMessageRecipientsInfo.push(user);
                    this.messageData[0].push([this.authenticatedUsername, ["Add-Member/Remove-Member", "added " + user[0]], new Date()]);
                    this.messageData[1].push([-1, -1]);
                    this.messageData[2].push([]);
                    this.messageData[3].push([]);
                    this.messageData[4].push([]);
                    this.messageData[5].push([]);
                    this.messageData[6].push([]);
                    this.messageData[7].push([]);
                }
            }
        }
        else {
            let isNewUserAdded = false;
            for(let user of selectedUsers) {
                if(!this.userIsAlreadyInGroup(user)) {
                    this.listOfConvos[this.selectedConvo][5].push(user);
                    this.groupMessageRecipientsInfo.push(user);
                    this.messageData[0].push([this.authenticatedUsername, ["Add-Member/Remove-Member", "added " + user[0]], new Date()]);
                    this.messageData[1].push([-1, -1]);
                    this.messageData[2].push([]);
                    this.messageData[3].push([]);
                    this.messageData[4].push([]);
                    this.messageData[5].push([]);
                    this.messageData[6].push([]);
                    this.messageData[7].push([]);
                    if(!isNewUserAdded) {
                        isNewUserAdded = true;
                        for(let message of this.messageData[0]) {
                            if (message[0]===this.authenticatedUsername) {
                                this.listOfConvos[this.selectedConvo][1] = message[0];
                                this.listOfConvos[this.selectedConvo][2] = "Rishav Ray";
                                this.groupMessageRecipientsInfo.unshift(this.messageRecipientInfo);
                                this.groupMessageRecipientsInfo.unshift([message[0], "Rishav Ray"]);
                                this.listOfConvos[this.selectedConvo][5].unshift(this.messageRecipientInfo);
                                break;
                            }
                            else {
                                this.groupMessageRecipientsInfo.unshift(this.messageRecipientInfo);
                            }
                        }
                        this.messageRecipientInfo = [];
                    }
                }
            }

        }

    }


    userIsAlreadyInGroup(user: string[]) {
        if(this.messageRecipientInfo.length>0 && this.messageRecipientInfo[0]===user[0]) {
            return true;
        }
        for(let member of this.groupMessageRecipientsInfo) {
            if(member[0]===user[0]) {
                return true;
            }
        }
        return false;
    }

    showUserSettingsPopup(groupMessageMember: string[]) {
        this.displayUserSettingsPopup = true;
        this.userSettingsPopupGroupMessageMember = groupMessageMember;
    }

    closeUserSettingsPopup() {
        this.displayUserSettingsPopup = false;
    }

    isMemberInSelectedConvoAndNotTheMemberToBeRemoved(member: string) : any {
        if (member===this.userSettingsPopupGroupMessageMember[0]) {
            return false;
        }
        if(member===this.authenticatedUsername) {
            return "Rishav Ray";
        }
        for(let m=0; m<this.listOfConvos[this.selectedConvo][5].length; m++) {
            if (this.listOfConvos[this.selectedConvo][5][m][0]===member) {
                let username = this.listOfConvos[this.selectedConvo][5][m][1];
                this.listOfConvos[this.selectedConvo][5].splice(m, 1);
                return username;
            }
        }
        return false;
    }

    updateGroupMessageRecipientsInfo(newConvoInitiator:string[]) {
        for(let i=0; i < this.groupMessageRecipientsInfo.length; i++) {
            if(this.groupMessageRecipientsInfo[i][0]===newConvoInitiator[0]) {
                this.groupMessageRecipientsInfo.splice(i,1);
                this.groupMessageRecipientsInfo[0] = newConvoInitiator;
            }
        }
    }

    removeMemberFromConvo() {
        this.messageData[0].push([this.authenticatedUsername, ["Add-Member/Remove-Member", "removed " + this.userSettingsPopupGroupMessageMember[0]], new Date()]);
        this.messageData[1].push([-1, -1]);
        this.messageData[2].push([]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);

        for(let j=0; j<this.listOfConvos[this.selectedConvo][7]; j++) {
            if(this.listOfConvos[this.selectedConvo][7][j]===this.userSettingsPopupGroupMessageMember[0]) {
                this.listOfConvos[this.selectedConvo][7].splice(j,1);
                this.selectedConvoPromotedUsernames = this.listOfConvos[this.selectedConvo][7];
                break;
            }
        }

        for(let i=0; i < this.groupMessageRecipientsInfo.length; i++) {
            if(this.groupMessageRecipientsInfo[i][0]===this.userSettingsPopupGroupMessageMember[0]) {
                if(this.groupMessageRecipientsInfo.length==3) {
                    for(let groupMessageRecipient of this.groupMessageRecipientsInfo) {
                        if(groupMessageRecipient[0]!==this.authenticatedUsername && groupMessageRecipient[0]!==this.userSettingsPopupGroupMessageMember[0]) {
                            this.messageRecipientInfo = groupMessageRecipient;
                            this.groupMessageRecipientsInfo = [];
                            this.listOfConvos[this.selectedConvo][1] = this.messageRecipientInfo[0];
                            this.listOfConvos[this.selectedConvo][2] = this.messageRecipientInfo[1];
                            this.listOfConvos[this.selectedConvo][5] = [];
                            this.displayUserSettingsPopup = false;
                            break;
                        }
                    }
                }
                else if(i==0) {
                    for(let message of this.messageData[0]) {
                        let x = this.isMemberInSelectedConvoAndNotTheMemberToBeRemoved(message[0]);
                        if (x!==false) {
                            this.listOfConvos[this.selectedConvo][1] = message[0];
                            this.listOfConvos[this.selectedConvo][2] = x;
                            this.updateGroupMessageRecipientsInfo([message[0], x]);
                            break;
                        }
                    }
                }
                else {
                    this.groupMessageRecipientsInfo.splice(i, 1);
                    this.listOfConvos[this.selectedConvo][5].splice(i-1, 1);
                }
                this.displayUserSettingsPopup = false;
                return;
            }
        }
    }

    blockUserFromUserSettingsPopup() {
        this.blockedUsernames.push(this.userSettingsPopupGroupMessageMember[0]);
        this.displayUserSettingsPopup = false;
    }

    unblockUserFromUserSettingsPopup() {
        this.blockedUsernames.splice(this.blockedUsernames.indexOf(this.userSettingsPopupGroupMessageMember[0]),1);
        this.displayUserSettingsPopup = false;
    }

    promoteUserFromSettingsPopup() {
        this.listOfConvos[this.selectedConvo][7].push(this.userSettingsPopupGroupMessageMember[0]);
        this.displayUserSettingsPopup = false;
        this.messageData[0].push([this.authenticatedUsername, ["Member-Promotion/Member-Demotion", "promoted " + this.userSettingsPopupGroupMessageMember[0]], new Date()]);
        this.messageData[1].push([-1, -1]);
        this.messageData[2].push([]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);
    }

    demoteUserFromSettingsPopup() {
        if(this.listOfConvos[this.selectedConvo][1]===this.userSettingsPopupGroupMessageMember[0]) {
            this.displayUserSettingsPopup = false;
            return;
        }
        else {
            this.listOfConvos[this.selectedConvo][7].splice(
                this.listOfConvos[this.selectedConvo][7].indexOf(this.userSettingsPopupGroupMessageMember[0]),
                1);
        }
        this.messageData[0].push([this.authenticatedUsername, ["Member-Promotion/Member-Demotion", "demoted " + this.userSettingsPopupGroupMessageMember[0]], new Date()]);
        this.messageData[1].push([-1, -1]);
        this.messageData[2].push([]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);
        this.displayUserSettingsPopup = false;
    }

    showPromoteUserPopup() {
        this.displayPromoteUserPopup = true;
    }

    closePromoteUserPopup() {
        this.displayPromoteUserPopup = false;
    }

    promoteUserFromPromoteUserPopup() {
        this.listOfConvos[this.selectedConvo][7].push(this.messageRecipientInfo[0]);
        this.selectedConvoPromotedUsernames =  this.listOfConvos[this.selectedConvo][7];
        this.messageData[0].push([this.authenticatedUsername, ["Member-Promotion/Member-Demotion", "promoted " + this.messageRecipientInfo[0]], new Date()]);
        this.messageData[1].push([-1, -1]);
        this.messageData[2].push([]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);
        this.displayPromoteUserPopup = false;
    }

    demoteNonGroupConvoUserFromConvoDetails() {
        for(let i=0; i < this.listOfConvos[this.selectedConvo][7].length; i++) {
            if(this.listOfConvos[this.selectedConvo][7][i]===this.messageRecipientInfo[0]) {
                this.listOfConvos[this.selectedConvo][7] = [];
                break;
            }
        }
        if(this.listOfConvos[this.selectedConvo][7].length!==0) {
            return;
        }
        this.messageData[0].push([this.authenticatedUsername, ["Member-Promotion/Member-Demotion", "demoted " + this.messageRecipientInfo[0]], new Date()]);
        this.messageData[1].push([-1, -1]);
        this.messageData[2].push([]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);
        this.selectedConvoPromotedUsernames = [];
    }

    receiveListOfNotes1(listOfNotes1: Note[]) {
        this.listOfNotes1 = listOfNotes1;
    }

    sendNoteReply(noteReplyInfo: string[]) {
        this.messageData[0].push([this.authenticatedUsername, ["Note-Reply", noteReplyInfo], new Date()]);
        this.messageData[1].push([-1, -1]);
        this.messageData[2].push([]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);
        for(let i=0; i<this.listOfConvos.length; i++) {
            let convo = this.listOfConvos[i];
            if(convo[1]===noteReplyInfo[2] && convo[5].length==0) {
                this.selectedConvo = i;
                this.selectedConvoTitle = convo[6];
                this.selectedConvoPromotedUsernames = convo[7];
                this.showMessagesOfConvo([noteReplyInfo[2], noteReplyInfo[3]]);
                this.listOfConvos[this.selectedConvo][0] = "You: " + noteReplyInfo[0] + "• 1m", noteReplyInfo[2], noteReplyInfo[3];
                return;
            }
        }
        this.listOfConvos.push(["You: " + noteReplyInfo[0] + "• 1m", noteReplyInfo[2], noteReplyInfo[3], false, false, [], "", []]);
        this.selectedConvo = this.listOfConvos.length-1;
        this.selectedConvoTitle = "";
        this.selectedConvoPromotedUsernames = [];

        this.showMessagesOfConvo([noteReplyInfo[2], noteReplyInfo[3]]);
    }

    async addConvoToDatabase(latestMessageOfConvoToAdd: any[]) {
        let convoToAdd = this.listOfConvos[this.selectedConvo];
        const response = await fetch('http://localhost:8012/addConvo', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                convoId: convoToAdd[8],
                convoTitle: this.selectedConvoTitle,
                members: JSON.stringify(this.getMembersOfSelectedConvo()),
                convoInitiator: JSON.stringify([this.authenticatedUsername, "Rishav Ray"]),
                latestMessage: JSON.stringify(latestMessageOfConvoToAdd),
                promotedUsers: JSON.stringify(convoToAdd[7]),
                isMuted: JSON.stringify(convoToAdd[9]),
                hasUnreadMessage: JSON.stringify(convoToAdd[10]),
                isRequested: JSON.stringify(convoToAdd[12]),
                isDeleted: JSON.stringify(convoToAdd[13])
            })
        });
        if(!response.ok) {
            throw new Error('Network response not ok');
        }
        this.listOfConvos[this.selectedConvo][14] = true;
        this.hasSelectedConvoBeenAdded = true;
        this.listOfConvos[this.selectedConvo][0] = latestMessageOfConvoToAdd[0] + " • 1m";
        
    }


}




