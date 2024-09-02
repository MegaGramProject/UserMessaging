    import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { VisibilityService } from '../app/visibility.service';
import { BlockUserPopup } from '../components/blockUserPopup.component';
import { ConvoDetailsPanel } from '../components/convoDetailsPanel.component';
import { CreateNewNote } from '../components/createNewNote.component';
import { DeleteChatPopup } from '../components/deleteChatPopup.component';
import { DeleteMessagePopup } from '../components/deleteMessagePopup.component';
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
    UserSettingsPopup, PromoteUserPopup, DeleteMessagePopup],
    templateUrl: './app2.component.html',
    styleUrl: '../styles.css'
    })
    export class App2 {
    showMessagesOfAChat:boolean = true;
    showCreateNewNote:boolean = false;
    showNoteSection:boolean = false;
    noteSectionUsername:string = "";
    noteSectionFullName:string = "";
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
    groupMessageRecipientsInfo:any[][]=[];
    selectedConvo:number = -1;
    selectedConvoTitle:any = "";
    selectedConvoId:any = "";
    displayLeaveGroupPopup:boolean = false;
    displayAddMembersPopup:boolean = false;
    isAddingNewMembers:boolean = false;
    displayUserSettingsPopup:boolean = false;
    userSettingsPopupGroupMessageMember!:string[];
    selectedConvoPromotedUsernames:string[] = [];
    displayPromoteUserPopup:boolean = false;
    listOfNotes1ForUser!:Note[];
    isSelectedConvoMuted!:boolean;
    hasSelectedConvoBeenAdded!: boolean;
    selectedConvoInitator!:string[];
    authenticatedFullName!: string;
    messageIdToReactionsMapping!: { [key: string]: any[] };
    messageIdsOfSelectedConvo!: string[];
    userBlockings!: string[];
    userFollowings!: any[];
    membersOfSelectedConvo!: string[][];
    isRequestedOfSelectedConvo!:any[];
    displayDeleteMessagePopup:boolean = false;
    deleteMessagePopupMessageId:string = "";
    deleteMessagePopupMessageIndex:number = -1;
    isActive:boolean = true;
    socket!:WebSocket;

    constructor(private visibilityService: VisibilityService, private route: ActivatedRoute) { }

    async ngOnInit() {
        this.visibilityService.isActive$.subscribe(isActive => {
            this.isActive = isActive;
        });
        this.username = this.route.snapshot.paramMap.get('username');
        /*
        if(this.username!==null) {
            await this.authenticateUser(<string>this.username);
            if(this.authenticatedUsername!.length>0) {
                localStorage.setItem("defaultUsername", this.authenticatedUsername!);
            }
        }
        else {
            if(localStorage.getItem("defaultUsername")) {
                await this.authenticateUser(<string>localStorage.getItem("defaultUsername"));
            }
        }
        */
        this.authenticatedUsername = <string>this.username;
        /*
        const response = await fetch('http://localhost:8001/getFullName/'+this.authenticatedUsername);
        if(!response.ok) {
            throw new Error('Network response not ok');
        }
        const fullNameOfAuthenticatedUser = await response.text();
    
        this.authenticatedFullName = fullNameOfAuthenticatedUser;
        */
        this.authenticatedFullName = "Rishav Ray";

        this.socket = new WebSocket('ws://localhost:8017');

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
        }

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        }
        
        await this.notifyBackendOfActivityStatus();
        setInterval(this.notifyBackendOfActivityStatus.bind(this), 5000);
        
    }

    async notifyBackendOfActivityStatus() {
        const response = await fetch('http://localhost:8016/notifyOfActivityStatus/'+this.authenticatedUsername, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                activityStatus: this.isActive ? 'active' : 'idle',
                currDateTime: new Date()
            })
        });
        if(!response.ok) {
            throw new Error('Network response not ok');
        }
    
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

    handleShowNoteSectionNotification(usernameAndFullName: string[]) {
    this.noteSectionUsername = usernameAndFullName[0];
    this.noteSectionFullName = usernameAndFullName[1];
    this.noteSectionIsOwnAccount = usernameAndFullName[0]===this.authenticatedUsername;
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

    showDeleteMessagePopup(idOfMessageToBeDeleted:any[]) {
        this.displayDeleteMessagePopup = true;
        this.deleteMessagePopupMessageId = idOfMessageToBeDeleted[1];
        this.deleteMessagePopupMessageIndex = idOfMessageToBeDeleted[0];
    }

    cancelDeleteMessagePopup() {
        this.displayDeleteMessagePopup = false;
        this.deleteMessagePopupMessageId = "";
        this.deleteMessagePopupMessageIndex = -1;
    }

    async deleteMessageFromDeleteMessagePopup() {
        const response = await fetch('http://localhost:8012/deleteMessage/'+this.deleteMessagePopupMessageId, {
            method: 'DELETE'
        });

        if(!response.ok) {
            throw new Error('Network response not ok');
        }
        this.messageData[0].splice(this.deleteMessagePopupMessageIndex, 1);
        this.messageData[1].splice(this.deleteMessagePopupMessageIndex, 1);
        this.messageData[2].splice(this.deleteMessagePopupMessageIndex, 1);
        this.messageData[3].splice(this.deleteMessagePopupMessageIndex, 1);
        this.messageData[4].splice(this.deleteMessagePopupMessageIndex, 1);
        this.messageData[5].splice(this.deleteMessagePopupMessageIndex, 1);
        this.messageData[6].splice(this.deleteMessagePopupMessageIndex, 1);
        this.messageData[7].splice(this.deleteMessagePopupMessageIndex, 1);

        this.displayDeleteMessagePopup = false;
        this.deleteMessagePopupMessageId = "";
        this.deleteMessagePopupMessageIndex = -1;
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
    || this.displayUserSettingsPopup || this.showMessageReactionsPopup || this.displayPromoteUserPopup || this.displayDeleteMessagePopup ?
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

    getIsRequestedForNewGroupConvo(membersOfThisNewGroupConvo: string[][]) {
        let output = [0];
        this.isRequestingConvoWithRecipient = true;
        for(let i=1; i<membersOfThisNewGroupConvo.length; i++) {
            if(this.userFollowings.filter(x=>x['follower']===membersOfThisNewGroupConvo[i][0]).length==0) {
                output.push(1);
            }
            else {
                output.push(0);
                this.isRequestingConvoWithRecipient = false;
            }
        }
        return output;
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
                        await this.showMessagesOfConvo(selectedUsers[0]);
                        await this.updateSelectedConvo(this.listOfConvos.length-1);
                        return;
                    }
                }
                let thisUser = [this.authenticatedUsername, this.authenticatedFullName];
                let membersOfThisConvo = [thisUser];
                for(let selectedUser of selectedUsers) {
                    membersOfThisConvo.push(selectedUser);
                }
                if(this.userFollowings.filter(x=>x['follower']===selectedUsers[0][0]).length>0) {
                    this.listOfConvos.push(["", selectedUsers[0][0], selectedUsers[0][1], false, false, [], "", [], newConvoId, [0, 0], [0, 0], 0,
                    [0, 0], [0, 0], false, new Date(), "", thisUser, membersOfThisConvo ]);
                    this.isRequestingConvoWithRecipient = false;
                }
                else {
                    this.listOfConvos.push(["", selectedUsers[0][0], selectedUsers[0][1], false, false, [], "", [], newConvoId, [0, 0], [0, 0], 0,
                    [0, 1], [0, 0], false, new Date(), "", thisUser, membersOfThisConvo ]);
                    this.isRequestingConvoWithRecipient = true;
                }

                await this.updateSelectedConvo(this.listOfConvos.length-1);

                await this.showMessagesOfConvo(selectedUsers[0]);

            }
            else {
                await this.showMessagesOfConvo(selectedUsers[0]);

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
                                convoInitiator: JSON.stringify([convo[17][0], convo[17][1]]),
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
                    let thisAuthUser = [this.authenticatedUsername, this.authenticatedFullName];
                    let membersOfThisConvo = [thisAuthUser];
                    for(let selectedUser of selectedUsers) {
                        membersOfThisConvo.push(selectedUser);
                    }
                    const isRequested = this.getIsRequestedForNewGroupConvo(membersOfThisConvo);
                    this.listOfConvos.push(["", this.authenticatedUsername, this.authenticatedFullName, false, false, selectedUsers, "", [], newConvoId, new Array(selectedUsers.length+1).fill(0),
                    new Array(selectedUsers.length+1).fill(0), 0, isRequested, new Array(selectedUsers.length+1).fill(0), false, new Date(), "", thisAuthUser,
                    membersOfThisConvo]);

                    await this.updateSelectedConvo(this.listOfConvos.length-1);
                    
                    let thisUser = [[this.authenticatedUsername, this.authenticatedFullName]];
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
                if(convo[13][convo[11]] == 1) {
                    convo[13][convo[11]] = 0;
                    const response = await fetch('http://localhost:8012/editConvo/'+this.selectedConvoId, {
                    method: 'PATCH',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        convoTitle: this.selectedConvoTitle,
                        members: JSON.stringify(this.getMembersOfSelectedConvo()),
                        convoInitiator: JSON.stringify([convo[17][0], convo[17][1]]),
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

    receiveUserBlockings(userBlockings: string[]) {
        this.userBlockings = userBlockings;
    }

    receiveUserFollowings(userFollowings: any[]) {
        this.userFollowings = userFollowings;
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
            convoInitiator: JSON.stringify([this.listOfConvos[this.selectedConvo][17][0], this.listOfConvos[this.selectedConvo][17][1]]),
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
        if(latestMessageInfo[0].startsWith(this.authenticatedUsername+":")) {
            this.listOfConvos[this.selectedConvo][0] =  "You: " + latestMessageInfo[0].substring(this.authenticatedUsername.length+2) + " · " + this.formatTimeSinceSent(latestMessageInfo[1]);
        }
        else {
            this.listOfConvos[this.selectedConvo][0] = latestMessageInfo[0].substring(latestMessageInfo[0].indexOf(":")+2) + " · " + this.formatTimeSinceSent(latestMessageInfo[1]);
        }
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
            let shouldConvoBeDeleted:boolean = true;
            for(let isDeletedByConvoMember of this.listOfConvos[this.selectedConvo][13]) {
                if(isDeletedByConvoMember==0) {
                    shouldConvoBeDeleted = false;
                    break;
                }
            }
            if(shouldConvoBeDeleted) {
                this.deleteConvo("");
                return;
            }
            const data = {
                convoTitle: this.selectedConvoTitle,
                members: JSON.stringify(this.getMembersOfSelectedConvo()),
                convoInitiator: JSON.stringify([this.listOfConvos[this.selectedConvo][17][0], this.listOfConvos[this.selectedConvo][17][1]]),
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

    async blockUser() {
        const response = await fetch('http://localhost:8013/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                mutation {
                    addUserBlocking(newUserBlocking: { blocker: "${this.authenticatedUsername}" blockee: "${this.messageRecipientInfo[0]}" })
                }
                `
                })
            });
        if(!response.ok) {
            throw new Error('Network response not ok');
        }
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
            convoInitiator: JSON.stringify([this.listOfConvos[this.selectedConvo][17][0], this.listOfConvos[this.selectedConvo][17][1]]),
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
        if(this.areYouRequestingConvoWithRecipient() && this.messageData[0].length==3) {
            return;
        }
        if(this.listOfConvos[this.selectedConvo][14]==false) {
            this.addConvoToDatabase([this.authenticatedUsername+ ": " + forwardMessageInfo[0], new Date()]);
        }

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
        this.messageData[5].push([null]);
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

    async forwardFileToSelectedUsers(forwardMessageInfo:any[]) {
        await this.startMessagingSelectedUsers(forwardMessageInfo[1]);
        if(this.areYouRequestingConvoWithRecipient() && this.messageData[0].length==3) {
            return;
        }
        if(this.listOfConvos[this.selectedConvo][14]==false) {
            this.addConvoToDatabase([this.authenticatedUsername+ ": " + forwardMessageInfo[0], new Date()]);
        }
        const newMessageId = uuidv4();
        const responseForSendingForwardedFileMessage = await fetch('http://localhost:8012/addMessage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                messageId: newMessageId,
                convoId: this.selectedConvoId,
                message: JSON.stringify(['Regular-Message', "File-Forward from Convo ft. " + forwardMessageInfo[2][0][0]]),
                sender: this.authenticatedUsername,
                messageSentAt: new Date()
            })
        });
        
        if(!responseForSendingForwardedFileMessage.ok) {
            throw new Error('Network response not ok');
        }

        const formData = new FormData();
    
        formData.append('convoId', this.selectedConvoId);
        formData.append('messageId', newMessageId);
        formData.append('0', forwardMessageInfo[0][0]);

        const responseForSendingFilesOfMessage = await fetch('http://localhost:8013/api/sendFilesWithMessage', {
            method: 'POST',
            body: formData
        });

        if(!responseForSendingFilesOfMessage.ok) {
            throw new Error('Network response not ok');
        }

        if(forwardMessageInfo[2].length==1) {
                this.messageData[0].push([this.authenticatedUsername, "File-Forward from Convo ft. " + forwardMessageInfo[2][0][0], new Date(), newMessageId]);
                this.messageData[1].push([]);
                this.messageData[2].push([]);
                this.messageData[3].push([forwardMessageInfo[0][0]]);
                this.messageData[4].push([forwardMessageInfo[0][1]]);
                this.messageData[5].push([null]);
                this.messageData[6].push([[]]);
                this.messageData[7].push([[]]);
        }
        else {
            this.messageData[0].push([this.authenticatedUsername, "File-Forward from Convo ft. " + this.getUsernamesOfMembers(forwardMessageInfo[2]), new Date(), newMessageId]);
            this.messageData[1].push([]);
            this.messageData[2].push([]);
            this.messageData[3].push([forwardMessageInfo[0][0]]);
            this.messageData[4].push([forwardMessageInfo[0][1]]);
            this.messageData[5].push([null]);
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

    async deleteAllRequestedConvos() {
        while(this.listOfRequestedConvos.length>0) {
            await this.updateSelectedConvo(0);
            await this.deleteRequestedConvo();
        }
        this.selectedConvo = -1;
        this.listOfRequestedConvos = [];
    }

    async deleteRequestedConvo() {
        if(this.getMembersOfSelectedConvo().length==2) {
            await this.deleteConvo("");
            this.listOfRequestedConvos.splice(this.selectedConvo, 1);
            this.selectedConvo = -1;
            this.messageRecipientInfo = [];
            this.groupMessageRecipientsInfo = [];
            return;
        }
        await this.leaveGroup();
        const response2 = await axios.post('http://localhost:8012/addMessage', {
            messageId: uuidv4(),
            convoId: this.selectedConvoId,
            message: JSON.stringify(["Add-Member/Remove-Member", "declined the request to join this group"]),
            sender: this.authenticatedUsername,
            messageSentAt: new Date()
        });
        if(response2.data) {
            this.listOfRequestedConvos.splice(this.selectedConvo, 1);
            this.selectedConvo = -1;
            this.messageRecipientInfo = [];
            this.groupMessageRecipientsInfo = [];
        }
    }

    async acceptRequestedConvo() {
        const url = "http://localhost:8012/editConvo/"+ this.selectedConvoId;
        this.listOfRequestedConvos[this.selectedConvo][12][this.listOfRequestedConvos[this.selectedConvo][11]] = 0;
        this.listOfRequestedConvos[this.selectedConvo][13][this.listOfRequestedConvos[this.selectedConvo][11]] = 0;
        const data = {
            convoTitle: this.selectedConvoTitle,
            members: JSON.stringify(this.getMembersOfSelectedConvo()),
            convoInitiator: JSON.stringify([this.listOfRequestedConvos[this.selectedConvo][17][0], this.listOfRequestedConvos[this.selectedConvo][17][1]]),
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
                const response2 = await axios.post('http://localhost:8012/addMessage', {
                    messageId: uuidv4(),
                    convoId: this.selectedConvoId,
                    message: JSON.stringify(["Add-Member/Remove-Member", "accepted the request to join this group"]),
                    sender: this.authenticatedUsername,
                    messageSentAt: new Date()
                });
                if(response2.data) {
                    this.listOfConvos.push(this.listOfRequestedConvos[this.selectedConvo]);
                    this.listOfRequestedConvos.splice(this.selectedConvo,1);
                    this.messageRecipientInfo = [];
                    this.groupMessageRecipientsInfo = [];
                    this.selectedConvo = -1;
                }
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

    areYouRequestingConvoWithRecipient(): boolean {
        for(let i=0; i<this.listOfConvos[this.selectedConvo][12].length; i++) {
            if(this.listOfConvos[this.selectedConvo][12][i]==0 && this.listOfConvos[this.selectedConvo][18][i][0]!==this.authenticatedUsername) {
                return false;
            }
        }
        return true;
    }


    async updateSelectedConvo(convoIndex:number) {
            this.selectedConvo = convoIndex;
            if(!this.displayListOfMessageRequestsSection) {
                this.isRequestingConvoWithRecipient = this.areYouRequestingConvoWithRecipient();
                this.selectedConvoTitle = this.listOfConvos[this.selectedConvo][6];
                this.selectedConvoPromotedUsernames = this.listOfConvos[this.selectedConvo][7];
                this.selectedConvoId = this.listOfConvos[this.selectedConvo][8];
                this.isSelectedConvoMuted = this.listOfConvos[this.selectedConvo][4];
                this.hasSelectedConvoBeenAdded = this.listOfConvos[this.selectedConvo][14];
                this.selectedConvoInitator = this.listOfConvos[this.selectedConvo][17];
                this.membersOfSelectedConvo = this.listOfConvos[this.selectedConvo][18];
                this.isRequestedOfSelectedConvo = this.listOfConvos[this.selectedConvo][12];
                for(let messageDataPart of this.messageData) {
                    while(messageDataPart.length>0) {
                        messageDataPart.splice(messageDataPart.length-1, 1);
                    }
                }
                this.socket.send(JSON.stringify(['is-typing', this.selectedConvoId]));
            }
            else {
                this.isRequestingConvoWithRecipient = false;
                this.selectedConvoTitle = this.listOfRequestedConvos[this.selectedConvo][6];
                this.selectedConvoPromotedUsernames = this.listOfRequestedConvos[this.selectedConvo][7];
                this.selectedConvoId = this.listOfRequestedConvos[this.selectedConvo][8];
                this.isSelectedConvoMuted = this.listOfRequestedConvos[this.selectedConvo][4];
                this.hasSelectedConvoBeenAdded = this.listOfRequestedConvos[this.selectedConvo][14];
                this.selectedConvoInitator = this.listOfRequestedConvos[this.selectedConvo][17];
                this.membersOfSelectedConvo = this.listOfRequestedConvos[this.selectedConvo][18];
                this.isRequestedOfSelectedConvo = this.listOfRequestedConvos[this.selectedConvo][12];
                for(let messageDataPart of this.requestedMessageData) {
                    while(messageDataPart.length>0) {
                        messageDataPart.splice(messageDataPart.length-1, 1);
                    }
                }
            }


            const response0 = await fetch('http://localhost:8014/getAllFilesThatWereRepliedToInConvo/'+this.selectedConvoId);
            if(!response0.ok) {
                throw new Error('Network response not ok');
            }
            const repliedToFilesInConvo = await response0.json();

            const response = await fetch('http://localhost:8012/getMessagesForConvo/'+this.selectedConvoId);
            if(!response.ok) {
                throw new Error('Network response not ok');
            }

            const messages = await response.json();
            this.messageIdsOfSelectedConvo = [];

            for(let message of messages) {
                message['message'] = JSON.parse(message['message']);
                this.messageIdsOfSelectedConvo.push(message['messageId']);
                if(message['message'][0]==='Regular-Message') {
                    if(!this.displayListOfMessageRequestsSection) {
                        this.messageData[0].push([message['sender'], message['message'][1], new Date(message['messageSentAt']+"Z"), message['messageId']]);
                        this.messageData[1].push([]);
                        this.messageData[2].push([]);
                        this.messageData[3].push([]);
                        this.messageData[4].push([]);
                        this.messageData[5].push([null]);
                        this.messageData[6].push([]);
                        this.messageData[7].push([]);
                    }
                    else {
                        this.requestedMessageData[0].push([message['sender'], message['message'][1], new Date(message['messageSentAt']+"Z"), message['messageId']]);
                        this.requestedMessageData[1].push([]);
                        this.requestedMessageData[2].push([]);
                        this.requestedMessageData[3].push([]);
                        this.requestedMessageData[4].push([]);
                        this.requestedMessageData[5].push([null]);
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
                        this.messageData[5].push([null]);
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
                        this.requestedMessageData[5].push([null]);
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
                    this.messageData[5].push([null]);
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
                    this.requestedMessageData[5].push([null]);
                    this.requestedMessageData[6].push([]);
                    this.requestedMessageData[7].push([]);
                }
                }
                else if(message['message'][0]==='Convo-Title') {
                    if(!this.displayListOfMessageRequestsSection) {
                        this.messageData[0].push([message['sender'], ["Convo-Title", message['message'][1], message['messageId']],
                    new Date(message['messageSentAt']+"Z") ]);
                        this.messageData[1].push([]);
                        this.messageData[2].push([]);
                        this.messageData[3].push([]);
                        this.messageData[4].push([]);
                        this.messageData[5].push([null]);
                        this.messageData[6].push([]);
                        this.messageData[7].push([]);
                    }
                    else {
                        this.requestedMessageData[0].push([message['sender'], ["Convo-Title", message['message'][1], message['messageId']],
                    new Date(message['messageSentAt']+"Z") ]);
                        this.requestedMessageData[1].push([]);
                        this.requestedMessageData[2].push([]);
                        this.requestedMessageData[3].push([]);
                        this.requestedMessageData[4].push([]);
                        this.requestedMessageData[5].push([null]);
                        this.requestedMessageData[6].push([]);
                        this.requestedMessageData[7].push([]);

                    }

                }
                else if(message['message'][0]==='Video-Chat/Audio-Chat') {
                    if(!this.displayListOfMessageRequestsSection) {
                        this.messageData[0].push([message['sender'], ["Video-Chat/Audio-Chat", message['message'][1], message['messageId']],
                        new Date(message['messageSentAt']+"Z") ]);
                        this.messageData[1].push([]);
                        this.messageData[2].push([]);
                        this.messageData[3].push([]);
                        this.messageData[4].push([]);
                        this.messageData[5].push([null]);
                        this.messageData[6].push([]);
                        this.messageData[7].push([]);
                    }
                    else {
                        this.requestedMessageData[0].push([message['sender'], ["Video-Chat/Audio-Chat", message['message'][1], message['messageId']],
                        new Date(message['messageSentAt']+"Z") ]);
                        this.requestedMessageData[1].push([]);
                        this.requestedMessageData[2].push([]);
                        this.requestedMessageData[3].push([]);
                        this.requestedMessageData[4].push([]);
                        this.requestedMessageData[5].push([null]);
                        this.requestedMessageData[6].push([]);
                        this.requestedMessageData[7].push([]);
                    }

                }
                else if(message['message'][0]==='Member-Promotion/Member-Demotion') {
                    if(!this.displayListOfMessageRequestsSection) {
                        this.messageData[0].push([message['sender'], ['Member-Promotion/Member-Demotion', message['message'][1], message['messageId']],
                        new Date(message['messageSentAt']+"Z") ]);
                        this.messageData[1].push([]);
                        this.messageData[2].push([]);
                        this.messageData[3].push([]);
                        this.messageData[4].push([]);
                        this.messageData[5].push([null]);
                        this.messageData[6].push([]);
                        this.messageData[7].push([]);
                    }
                    else {
                        this.requestedMessageData[0].push([message['sender'], ['Member-Promotion/Member-Demotion', message['message'][1], message['messageId']],
                        new Date(message['messageSentAt']+"Z") ]);
                        this.requestedMessageData[1].push([]);
                        this.requestedMessageData[2].push([]);
                        this.requestedMessageData[3].push([]);
                        this.requestedMessageData[4].push([]);
                        this.requestedMessageData[5].push([null]);
                        this.requestedMessageData[6].push([]);
                        this.requestedMessageData[7].push([]);
                    }
                }

                else if(message['message'][0]==='Add-Member/Remove-Member') {
                    if(!this.displayListOfMessageRequestsSection) {
                        this.messageData[0].push([message['sender'], ["Add-Member/Remove-Member", message['message'][1], message['messageId']],  new Date(message['messageSentAt']+"Z")]);
                        this.messageData[1].push([]);
                        this.messageData[2].push([]);
                        this.messageData[3].push([]);
                        this.messageData[4].push([]);
                        this.messageData[5].push([<any>null]);
                        this.messageData[6].push([]);
                        this.messageData[7].push([]);
                    }
                    else {
                        this.requestedMessageData[0].push([message['sender'], ["Add-Member/Remove-Member", message['message'][1], message['messageId']],  new Date(message['messageSentAt']+"Z")]);
                        this.requestedMessageData[1].push([]);
                        this.requestedMessageData[2].push([]);
                        this.requestedMessageData[3].push([]);
                        this.requestedMessageData[4].push([]);
                        this.requestedMessageData[5].push([null]);
                        this.requestedMessageData[6].push([]);
                        this.requestedMessageData[7].push([]);

                    }
                }
                else if(message['message'][0]==='File-Reply') {
                    let fileInConvo = repliedToFilesInConvo[message['message'][2]];
                    let uint8Array = this.base64ToUint8Array(fileInConvo['content']);
                    let blob = new Blob([uint8Array], { type: fileInConvo['content_type'] });
                    let fileInConvoAsObject = new File([blob], fileInConvo['filename'], { type: fileInConvo['content_type'] });

                    if(!this.displayListOfMessageRequestsSection) {
                        this.messageData[0].push([message['sender'], message['message'][3],  new Date(message['messageSentAt']+"Z"), message['messageId']]);
                        this.messageData[1].push([]);
                        this.messageData[2].push([]);
                        this.messageData[3].push([]);
                        this.messageData[4].push([]);
                        this.messageData[5].push([fileInConvoAsObject, message['message'][1], message['message'][2], this.getImageForFileReply(fileInConvoAsObject)]);
                        this.messageData[6].push([]);
                        this.messageData[7].push([]);
                    }
                    else {
                        this.requestedMessageData[0].push([message['sender'], message['message'][3],  new Date(message['messageSentAt']+"Z"), message['messageId']]);
                        this.requestedMessageData[1].push([]);
                        this.requestedMessageData[2].push([]);
                        this.requestedMessageData[3].push([]);
                        this.requestedMessageData[4].push([]);
                        this.requestedMessageData[5].push([fileInConvoAsObject, message['message'][1], message['message'][2], this.getImageForFileReply(fileInConvoAsObject)]);
                        this.requestedMessageData[6].push([]);
                        this.requestedMessageData[7].push([]);

                    }
                }
                else if(message['message'][0]==='Note-Reply') {
                    if(!this.displayListOfMessageRequestsSection) {
                        this.messageData[0].push([message['sender'], ["Note-Reply", message['message'][1], message['messageId']], new Date()]);
                        this.messageData[1].push([]);
                        this.messageData[2].push([]);
                        this.messageData[3].push([]);
                        this.messageData[4].push([]);
                        this.messageData[5].push([<any>null]);
                        this.messageData[6].push([]);
                        this.messageData[7].push([]);
                    }
                    else {
                        this.requestedMessageData[0].push([message['sender'], ["Note-Reply", message['message'][1], message['messageId']], new Date()]);
                        this.requestedMessageData[1].push([]);
                        this.requestedMessageData[2].push([]);
                        this.requestedMessageData[3].push([]);
                        this.requestedMessageData[4].push([]);
                        this.requestedMessageData[5].push([null]);
                        this.requestedMessageData[6].push([]);
                        this.requestedMessageData[7].push([]);
                    }
                }
            
            }

            const response2 = await fetch('http://localhost:8013/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
                        query {
                            getAllMessageReactions (
                                filter: {
                                    convoId: "${this.selectedConvoId}"
                                }
                            ) {
                                convoId
                                messageId
                                username
                                fullName
                                reaction
                            }
                        }
                    `
                })
            });
            this.messageIdToReactionsMapping = {};
            let messageReactionsForSelectedConvo = await response2.json();
            messageReactionsForSelectedConvo = messageReactionsForSelectedConvo['data']['getAllMessageReactions'];

            for (let messageReaction of messageReactionsForSelectedConvo) {
                const messageId = messageReaction['messageId'];

                if (!(messageId in this.messageIdToReactionsMapping)) {
                    this.messageIdToReactionsMapping[messageId] = [messageReaction];
                } else {
                    this.messageIdToReactionsMapping[messageId].push(messageReaction);
                }
            }

            let reactionsForMessage;
            let reactionUsernamesForMessage;
            let messageIdOfCurrentMessage;
            let messageData0;

            if(!this.displayListOfMessageRequestsSection) {
                messageData0 = this.messageData[0];
            }
            else {
                messageData0 = this.requestedMessageData[0];
            }

            for(let i=0; i<messageData0.length; i++) {
                reactionsForMessage = [];
                reactionUsernamesForMessage = [];
                messageIdOfCurrentMessage = this.messageIdsOfSelectedConvo[i];
                if(messageIdOfCurrentMessage in this.messageIdToReactionsMapping) {
                    for(let messageReaction of this.messageIdToReactionsMapping[messageIdOfCurrentMessage]) {
                        reactionsForMessage.push(messageReaction['reaction']);
                        reactionUsernamesForMessage.push(messageReaction['username']);
                    }
                }
                if(!this.displayListOfMessageRequestsSection) {
                    this.messageData[1][i] = reactionsForMessage;
                    this.messageData[2][i] = reactionUsernamesForMessage;
                }
                else {
                    this.requestedMessageData[1][i] = reactionsForMessage;
                    this.requestedMessageData[2][i] = reactionUsernamesForMessage;
                }
            }

            const response3 = await fetch('http://localhost:8013/api/getAllFilesForConvo/'+this.selectedConvoId);
            if(!response3.ok) {
                throw new Error('Network response not ok');
            }
            const allFilesForConvo = await response3.json();
            allFilesForConvo.sort((a:any, b:any) =>  a['position'] - b['position']);

            let filesForMessage;
            let fileImagesForMessage:string[];
            let uint8Array;
            let blob;
            let fileObject;
            let fileUrl;
            const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml'];

            for(let i=0; i<messageData0.length; i++) {
                messageIdOfCurrentMessage = this.messageIdsOfSelectedConvo[i];
                filesForMessage = [];
                fileImagesForMessage = [];
                for(let fileForConvo of allFilesForConvo) {
                    if(fileForConvo['messageId']===messageIdOfCurrentMessage) {
                        uint8Array = this.base64ToUint8Array(fileForConvo['fileAsString']);
                        blob = new Blob([uint8Array], { type: fileForConvo['mimeType'] });
                        fileObject = new File([blob], fileForConvo['fileName'], { type: fileForConvo['mimeType'] });
                        filesForMessage.push(fileObject);

                        if(acceptedTypes.includes(fileForConvo['mimeType'])) {
                            fileUrl = URL.createObjectURL(fileObject);
                            fileImagesForMessage.push(fileUrl);
                        }
                        else {
                            fileImagesForMessage.push("default file image");
                        }
                        if(!this.displayListOfMessageRequestsSection) {
                            this.messageData[6][i].push([]);
                            this.messageData[7][i].push([]);
                        }
                        else {
                            this.requestedMessageData[6][i].push([]);
                            this.requestedMessageData[7][i].push([]);
                        }
                    }
                }
                if(!this.displayListOfMessageRequestsSection) {
                    this.messageData[3][i] = filesForMessage;
                    this.messageData[4][i] = fileImagesForMessage;
                }
                else {
                    this.requestedMessageData[3][i] = filesForMessage;
                    this.requestedMessageData[4][i] = fileImagesForMessage;
                }
            }

            const response4 = await fetch('http://localhost:8014/getAllMessageFileReactionsForConvo/'+this.selectedConvoId);
            if(!response4.ok) {
                throw new Error('Network response not ok');
            }
            const allMessageFileReactionsForConvo = await response4.json();

            type MessageFileReactionMappings = Record<string, Array<Record<string, string>>>;
            const messageFileReactionMappings: MessageFileReactionMappings = {};
            
            let key;
            let reactionsForFile;
            filesForMessage = [];

            for(let convoFileReaction of allMessageFileReactionsForConvo) {
                key = [convoFileReaction['messageId'], convoFileReaction['position']].toString();
                if (!(key in messageFileReactionMappings)) {
                    messageFileReactionMappings[key] = [{
                        reaction: convoFileReaction['reaction'],
                        reactionUsername: convoFileReaction['reactionUsername']
                    }];
                } else {
                    messageFileReactionMappings[key].push({
                        reaction: convoFileReaction['reaction'],
                        reactionUsername: convoFileReaction['reactionUsername']
                    });
                }
            }

            for(let i=0; i<messageData0.length; i++) {
                messageIdOfCurrentMessage = this.messageIdsOfSelectedConvo[i];
                if(!this.displayListOfMessageRequestsSection) {
                    filesForMessage = this.messageData[3][i];
                }
                else {
                    filesForMessage = this.requestedMessageData[3][i];
                }
                for(let j=0; j<filesForMessage.length; j++) {
                    key = [messageIdOfCurrentMessage, j].toString();
                    reactionsForFile = messageFileReactionMappings[key];
                    if(reactionsForFile) {
                        for(let reactionForFile of reactionsForFile) {
                            if(!this.displayListOfMessageRequestsSection) {
                                this.messageData[6][i][j].push(reactionForFile['reaction']);
                                this.messageData[7][i][j].push(reactionForFile['reactionUsername']);
                            }
                            else {
                                this.requestedMessageData[6][i][j].push(reactionForFile['reaction']);
                                this.requestedMessageData[7][i][j].push(reactionForFile['reactionUsername']);
                            }
                        }
                    }
                }
            }
    }

    base64ToUint8Array(base64:string) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
    
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
    
        return bytes;
    }

    getMembersOfSelectedConvo() {
        if(!this.displayListOfMessageRequestsSection) {
            return this.listOfConvos[this.selectedConvo][18];
        }
        return this.listOfRequestedConvos[this.selectedConvo][18];
    }


    async updateConvoTitle(convoTitleUpdateInfo: any[]) {
        let newConvoTitle = convoTitleUpdateInfo[3];
        const url = "http://localhost:8012/editConvo/"+ this.selectedConvoId;
        const data = {
            convoTitle: newConvoTitle,
            members: JSON.stringify(this.getMembersOfSelectedConvo()),
            convoInitiator: JSON.stringify([this.listOfConvos[this.selectedConvo][17][0], this.listOfConvos[this.selectedConvo][17][1]]),
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
        finally {
            try {
                const response = await axios.post('http://localhost:8012/addMessage', {
                    messageId: uuidv4(),
                    convoId: this.selectedConvoId,
                    message: JSON.stringify(["Convo-Title", this.authenticatedUsername + " changed the title of this conversation from " + <string>convoTitleUpdateInfo[1][1]]),
                    sender: this.authenticatedUsername,
                    messageSentAt: convoTitleUpdateInfo[2]
                });
                if(response.data) {
                    return;
                }
            }
            catch (error) {
                console.error('Error updating data:', error);
                throw error;
            }
        }
    }

    showLeaveGroupPopup() {
        this.displayLeaveGroupPopup = true;
    }

    userHasntDeletedConvo(username: string): any {
        let membersOfSelectedConvo = this.getMembersOfSelectedConvo();
        for(let i=0; i< membersOfSelectedConvo.length; i++) {
            if(membersOfSelectedConvo[i][0]===username) {
                if(this.listOfConvos[this.selectedConvo][13][i] == 0) {
                    return membersOfSelectedConvo[i];
                }
                return false;
            }
        }
    }

    findNewConvoInitator(formerConvoInitatorUsername: string) {
        for(let message of this.messageData[0]) {
            if(message[0]!==formerConvoInitatorUsername) {
                let x = this.userHasntDeletedConvo(message[0]);
                if(x!==false) {
                    this.selectedConvoInitator = <string[]> x;
                    return;
                }
            }
        }
        for(let member of this.getMembersOfSelectedConvo()) {
            if(member[0]!==formerConvoInitatorUsername) {
                let x = this.userHasntDeletedConvo(member[0]);
                if(x!==false) {
                    this.selectedConvoInitator = <string[]> x;
                    return;
                }
            }
        }
    }

    async leaveGroup() {
        let convo;
        if(!this.displayListOfMessageRequestsSection) {
            this.listOfConvos[this.selectedConvo][9].splice(this.listOfConvos[this.selectedConvo][11], 1);
            this.listOfConvos[this.selectedConvo][10].splice(this.listOfConvos[this.selectedConvo][11], 1);
            this.listOfConvos[this.selectedConvo][12].splice(this.listOfConvos[this.selectedConvo][11], 1);
            this.listOfConvos[this.selectedConvo][13].splice(this.listOfConvos[this.selectedConvo][11], 1);
            this.listOfConvos[this.selectedConvo][18].splice(this.listOfConvos[this.selectedConvo][11], 1);
            convo = this.listOfConvos[this.selectedConvo];
        }
        else {
            this.listOfRequestedConvos[this.selectedConvo][9].splice(this.listOfRequestedConvos[this.selectedConvo][11], 1);
            this.listOfRequestedConvos[this.selectedConvo][10].splice(this.listOfRequestedConvos[this.selectedConvo][11], 1);
            this.listOfRequestedConvos[this.selectedConvo][12].splice(this.listOfRequestedConvos[this.selectedConvo][11], 1);
            this.listOfRequestedConvos[this.selectedConvo][13].splice(this.listOfRequestedConvos[this.selectedConvo][11], 1);
            this.listOfRequestedConvos[this.selectedConvo][18].splice(this.listOfRequestedConvos[this.selectedConvo][11], 1);
            convo = this.listOfRequestedConvos[this.selectedConvo];
        }

        for(let i=0; i<this.selectedConvoPromotedUsernames.length; i++) {
            if(this.selectedConvoPromotedUsernames[i]===this.authenticatedUsername) {
                this.selectedConvoPromotedUsernames.splice(i, 1);
                break;
            }
        }

        if(this.selectedConvoInitator[0]===this.authenticatedUsername) {
            this.findNewConvoInitator(this.authenticatedUsername);
            this.deleteConvo("");
            return;
        }

        

        const response = await fetch('http://localhost:8012/editConvo/'+ this.selectedConvoId, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                convoTitle: this.selectedConvoTitle,
                members: JSON.stringify(this.getMembersOfSelectedConvo()),
                convoInitiator: JSON.stringify(this.selectedConvoInitator),
                latestMessage: JSON.stringify([convo[16], convo[15]]),
                promotedUsers: JSON.stringify(this.selectedConvoPromotedUsernames),
                isMuted: JSON.stringify(convo[9]),
                hasUnreadMessage: JSON.stringify(convo[10]),
                isRequested: JSON.stringify(convo[12]),
                isDeleted: JSON.stringify(convo[13])
            })
        });

        if(!response.ok) {
            throw new Error('Network response not ok');
        }

        if(!this.displayListOfMessageRequestsSection) {
            this.listOfConvos.splice(this.selectedConvo, 1);
        }
        else {
            this.listOfRequestedConvos.splice(this.selectedConvo, 1);
        }
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

    getImageForFileReply(file: any) {
        const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml'];
        if (acceptedTypes.includes(file.type)) {
            return URL.createObjectURL(file);
        }
        else {
            return "fileImage.png";
        }
    }

    async addNewMemberToConvo(selectedUsers: any[]) {
        this.showNewMessagePopup = false;
        let responseForSendingMessage;
        let newMessageId;
        if(this.groupMessageRecipientsInfo.length>0) {
            for(let user of selectedUsers) {
                if(!this.userIsAlreadyInGroup(user) && this.userFollowings.filter(x=>x['follower']===user[0]).length>0) {
                    this.listOfConvos[this.selectedConvo][5].push(user);
                    this.listOfConvos[this.selectedConvo][18].push(user);
                    //isMuted for new user
                    this.listOfConvos[this.selectedConvo][9].push(0);
                    //hasUnreadMessage for new user
                    this.listOfConvos[this.selectedConvo][10].push(0);
                     //isRequested for new user
                    this.listOfConvos[this.selectedConvo][12].push(0);
                    //isDeleted for new user
                    this.listOfConvos[this.selectedConvo][13].push(0);

                    this.groupMessageRecipientsInfo.push(user);

                    newMessageId = uuidv4();
                    responseForSendingMessage = await fetch('http://localhost:8012/addMessage', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            messageId: newMessageId,
                            convoId: this.selectedConvoId,
                            message: JSON.stringify(["Add-Member/Remove-Member", "added " + user[0]]),
                            sender: this.authenticatedUsername,
                            messageSentAt: new Date()
                        })
                    });
                    
                    if(!responseForSendingMessage.ok) {
                        throw new Error('Network response not ok');
                    }

                    this.messageData[0].push([this.authenticatedUsername, ["Add-Member/Remove-Member", "added " + user[0], newMessageId], new Date()]);
                    this.messageData[1].push([]);
                    this.messageData[2].push([]);
                    this.messageData[3].push([]);
                    this.messageData[4].push([]);
                    this.messageData[5].push([<any>null]);
                    this.messageData[6].push([]);
                    this.messageData[7].push([]);
                }
                else if(!this.userIsAlreadyInGroup(user) && this.userFollowings.filter(x=>x['follower']===user[0]).length==0) {
                    this.listOfConvos[this.selectedConvo][5].push(user);
                    this.listOfConvos[this.selectedConvo][18].push(user);
                    //isMuted for new user
                    this.listOfConvos[this.selectedConvo][9].push(0);
                    //hasUnreadMessage for new user
                    this.listOfConvos[this.selectedConvo][10].push(0);
                     //isRequested for new user
                    this.listOfConvos[this.selectedConvo][12].push(1);
                    //isDeleted for new user
                    this.listOfConvos[this.selectedConvo][13].push(0);

                    this.groupMessageRecipientsInfo.push(user);

                    newMessageId = uuidv4();
                    responseForSendingMessage = await fetch('http://localhost:8012/addMessage', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            messageId: newMessageId,
                            convoId: this.selectedConvoId,
                            message: JSON.stringify(["Add-Member/Remove-Member", "requested " + user[0]]),
                            sender: this.authenticatedUsername,
                            messageSentAt: new Date()
                        })
                    });
                    
                    if(!responseForSendingMessage.ok) {
                        throw new Error('Network response not ok');
                    }

                    this.messageData[0].push([this.authenticatedUsername, ["Add-Member/Remove-Member", "requested " + user[0], newMessageId], new Date()]);
                    this.messageData[1].push([]);
                    this.messageData[2].push([]);
                    this.messageData[3].push([]);
                    this.messageData[4].push([]);
                    this.messageData[5].push([<any>null]);
                    this.messageData[6].push([]);
                    this.messageData[7].push([]);

                }
            }
        }
        else {
            let isNewUserAdded = false;
            for(let user of selectedUsers) {
                if(!this.userIsAlreadyInGroup(user) && this.userFollowings.filter(x=>x['follower']===user[0]).length>0) {
                    this.listOfConvos[this.selectedConvo][5].push(user);
                    this.listOfConvos[this.selectedConvo][18].push(user);
                    //isMuted for new user
                    this.listOfConvos[this.selectedConvo][9].push(0);
                    //hasUnreadMessage for new user
                    this.listOfConvos[this.selectedConvo][10].push(0);
                     //isRequested for new user
                    this.listOfConvos[this.selectedConvo][12].push(0);
                    //isDeleted for new user
                    this.listOfConvos[this.selectedConvo][13].push(0);

                    this.groupMessageRecipientsInfo.push(user);

                    newMessageId = uuidv4();
                    responseForSendingMessage = await fetch('http://localhost:8012/addMessage', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            messageId: newMessageId,
                            convoId: this.selectedConvoId,
                            message: JSON.stringify(["Add-Member/Remove-Member", "added " + user[0]]),
                            sender: this.authenticatedUsername,
                            messageSentAt: new Date()
                        })
                    });
                    
                    if(!responseForSendingMessage.ok) {
                        throw new Error('Network response not ok');
                    }

                    this.messageData[0].push([this.authenticatedUsername, ["Add-Member/Remove-Member", "added " + user[0], newMessageId], new Date()]);
                    this.messageData[1].push([]);
                    this.messageData[2].push([]);
                    this.messageData[3].push([]);
                    this.messageData[4].push([]);
                    this.messageData[5].push([null]);
                    this.messageData[6].push([]);
                    this.messageData[7].push([]);

                    if(!isNewUserAdded) {
                        if(this.selectedConvoInitator[0] !== this.listOfConvos[this.selectedConvo][1]) {
                            this.listOfConvos[this.selectedConvo][5].push(this.messageRecipientInfo);
                            this.listOfConvos[this.selectedConvo][1] = this.selectedConvoInitator[0];
                            this.listOfConvos[this.selectedConvo][2] = this.selectedConvoInitator[1];
                        }
                        this.messageRecipientInfo = [];
                        this.groupMessageRecipientsInfo.unshift(this.selectedConvoInitator);
                        isNewUserAdded = true;
                    }
                }
                else if(!this.userIsAlreadyInGroup(user) && this.userFollowings.filter(x=>x['follower']===user[0]).length==0) {
                    this.listOfConvos[this.selectedConvo][5].push(user);
                    this.listOfConvos[this.selectedConvo][18].push(user);
                    //isMuted for new user
                    this.listOfConvos[this.selectedConvo][9].push(0);
                    //hasUnreadMessage for new user
                    this.listOfConvos[this.selectedConvo][10].push(0);
                     //isRequested for new user
                    this.listOfConvos[this.selectedConvo][12].push(1);
                    //isDeleted for new user
                    this.listOfConvos[this.selectedConvo][13].push(0);

                    this.groupMessageRecipientsInfo.push(user);

                    newMessageId = uuidv4();
                    responseForSendingMessage = await fetch('http://localhost:8012/addMessage', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            messageId: newMessageId,
                            convoId: this.selectedConvoId,
                            message: JSON.stringify(["Add-Member/Remove-Member", "requested " + user[0]]),
                            sender: this.authenticatedUsername,
                            messageSentAt: new Date()
                        })
                    });
                    
                    if(!responseForSendingMessage.ok) {
                        throw new Error('Network response not ok');
                    }

                    this.messageData[0].push([this.authenticatedUsername, ["Add-Member/Remove-Member", "requested " + user[0], newMessageId], new Date()]);
                    this.messageData[1].push([]);
                    this.messageData[2].push([]);
                    this.messageData[3].push([]);
                    this.messageData[4].push([]);
                    this.messageData[5].push([<any>null]);
                    this.messageData[6].push([]);
                    this.messageData[7].push([]);

                    if(!isNewUserAdded) {
                        if(this.selectedConvoInitator[0] !== this.listOfConvos[this.selectedConvo][1]) {
                            this.listOfConvos[this.selectedConvo][5].push(this.messageRecipientInfo);
                            this.listOfConvos[this.selectedConvo][1] = this.selectedConvoInitator[0];
                            this.listOfConvos[this.selectedConvo][2] = this.selectedConvoInitator[1];
                        }
                        this.messageRecipientInfo = [];
                        this.groupMessageRecipientsInfo.unshift(this.selectedConvoInitator);
                        isNewUserAdded = true;
                    }
                }
            }

        }

        const convo = this.listOfConvos[this.selectedConvo];
        const responseForAddingNewMember = await fetch('http://localhost:8012/editConvo/'+this.selectedConvoId, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            convoTitle: this.selectedConvoTitle,
            members: JSON.stringify(this.getMembersOfSelectedConvo()),
            convoInitiator: JSON.stringify(this.selectedConvoInitator),
            latestMessage: JSON.stringify([convo[16], convo[15]]),
            promotedUsers: JSON.stringify(convo[7]),
            isMuted: JSON.stringify(convo[9]),
            hasUnreadMessage: JSON.stringify(convo[10]),
            isRequested: JSON.stringify(convo[12]),
            isDeleted: JSON.stringify(convo[13])
            })
        });
        if(!responseForAddingNewMember.ok) {
            throw new Error('Network response not ok');
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
            return this.authenticatedFullName;
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

    async removeMemberFromConvo() {
        if(this.selectedConvoInitator[0]===this.userSettingsPopupGroupMessageMember[0]){
            return;
        }

        for(let i=0; i<this.listOfConvos[this.selectedConvo][18].length; i++) {
            if(this.listOfConvos[this.selectedConvo][18][i][0]===this.userSettingsPopupGroupMessageMember[0]) {
                this.listOfConvos[this.selectedConvo][18].splice(i, 1);
                //isMuted for to-be-gone user
                this.listOfConvos[this.selectedConvo][9].splice(i, 1);
                //hasUnreadMessage for to-be-gone user
                this.listOfConvos[this.selectedConvo][10].splice(i, 1);
                 //isRequested for to-be-gone user
                this.listOfConvos[this.selectedConvo][12].splice(i, 1);
                //isDeleted for to-be-gone user
                this.listOfConvos[this.selectedConvo][13].splice(i, 1);
                break;
            }
        }

        let indexOfUser = this.listOfConvos[this.selectedConvo][7].indexOf(this.userSettingsPopupGroupMessageMember[0]);
        if(indexOfUser!==-1) {
            this.listOfConvos[this.selectedConvo][7].splice(indexOfUser, 1);
        }

        for(let i = 0; i < this.listOfConvos[this.selectedConvo][5].length; i++) {
            if(this.listOfConvos[this.selectedConvo][5][i][0]===this.userSettingsPopupGroupMessageMember[0]) {
                this.listOfConvos[this.selectedConvo][5].splice(i,1);
                break;
            }
        }

        for(let i = 0; i < this.groupMessageRecipientsInfo.length; i++) {
            if(this.groupMessageRecipientsInfo[i][0]===this.userSettingsPopupGroupMessageMember[0]) {
                this.groupMessageRecipientsInfo.splice(i,1);
                break;
            }
        }

        const convo = this.listOfConvos[this.selectedConvo];
        const responseForAddingNewMember = await fetch('http://localhost:8012/editConvo/'+this.selectedConvoId, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            convoTitle: this.selectedConvoTitle,
            members: JSON.stringify(this.getMembersOfSelectedConvo()),
            convoInitiator: JSON.stringify(this.selectedConvoInitator),
            latestMessage: JSON.stringify([convo[16], convo[15]]),
            promotedUsers: JSON.stringify(convo[7]),
            isMuted: JSON.stringify(convo[9]),
            hasUnreadMessage: JSON.stringify(convo[10]),
            isRequested: JSON.stringify(convo[12]),
            isDeleted: JSON.stringify(convo[13])
            })
        });
        if(!responseForAddingNewMember.ok) {
            throw new Error('Network response not ok');
        }

        
        const newMessageId = uuidv4();
        const responseForSendingMessage= await fetch('http://localhost:8012/addMessage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                messageId: newMessageId,
                convoId: this.selectedConvoId,
                message: JSON.stringify(["Add-Member/Remove-Member", "removed " + this.userSettingsPopupGroupMessageMember[0]]),
                sender: this.authenticatedUsername,
                messageSentAt: new Date()
            })
        });
        
        if(!responseForSendingMessage.ok) {
            throw new Error('Network response not ok');
        }

        this.messageData[0].push([this.authenticatedUsername, ["Add-Member/Remove-Member", "removed " + this.userSettingsPopupGroupMessageMember[0], newMessageId], new Date()]);
        this.messageData[1].push([]);
        this.messageData[2].push([]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([<any>null]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);

        this.displayUserSettingsPopup = false;
    }

    async blockUserFromUserSettingsPopup() {
        const response = await fetch('http://localhost:8013/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                mutation {
                    addUserBlocking(newUserBlocking: { blocker: "${this.authenticatedUsername}" blockee: "${this.userSettingsPopupGroupMessageMember[0]}" })
                }
                `
                })
            });
        if(!response.ok) {
            throw new Error('Network response not ok');
        }
        this.userBlockings.push(this.userSettingsPopupGroupMessageMember[0]);
        this.displayUserSettingsPopup = false;
    }

    async unblockUserFromUserSettingsPopup() {
        const response = await fetch('http://localhost:8013/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                mutation {
                    removeUserBlocking(userBlockingToRemove: { blocker: "${this.authenticatedUsername}" blockee: "${this.userSettingsPopupGroupMessageMember[0]}" })
                }
                `
                })
            });
        if(!response.ok) {
            throw new Error('Network response not ok');
        }
        this.userBlockings.splice(this.userBlockings.indexOf(this.userSettingsPopupGroupMessageMember[0]),1);
        this.displayUserSettingsPopup = false;
    }

    async promoteUserFromSettingsPopup() {
        this.listOfConvos[this.selectedConvo][7].push(this.userSettingsPopupGroupMessageMember[0]);
        
        const convo = this.listOfConvos[this.selectedConvo];
        const response = await fetch('http://localhost:8012/editConvo/'+this.selectedConvoId, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            convoTitle: this.selectedConvoTitle,
            members: JSON.stringify(this.getMembersOfSelectedConvo()),
            convoInitiator: JSON.stringify(this.selectedConvoInitator),
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

        const newMessageId = uuidv4();
        const responseForSendingMessage= await fetch('http://localhost:8012/addMessage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                messageId: newMessageId,
                convoId: this.selectedConvoId,
                message: JSON.stringify(["Member-Promotion/Member-Demotion", "promoted " + this.userSettingsPopupGroupMessageMember[0]]),
                sender: this.authenticatedUsername,
                messageSentAt: new Date()
            })
        });
        
        if(!responseForSendingMessage.ok) {
            throw new Error('Network response not ok');
        }

        this.displayUserSettingsPopup = false;
        this.messageData[0].push([this.authenticatedUsername, ["Member-Promotion/Member-Demotion", "promoted " + this.userSettingsPopupGroupMessageMember[0]], new Date()]);
        this.messageData[1].push([]);
        this.messageData[2].push([]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([<any>null]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);
    }

    async demoteUserFromSettingsPopup() {
        if(this.userSettingsPopupGroupMessageMember[0]===this.selectedConvoInitator[0]) {
            return;
        }

        let indexOfUser = this.listOfConvos[this.selectedConvo][7].indexOf(this.userSettingsPopupGroupMessageMember[0]);
        if(indexOfUser!==-1) {
            this.listOfConvos[this.selectedConvo][7].splice(indexOfUser,1);
        }
        
        const convo = this.listOfConvos[this.selectedConvo];
        const response = await fetch('http://localhost:8012/editConvo/'+this.selectedConvoId, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            convoTitle: this.selectedConvoTitle,
            members: JSON.stringify(this.getMembersOfSelectedConvo()),
            convoInitiator: JSON.stringify(this.selectedConvoInitator),
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

        const newMessageId = uuidv4();
        const responseForSendingMessage= await fetch('http://localhost:8012/addMessage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                messageId: newMessageId,
                convoId: this.selectedConvoId,
                message: JSON.stringify(["Member-Promotion/Member-Demotion", "demoted " + this.userSettingsPopupGroupMessageMember[0]]),
                sender: this.authenticatedUsername,
                messageSentAt: new Date()
            })
        });
        
        if(!responseForSendingMessage.ok) {
            throw new Error('Network response not ok');
        }

        this.messageData[0].push([this.authenticatedUsername, ["Member-Promotion/Member-Demotion", "demoted " + this.userSettingsPopupGroupMessageMember[0]], new Date()]);
        this.messageData[1].push([]);
        this.messageData[2].push([]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([<any>null]);
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

    async promoteUserFromPromoteUserPopup() {
        this.listOfConvos[this.selectedConvo][7].push(this.messageRecipientInfo[0]);
        this.selectedConvoPromotedUsernames =  this.listOfConvos[this.selectedConvo][7];

        const convo = this.listOfConvos[this.selectedConvo];
        
        const response = await fetch('http://localhost:8012/editConvo/'+this.selectedConvoId, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            convoTitle: this.selectedConvoTitle,
            members: JSON.stringify(this.getMembersOfSelectedConvo()),
            convoInitiator: JSON.stringify(this.selectedConvoInitator),
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

        const newMessageId = uuidv4();
        const responseForSendingMessage= await fetch('http://localhost:8012/addMessage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                messageId: newMessageId,
                convoId: this.selectedConvoId,
                message: JSON.stringify(["Member-Promotion/Member-Demotion", "promoted " + this.messageRecipientInfo[0]]),
                sender: this.authenticatedUsername,
                messageSentAt: new Date()
            })
        });
        
        if(!responseForSendingMessage.ok) {
            throw new Error('Network response not ok');
        }


        this.messageData[0].push([this.authenticatedUsername, ["Member-Promotion/Member-Demotion", "promoted " + this.messageRecipientInfo[0]], new Date()]);
        this.messageData[1].push([]);
        this.messageData[2].push([]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([<any>null]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);
        this.displayPromoteUserPopup = false;
    }

    async demoteNonGroupConvoUserFromConvoDetails() {
        if(this.messageRecipientInfo[0]===this.selectedConvoInitator[0]) {
            return;
        }
        
        let indexOfUser = this.listOfConvos[this.selectedConvo][7].indexOf(this.messageRecipientInfo[0]);
        if(indexOfUser!==-1) {
            this.listOfConvos[this.selectedConvo][7].splice(indexOfUser,1);
        }
        
        const convo = this.listOfConvos[this.selectedConvo];

        const response = await fetch('http://localhost:8012/editConvo/'+this.selectedConvoId, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            convoTitle: this.selectedConvoTitle,
            members: JSON.stringify(this.getMembersOfSelectedConvo()),
            convoInitiator: JSON.stringify(this.selectedConvoInitator),
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

        const newMessageId = uuidv4();
        const responseForSendingMessage= await fetch('http://localhost:8012/addMessage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                messageId: newMessageId,
                convoId: this.selectedConvoId,
                message: JSON.stringify(["Member-Promotion/Member-Demotion", "demoted " + this.messageRecipientInfo[0]]),
                sender: this.authenticatedUsername,
                messageSentAt: new Date()
            })
        });
        
        if(!responseForSendingMessage.ok) {
            throw new Error('Network response not ok');
        }

        this.messageData[0].push([this.authenticatedUsername, ["Member-Promotion/Member-Demotion", "demoted " + this.messageRecipientInfo[0]], new Date()]);
        this.messageData[1].push([]);
        this.messageData[2].push([]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([<any>null]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);
        this.selectedConvoPromotedUsernames = [];
    }

    receiveListOfNotes1ForUser(listOfNotes1ForUser: Note[]) {
        this.listOfNotes1ForUser = listOfNotes1ForUser;
    }

    async sendNoteReply(noteReplyInfo: string[]) {
        //noteReplyInfo Example: ['HI!', 'First note!', 'rishavry2', 'Rishav Ray2']
        this.showNoteSection = false;
        const newMessageId = uuidv4();
        for(let i=0; i<this.listOfConvos.length; i++) {
            let convo = this.listOfConvos[i];
            if(convo[1]===noteReplyInfo[2] && convo[5].length==0) {
                await this.updateSelectedConvo(i);
                const responseForSendingNoteReplyMessage = await fetch('http://localhost:8012/addMessage', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        messageId: newMessageId,
                        convoId: this.selectedConvoId,
                        message: JSON.stringify(["Note-Reply", noteReplyInfo]),
                        sender: this.authenticatedUsername,
                        messageSentAt: new Date()
                    })
                });
                
                if(!responseForSendingNoteReplyMessage.ok) {
                    throw new Error('Network response not ok');
                }
                if(!this.displayListOfMessageRequestsSection) {
                    this.messageData[0].push([this.authenticatedUsername, ["Note-Reply", noteReplyInfo, newMessageId], new Date()]);
                    this.messageData[1].push([]);
                    this.messageData[2].push([]);
                    this.messageData[3].push([]);
                    this.messageData[4].push([]);
                    this.messageData[5].push([<any>null]);
                    this.messageData[6].push([]);
                    this.messageData[7].push([]);
                }
                else {
                    this.requestedMessageData[0].push([this.authenticatedUsername, ["Note-Reply", noteReplyInfo, newMessageId], new Date()]);
                    this.requestedMessageData[1].push([]);
                    this.requestedMessageData[2].push([]);
                    this.requestedMessageData[3].push([]);
                    this.requestedMessageData[4].push([]);
                    this.requestedMessageData[5].push([<any>null]);
                    this.requestedMessageData[6].push([]);
                    this.requestedMessageData[7].push([]);
                }
                await this.updateLatestMessageInConvo([this.authenticatedUsername+ ": " + noteReplyInfo[0], new Date()]);
                return;
            }
        }
        await this.startMessagingSelectedUsers([[noteReplyInfo[2], noteReplyInfo[3]]]);
        const responseForSendingNoteReplyMessage = await fetch('http://localhost:8012/addMessage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                messageId: newMessageId,
                convoId: this.selectedConvoId,
                message: JSON.stringify(["Note-Reply", noteReplyInfo]),
                sender: this.authenticatedUsername,
                messageSentAt: new Date()
            })
        });
        
        if(!responseForSendingNoteReplyMessage.ok) {
            throw new Error('Network response not ok');
        }
        this.addConvoToDatabase([this.authenticatedUsername+ ": " + noteReplyInfo[0], new Date()]);
        if(!this.displayListOfMessageRequestsSection) {
            this.messageData[0].push([this.authenticatedUsername, ["Note-Reply", noteReplyInfo, newMessageId], new Date()]);
            this.messageData[1].push([]);
            this.messageData[2].push([]);
            this.messageData[3].push([]);
            this.messageData[4].push([]);
            this.messageData[5].push([<any>null]);
            this.messageData[6].push([]);
            this.messageData[7].push([]);
        }
        else {
            this.requestedMessageData[0].push([this.authenticatedUsername, ["Note-Reply", noteReplyInfo, newMessageId], new Date()]);
            this.requestedMessageData[1].push([]);
            this.requestedMessageData[2].push([]);
            this.requestedMessageData[3].push([]);
            this.requestedMessageData[4].push([]);
            this.requestedMessageData[5].push([<any>null]);
            this.requestedMessageData[6].push([]);
            this.requestedMessageData[7].push([]);
        }
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
                convoInitiator: JSON.stringify([this.authenticatedUsername, this.authenticatedFullName]),
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
        if(latestMessageOfConvoToAdd[0].startsWith(this.authenticatedUsername+":")) {
            this.listOfConvos[this.selectedConvo][0] =  "You: " + latestMessageOfConvoToAdd[0].substring(this.authenticatedUsername.length+2) + " • 1m";
        }
        else {
            this.listOfConvos[this.selectedConvo][0] = latestMessageOfConvoToAdd[0] + " • 1m";
        }
        
    }

    async blockUsersFromRequestedConvo() {
        this.listOfRequestedConvos.splice(this.selectedConvo, 1);
        this.selectedConvo = -1;
        if(this.messageRecipientInfo.length>0) {
            const response = await fetch('http://localhost:8013/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                mutation {
                    addUserBlocking(newUserBlocking: { blocker: "${this.authenticatedUsername}" blockee: "${this.messageRecipientInfo[0]}" })
                }
                `
                })
            });
            if(!response.ok) {
                throw new Error('Network response not ok');
            }
            this.messageRecipientInfo = [];
        }
        else  {
            let response1;
            for(let groupMessageMember of this.groupMessageRecipientsInfo) {
                response1 = await fetch('http://localhost:8013/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
                    mutation {
                        addUserBlocking(newUserBlocking: { blocker: "${this.authenticatedUsername}" blockee: "${groupMessageMember[0]}" })
                    }
                    `
                    })
                });
                if(!response1.ok) {
                    throw new Error('Network response not ok');
                }
            }
            this.groupMessageRecipientsInfo = [];
        }
    }


}




