    import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
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
import { RequestedMessagesOfAChat } from '../components/requestedMessagesOfAChat.component';
import { UserSettingsPopup } from '../components/userSettingsPopup.component';
import { PromoteUserPopup } from '../components/promoteUserPopup.component';
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
    displayLeaveGroupPopup:boolean = false;
    displayAddMembersPopup:boolean = false;
    isAddingNewMembers:boolean = false;
    displayUserSettingsPopup:boolean = false;
    userSettingsPopupGroupMessageMember!:string[];
    blockedUsernames:string[]=[];
    selectedConvoPromotedUsernames:string[] = [];
    displayPromoteUserPopup:boolean = false;
    listOfNotes1!:Note[];

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

    showMessagesOfConvo(messageRecipientInfo: Array<string>) {
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

    groupConvoIsNew(groupMessageMembers: string[][]) {
        const flattenedAndSortedMembers = this.flattenAndSort(groupMessageMembers);
        let twoConvosAreEqual;
        let convoInListOfConvos;
        for(let convo of this.listOfConvos) {
            twoConvosAreEqual = true;
            if(convo[1]!==this.authenticatedUsername) {
                convoInListOfConvos = this.flattenAndSort([convo[1], convo[2], convo[5]]);
            }
            else {
                convoInListOfConvos = this.flattenAndSort(convo[5]);
            }
            if(convoInListOfConvos.length!==flattenedAndSortedMembers.length) {
                twoConvosAreEqual = false;
            }
            else {
                for(let i=0; i< flattenedAndSortedMembers.length; i++) {
                    if(flattenedAndSortedMembers[i]!==convoInListOfConvos[i]) {
                        twoConvosAreEqual = false;
                        break;
                    }
                }
            }
            if(twoConvosAreEqual) {
                return false;
            }
            
        }
        return true;
    }

    startMessagingSelectedUsers(selectedUsers: string[][]) {
        this.showNewMessagePopup = false;
        if(selectedUsers.length==1) {
            if(this.listOfConvos.filter(x=>x[1]===selectedUsers[0][0]).length==0) {
                this.listOfConvos.push(["Message #4 • 5w", selectedUsers[0][0], selectedUsers[0][1], false, false, [], "", []]);
            }
            else {
                this.showMessagesOfConvo(selectedUsers[0]);
    ;        }
        }
        else {
            selectedUsers = selectedUsers.filter(x=>x[0]!==this.authenticatedUsername);
            if (this.groupConvoIsNew(selectedUsers)) {
                this.listOfConvos.push(["Message #4 • 5w", this.authenticatedUsername, "Rishav Ray", false, false, selectedUsers, "", []]);
            }
            else {
                this.showMessagesOfThisGroupConvo(selectedUsers);
                
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

    updateLatestMessageInConvo(latestMessageInfo: string[]) {
    this.listOfConvos.forEach(x => {
        if (x[1] === latestMessageInfo[0]) {
        x[0] = latestMessageInfo[1];
        x[3] = false;
        }
    });
    }

    deleteConvo(convoRecipient: string) {
    for(let i=0; i<this.listOfConvos.length; i++) {
        if(this.listOfConvos[i][1]===convoRecipient) {
        this.listOfConvos.splice(i,1);
        this.messageRecipientInfo = [];
        this.groupMessageRecipientsInfo = [];
        return;
        }
    }
    }

    updateExpansionOfMessagesOfAChat(notesAndConvosSectionIsExpanded: boolean) {
    this.messagesOfAChatIsExpanded = !notesAndConvosSectionIsExpanded;
    }

    toggleConvoDetails() {
    this.convoIsRequested = false;
    this.showConvoDetailsPanel = !this.showConvoDetailsPanel;
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

    deleteChat() {
        if(!this.displayListOfMessageRequestsSection) {
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

    toggleMutedMessageIconInConvo() {
    for(let i=0; i<this.listOfConvos.length; i++) {
        if(this.listOfConvos[i][1]===this.messageRecipientInfo[0]) {
        this.listOfConvos[i][4] = !this.listOfConvos[i][4];
        return;
        }
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

    forwardMessageToSelectedUsers(forwardMessageInfo:any[]) {
    this.startMessagingSelectedUsers(forwardMessageInfo[1]);
    if(forwardMessageInfo[1].length==1 && forwardMessageInfo[2].length==1) {
        this.messageData[0].push([this.authenticatedUsername, forwardMessageInfo[0], new Date(), forwardMessageInfo[2][0][0]]);
        this.messageData[1].push(-1);
        this.messageData[2].push([]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([]);
        this.messageData[6].push([-1, -1]);
        this.messageData[7].push([]);
        this.messageData[8].push([]);
    }

    }

    forwardFileToSelectedUsers(forwardMessageInfo:any[]) {
    this.startMessagingSelectedUsers(forwardMessageInfo[1]);
    if(forwardMessageInfo[1].length==1 && forwardMessageInfo[2].length==1) {
        this.messageData[0].push([this.authenticatedUsername, "", new Date(), forwardMessageInfo[2][0][0]]);
        this.messageData[1].push(-1);
        this.messageData[2].push([]);
        this.messageData[3].push([]);
        this.messageData[4].push([forwardMessageInfo[0][0]]);
        this.messageData[5].push([forwardMessageInfo[0][1]]);
        this.messageData[6].push([-1, -1]);
        this.messageData[7].push([[]]);
        this.messageData[8].push([[]]);
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

    acceptRequestedConvo() {
        this.listOfConvos.push(this.listOfRequestedConvos[this.selectedConvo]);
        this.listOfRequestedConvos.splice(this.selectedConvo,1);
        this.messageRecipientInfo = [];
        this.groupMessageRecipientsInfo = [];
        this.selectedConvo = -1;
        return;
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

    toggleMutedMessageIconInGroupConvo() {
        this.listOfConvos[this.selectedConvo][4] = !this.listOfConvos[this.selectedConvo][4];

    }

    updateSelectedConvo(convoIndex:number) {
        this.selectedConvo = convoIndex;
        if(!this.displayListOfMessageRequestsSection) {
            this.selectedConvoTitle = this.listOfConvos[convoIndex][6];
            this.selectedConvoPromotedUsernames = this.listOfConvos[convoIndex][7];
        }
        else {
            this.selectedConvoTitle = this.listOfRequestedConvos[convoIndex][6];
            this.selectedConvoPromotedUsernames = this.listOfRequestedConvos[convoIndex][7];
        }
    }

    updateConvoTitle(newConvoTitle: string) {
        if(!this.displayListOfMessageRequestsSection) {
            this.listOfConvos[this.selectedConvo][6] = newConvoTitle;
        }
        else {
            this.listOfRequestedConvos[this.selectedConvo][6] = newConvoTitle;
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
                    this.messageData[1].push(-1);
                    this.messageData[2].push([-1, -1]);
                    this.messageData[3].push([]);
                    this.messageData[4].push([]);
                    this.messageData[5].push([]);
                    this.messageData[6].push([]);
                    this.messageData[7].push([]);
                    this.messageData[8].push([]);
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
                    this.messageData[1].push(-1);
                    this.messageData[2].push([-1, -1]);
                    this.messageData[3].push([]);
                    this.messageData[4].push([]);
                    this.messageData[5].push([]);
                    this.messageData[6].push([]);
                    this.messageData[7].push([]);
                    this.messageData[8].push([]);
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
        this.messageData[1].push(-1);
        this.messageData[2].push([-1, -1]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);
        this.messageData[8].push([]);

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
        this.messageData[1].push(-1);
        this.messageData[2].push([-1, -1]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);
        this.messageData[8].push([]);
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
        this.messageData[1].push(-1);
        this.messageData[2].push([-1, -1]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);
        this.messageData[8].push([]);
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
        this.messageData[1].push(-1);
        this.messageData[2].push([-1, -1]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);
        this.messageData[8].push([]);
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
        this.messageData[1].push(-1);
        this.messageData[2].push([-1, -1]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);
        this.messageData[8].push([]);
        this.selectedConvoPromotedUsernames = [];
    }

    receiveListOfNotes1(listOfNotes1: Note[]) {
        this.listOfNotes1 = listOfNotes1;
    }

    sendNoteReply(noteReplyInfo: string[]) {
        this.messageData[0].push([this.authenticatedUsername, ["Note-Reply", noteReplyInfo], new Date()]);
        this.messageData[1].push(-1);
        this.messageData[2].push([-1, -1]);
        this.messageData[3].push([]);
        this.messageData[4].push([]);
        this.messageData[5].push([]);
        this.messageData[6].push([]);
        this.messageData[7].push([]);
        this.messageData[8].push([]);
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


}




