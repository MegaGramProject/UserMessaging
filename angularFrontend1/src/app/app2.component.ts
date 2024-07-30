    import { CommonModule } from '@angular/common';
    import { Component } from '@angular/core';
    import { ActivatedRoute, RouterOutlet } from '@angular/router';
    import { BlockUserPopup } from '../components/blockUserPopup.component';
    import { ConvoDetailsPanel } from '../components/convoDetailsPanel.component';
    import { CreateNewNote } from '../components/createNewNote.component';
    import { DeleteChatPopup } from '../components/deleteChatPopup.component';
    import { LeftSidebarComponent } from '../components/leftSidebar.component';
    import { ListOfMessageRequestsSection } from '../components/listOfMessageRequestsSection.component';
    import { MessageReactionsPopup } from '../components/messageReactionsPopup.component';
    import { MessagesOfAChat } from '../components/messagesOfAChat.component';
    import { NewMessagePopup } from '../components/newMessagePopup.component';
    import { NoteSection } from '../components/noteSection.component';
    import { NotesAndConvosSection } from '../components/notesAndConvosSection.component';
    import { RequestedMessagesOfAChat } from '../components/requestedMessagesOfAChat.component';


    @Component({
    selector: 'app2',
    standalone: true,
    imports: [RouterOutlet, LeftSidebarComponent, CommonModule, NotesAndConvosSection,
    MessagesOfAChat, CreateNewNote, NoteSection, MessageReactionsPopup, NewMessagePopup, ConvoDetailsPanel,
    DeleteChatPopup, BlockUserPopup, ListOfMessageRequestsSection, RequestedMessagesOfAChat],
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
    }

    getStyleBasedOnPopups() {
    return this.showNewMessagePopup || this.displayDeleteChatPopup || this.displayBlockUserPopup ?
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

    startMessagingSelectedUsers(selectedUsers: string[][]) {
    this.showNewMessagePopup = false;
    if(selectedUsers.length==1) {
        this.showMessagesOfAChat = true;
        this.messageRecipientInfo = selectedUsers[0];
        if(this.listOfConvos.filter(x=>x[1]===selectedUsers[0][0]).length==0) {
            this.listOfConvos.push(["Message #4 • 5w", selectedUsers[0][0], selectedUsers[0][1], false, false]);
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
    this.fileToForward = [];
    this.messageToForward = messageToForward;
    this.showNewMessagePopup = true;
    }

    showForwardFilePopup(fileToForward: Array<any>) {
    this.isForwarding = true;
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

    deleteRequestedConvo() {
    for(let i=0; i<this.listOfRequestedConvos.length; i++) {
        if(this.listOfRequestedConvos[i][1]===this.messageRecipientInfo[0]) {
        this.listOfRequestedConvos.splice(i,1);
        this.messageRecipientInfo = [];
        this.groupMessageRecipientsInfo = [];
        return;
        }
    }
    }

    acceptRequestedConvo() {
        this.listOfConvos.push(this.listOfRequestedConvos[this.selectedConvo]);
        this.listOfRequestedConvos.splice(this.selectedConvo,1);
        this.messageRecipientInfo = [];
        this.groupMessageRecipientsInfo = [];
        this.selectedConvo = -1;
        return;
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
    }


    }




