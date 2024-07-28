import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConvoDetailsPanel } from '../components/convoDetailsPanel.component';
import { CreateNewNote } from '../components/createNewNote.component';
import { LeftSidebarComponent } from '../components/leftSidebar.component';
import { MessageReactionsPopup } from '../components/messageReactionsPopup.component';
import { MessagesOfAChat } from '../components/messagesOfAChat.component';
import { NewMessagePopup } from '../components/newMessagePopup.component';
import { NoteSection } from '../components/noteSection.component';
import { NotesAndConvosSection } from '../components/notesAndConvosSection.component';
import { DeleteChatPopup } from '../components/deleteChatPopup.component';
import { BlockUserPopup } from '../components/blockUserPopup.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LeftSidebarComponent, CommonModule, NotesAndConvosSection,
  MessagesOfAChat, CreateNewNote, NoteSection, MessageReactionsPopup, NewMessagePopup, ConvoDetailsPanel,
  DeleteChatPopup, BlockUserPopup],
  templateUrl: './app.component.html',
  styleUrl: '../styles.css'
})
export class AppComponent {
  showMessagesOfAChat:boolean = true;
  showCreateNewNote:boolean = false;
  showNoteSection:boolean = false;
  noteSectionUsername:string = "";
  noteSectionIsOwnAccount:boolean = false;
  authenticatedUsername:string = "rishavry";
  messageRecipientInfo:Array<string> = ["rishavry2", "Rishav Ray2"];
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
        return;
      }
    }
  }

  updateExpansionOfMessagesOfAChat(notesAndConvosSectionIsExpanded: boolean) {
    this.messagesOfAChatIsExpanded = !notesAndConvosSectionIsExpanded;
  }

  toggleConvoDetails() {
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
    for(let i=0; i<this.listOfConvos.length; i++) {
      if(this.listOfConvos[i][1]===this.messageRecipientInfo[0]) {
        this.listOfConvos.splice(i,1);
        this.messageRecipientInfo = [];
        this.displayDeleteChatPopup = false;
        this.showConvoDetailsPanel = false;
        return;
      }
    }
  }

  cancelBlockUser() {
    this.displayBlockUserPopup = false;
  }

  blockUser() {
    // code for blocking user
    for(let i=0; i<this.listOfConvos.length; i++) {
      if(this.listOfConvos[i][1]===this.messageRecipientInfo[0]) {
        this.listOfConvos.splice(i,1);
        this.messageRecipientInfo = [];
        console.log(this.messageRecipientInfo[0] + " has been blocked.");
        this.displayBlockUserPopup = false;
        this.showConvoDetailsPanel = false;
        return;
      }
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
    this.messageToForward = messageToForward;
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
    }

  }

  
}
