import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';


@Component({
    selector: 'MessagesOfAChat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: '../templates/MessagesOfAChat.component.html',
    styleUrl: '../styles.css'
})
export class MessagesOfAChat {


    messages: Array<Array<Object>> = [
     //   ["rishavry", "Hey man, how's it going?", new Date(2024, 4, 15, 10, 30, 0)],
     //   ["rishavry2", "Good man, what about you", new Date(2024, 4, 15, 10, 30, 30)],
    //    ["rishavry2", "Really dude? Start it and then have me double text?", new Date(2024, 4, 15, 11, 50, 0)],
    //    ["rishavry", "Well I was actually hoping you'd triple text but it turns out you have more self-respect than that lol", new Date(2024, 4, 15, 11, 51, 0)],
    ];

    reactions: Array<Array<string>> = [
    //    ["❤️"],
    //    [],
    //        [],
     //   ["😭", "🖕"]
    ];
    reactionUsernames: Array<Array<string>> = [
   //     ["rishavry2"],
   //     [],
   //     [],
   //     ["rishavry", "rishavry2"]
    ];

    messageFiles: Array<Array<File>> = [
     //   [],
    //    [],
     //   [],
     //   []
    ];
    messageFileImages: Array<Array<any>> = [
    //    [],
    //    [],
    //    [],
    //    []
    ];
    fileReplies: Array<Array<number>> = [
    //    [-1, -1],
   //     [-1, -1],
   //     [-1, -1],
   //     [-1, -1],
    ];
    messageFileReactions: Array<Array<any>> = [
    //    [],
    //    [],
   //     [],
   //     []
    ];
    messageFileReactionUsernames: Array<Array<any>> = [
    //    [],
   //   [],
    //    [],
   //     []
    ];

    @Input() authenticatedUsername!: string;
    @Input() messageRecipientInfo: Array<string> = [];
    messageToSend: string = "";
    @ViewChild('scrollMe') myScrollContainer!: ElementRef;
    hoveredIndex: number | null = null;
    messageIndexToReplyTo:number = -1;
    fileIndexToReplyTo:number[] = [-1, -1];
    currentlyShownReactionPanel:number = -1;
    currentlyShownOptionsPanel:number = -1;
    @Output() notifyParentToShowMessageReactions: EventEmitter<Array<Array<string>>> = new EventEmitter();
    @Output() notifyParentToShowNewMessagePopup: EventEmitter<string> = new EventEmitter();
    @Output() notifyParentToUpdateLatestMessageInConvo: EventEmitter<any[]> = new EventEmitter();
    @Output() notifyParentToDeleteConvo: EventEmitter<string> = new EventEmitter();
    audioContext: AudioContext | null = null;
    sourceNode: MediaStreamAudioSourceNode | null = null;
    isPaused: boolean = false;
    mediaRecorder: MediaRecorder | null = null;
    audioChunks: Blob[] = [];
    audioUrl: string | null = null;
    @Input() messagesOfAChatIsExpanded!:boolean;
    @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
    filesToSend: Array<File> = [];
    fileImages: Array<any> = [];
    currentlyHoveredFileImage:number = -1;
    @Output() notifyParentToToggleConvoDetailsPanel: EventEmitter<any> = new EventEmitter();
    @Input() convoDetailsPanelIsExpanded!: boolean;
    @Output() notifyParentToShowForwardMessagePopup: EventEmitter<string> = new EventEmitter();
    @Output() emitDataToParent: EventEmitter<any[][]> = new EventEmitter();
    currentlyHoveredSentMessageAndFileIndices: Array<number> = [-1, -1];
    currentlyShownReactionPanelForMessageFiles:number[] = [-1, -1];
    currentlyShownOptionsPanelForMessageFiles:number[] = [-1, -1];
    @Output() notifyParentToShowForwardFilePopup: EventEmitter<Array<any>> = new EventEmitter();
    @Input() isRequestingConvoWithRecipient!:boolean;
    constructor(private cdRef: ChangeDetectorRef) {}
    @Input() groupMessageRecipientsInfo: string[][] = [];
    @Input() convoTitle:any = "";
    isEditingConvoTitle:boolean= false;
    convoTitleBeforeEditing = this.convoTitle;
    @Output() notifyParentToUpdateConvoTitle: EventEmitter<any[]> = new EventEmitter();
    @Input() blockedUsernames!:string[];
    @Input() promotedUsernames!:string[];
    @Input() convoId!:any;
    @Input() hasConvoBeenAdded!: boolean;
    @Output() notifyParentToAddConvoToDatabase: EventEmitter<any[]> = new EventEmitter();
    @Input() selectedConvoInitator!:string[];
    @Input() authenticatedFullName!:string;

    ngOnInit() {
        this.emitDataToParent.emit([this.messages, this.reactions, this.reactionUsernames, this.messageFiles,
        this.messageFileImages, this.fileReplies, this.messageFileReactions, this.messageFileReactionUsernames, [this.myScrollContainer, this.cdRef]]);

    }


    toggleConvoDetailsPanel() {
        this.notifyParentToToggleConvoDetailsPanel.emit("toggle convo details panel");
    }


    getWidthAndHorizontalStartOfSection() {
        if(this.messagesOfAChatIsExpanded && this.convoDetailsPanelIsExpanded) {
            return {
                'width': '70%',
                'left': '7%'
            };
        }
        else if(this.messagesOfAChatIsExpanded && !this.convoDetailsPanelIsExpanded) {
            return {
                'width': '88%',
                'left': '7%'
            };
        }
        else if(!this.messagesOfAChatIsExpanded && this.convoDetailsPanelIsExpanded) {
            return {
                'width': '52.6%',
                'left': '27.3%'
            };
        }
        else {
            return {
                'width': '70.6%',
                'left': '27.3%'
            };
        }
    }


    showMessageReactionsPopup(index: number) {
        const messageId = <string>this.getMessageId(index);
        this.notifyParentToShowMessageReactions.emit([this.reactions[index], this.reactionUsernames[index], [messageId]]);
    }
    
    displayIconsOfTextarea() {
        return this.messageToSend.length == 0 ?
        {
            'display': 'inline-block'
        } :
        {
            'display': 'none'
        };
    }

    displaySendMessageText() {
        return this.messageToSend.length > 0 ?
        {
            'display': 'inline-block'
        } :
        {
            'display': 'none'
        };
    }

    getTextareaPlaceholder() {
        if(this.messageIndexToReplyTo!==-1) {
            const messageIndex = this.messageIndexToReplyTo;
            return "Replying to " + this.messages[messageIndex][0];
        }
        if(this.fileIndexToReplyTo[0]!==-1) {
            const messageIndex = this.fileIndexToReplyTo[0];
            return "Replying to " + this.messages[messageIndex][0] + ": (File)";
        }
        if(!this.isRequestingConvoWithRecipient) {
            return "Message...";
        }
        if(this.messageRecipientInfo.length>0) {
            return "You have " + (3-this.messages.length) + " messages before " + this.messageRecipientInfo[0] + " decides to accept messaging you";
        }
        else if(this.groupMessageRecipientsInfo.length>0) {
            return "You have " + (3-this.messages.length) + " messages before " + this.getFullNamesOfAllConvoMembers() + " decide to accept messaging you";
        }
        return "";
    }


    ngOnChanges(changes: SimpleChanges) {
        if (changes['messageRecipientInfo'] && changes['messageRecipientInfo'].currentValue.length>0) {
            this.messageIndexToReplyTo = -1;
        }
        else if (changes['groupMessageRecipientsInfo'] && changes['groupMessageRecipientsInfo'].currentValue.length>0) {
            this.messageIndexToReplyTo = -1;
        }
    }

    scrollToBottom(): void {
    try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
        console.error(err);
    }
    }

    async sendMessage() {
        if(!this.hasConvoBeenAdded) {
            this.notifyParentToAddConvoToDatabase.emit(["You: " + this.messageToSend, new Date()]);
        }
        else {
            this.notifyParentToUpdateLatestMessageInConvo.emit(["You: " + this.messageToSend, new Date()]);
        }
        const newMessageId = uuidv4();
        if(this.messageIndexToReplyTo!==-1) {
            let message:string[] = [];
            if(this.messages[this.messageIndexToReplyTo].length>3) {
                message = ["Reply", <string>this.messages[this.messageIndexToReplyTo][0], <string>this.messages[this.messageIndexToReplyTo][1], this.messageToSend];
                this.messages.push([this.authenticatedUsername, ["Reply", "replied to " + <string>this.messages[this.messageIndexToReplyTo][0], <string>this.messages[this.messageIndexToReplyTo][1], this.messageToSend], new Date()]);
            }
            else if(this.isMessageReply(this.messageIndexToReplyTo)) {
                message = ["Reply", <string>this.messages[this.messageIndexToReplyTo][0], (<string[]>this.messages[this.messageIndexToReplyTo][1])[3], this.messageToSend];
                this.messages.push([this.authenticatedUsername, ["Reply", "replied to " + <string>this.messages[this.messageIndexToReplyTo][0], (<string[]>this.messages[this.messageIndexToReplyTo][1])[3], this.messageToSend], new Date()]);
            }
            else if(this.isForwardedMessage(this.messageIndexToReplyTo)) {
                message = ["Reply", <string>this.messages[this.messageIndexToReplyTo][0], (<string[]>this.messages[this.messageIndexToReplyTo][1])[2], this.messageToSend];
                this.messages.push([this.authenticatedUsername, ["Reply", "replied to " + <string>this.messages[this.messageIndexToReplyTo][0], (<string[]>this.messages[this.messageIndexToReplyTo][1])[2], this.messageToSend], new Date()]);
            }

            const responseForSendingReplyMessage = await fetch('http://localhost:8012/addMessage', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    messageId: newMessageId,
                    convoId: this.convoId,
                    message: JSON.stringify(message),
                    sender: this.authenticatedUsername,
                    messageSentAt: new Date()
                    
                })
            });
            
            if(!responseForSendingReplyMessage.ok) {
                throw new Error('Network response not ok');
            }
        }
        else {
            const responseForSendingRegularMessage = await fetch('http://localhost:8012/addMessage', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    messageId: newMessageId,
                    convoId: this.convoId,
                    message: JSON.stringify(["Regular-Message", this.messageToSend]),
                    sender: this.authenticatedUsername,
                    messageSentAt: new Date()
                })
            });
            
            if(!responseForSendingRegularMessage.ok) {
                throw new Error('Network response not ok');
            }
        }
        this.messages.push([this.authenticatedUsername, this.messageToSend, new Date(), newMessageId]);
        this.fileReplies.push(this.fileIndexToReplyTo);
        this.reactions.push([]);
        this.reactionUsernames.push([]);
        this.messageFiles.push(this.filesToSend);
        this.messageFileImages.push(this.fileImages);
        this.messageFileReactions.push([]);
        this.messageFileReactionUsernames.push([]);
        for(let i=0; i < this.filesToSend.length; i++) {
            this.messageFileReactions[this.messageFileReactions.length-1].push([]);
            this.messageFileReactionUsernames[this.messageFileReactionUsernames.length-1].push([]);
        }
        this.messageToSend = "";
        this.messageIndexToReplyTo = -1;
        this.fileIndexToReplyTo = [-1, -1];
        this.filesToSend = [];
        this.fileImages = [];
        this.cdRef.detectChanges();
        this.scrollToBottom();
    }

    async sendHeart() {
        if(!this.hasConvoBeenAdded) {
            this.notifyParentToAddConvoToDatabase.emit(["You: ❤️", new Date()]);
        }
        else {
            this.notifyParentToUpdateLatestMessageInConvo.emit(["You: ❤️", new Date()]);
        }
        const newMessageId = uuidv4();
        this.messages.push([this.authenticatedUsername, "❤️", new Date(), newMessageId]);
        const responseForSendingHeart = await fetch('http://localhost:8012/addMessage', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    messageId: newMessageId,
                    convoId: this.convoId,
                    message: JSON.stringify(["Regular-Message", "❤️"]),
                    sender: this.authenticatedUsername,
                    messageSentAt: new Date()
                })
            });
            
        if(!responseForSendingHeart.ok) {
            throw new Error('Network response not ok');
        }
        this.fileReplies.push(this.fileIndexToReplyTo);
        this.reactions.push([]);
        this.reactionUsernames.push([]);
        this.messageFiles.push(this.filesToSend);
        this.messageFileImages.push(this.fileImages);
        this.messageToSend = "";
        this.messageIndexToReplyTo = -1;
        this.fileIndexToReplyTo = [-1, -1];
        this.filesToSend = [];
        this.fileImages = [];
        this.cdRef.detectChanges();
        this.scrollToBottom();
    }

    onMouseEnter(index: number): void {
        this.hoveredIndex = index;
    }
    
    onMouseLeave(): void {
        this.hoveredIndex = null;
    }

    formatDate(date: any) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear().toString().slice(-2);

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12;


        const formattedDate = `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;

        return formattedDate;
    }


    isMoreThan60MinutesLater(currentDate: any, previousDate: any): boolean {
        const diffInMilliseconds = currentDate.getTime() - previousDate.getTime();
        const diffInMinutes = diffInMilliseconds / (1000 * 60);
        return diffInMinutes > 60;
    }

    replyToMessage(index: number) {
        if(this.messageIndexToReplyTo==index) {
            this.messageIndexToReplyTo = -1;
            return;
        }
        this.messageIndexToReplyTo = index;
    }

    replyToFile(messageIndex: number, fileImageIndex: number) {
        if(this.fileIndexToReplyTo[0]==messageIndex && this.fileIndexToReplyTo[1]==fileImageIndex) {
            this.fileIndexToReplyTo = [-1, -1];
            return;
        }
        this.fileIndexToReplyTo = [messageIndex, fileImageIndex];
    }

    onDoubleClickingMessage(index: number) {
        this.addReaction(index, "❤️");
    }

    getMessageId(messageIndex: number) {
        const message = this.messages[messageIndex];
        if(message.length>3) {
            return message[3];
        }
        else if(this.isMessageReply(messageIndex)) {
            return (<string[]>message[1])[4];
        }
        else if(this.isForwardedMessage(messageIndex)) {
            return (<string[]>message[1])[3];
        }
        return "";
    }

    async addReaction(index: number, reaction: string) {
        const messageId = this.getMessageId(index);
        const response = await fetch('http://localhost:8013/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
                mutation {
                    addMessageReaction(
                        newReaction: {
                            convoId: "${this.convoId}",
                            messageId: "${messageId}"
                            reaction: "${reaction}",
                            username: "${this.authenticatedUsername}",
                            fullName: "${this.authenticatedFullName}"
                        }
                    )
                }
            `
            })
        });
        if(!response.ok) {
            throw new Error('Network response not ok');
        }
        const data = await response.json();
        this.reactions[index].push(reaction);
        this.reactionUsernames[index].push(this.authenticatedUsername);
    }

    addFileReaction(messageIndex: number, fileIndex: number, reaction: string) {
        this.messageFileReactions[messageIndex][fileIndex].push(reaction);
        this.messageFileReactionUsernames[messageIndex][fileIndex].push(this.authenticatedUsername);
    }

    showReactionPanel(index: number) {
        if(this.currentlyShownReactionPanel==index) {
            this.currentlyShownReactionPanel = -1;
            return;
        }
        this.currentlyShownReactionPanel = index;
        this.currentlyShownOptionsPanel = -1;
    }

    showOptionsPanel(index: number) {
        if(this.currentlyShownOptionsPanel==index) {
            this.currentlyShownOptionsPanel = -1;
            return;
        }
        this.currentlyShownOptionsPanel = index;
        this.currentlyShownReactionPanel = -1;
    }

    copyToClipboard(textToCopy: any) {
        navigator.clipboard.writeText(textToCopy).then(() => {
        this.currentlyShownOptionsPanel = -1;
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
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
    

    async deleteMessage(index: number) {
        if(index==this.messages.length-1){
            if(this.messages.length==1) {
                this.notifyParentToDeleteConvo.emit(this.messageRecipientInfo[0]);
                return;
            }
            else {
                if(this.messages[index-1][0]===this.authenticatedUsername) {
                    if(this.messages[index-1].length>3) {
                        this.notifyParentToUpdateLatestMessageInConvo.emit(["You: " + this.messages[index-1][1], this.messages[index-1][2]]);
                    }
                    else if(this.isMessageReply(index-1)) {
                        this.notifyParentToUpdateLatestMessageInConvo.emit(["You: " + (<string[]>this.messages[index-1][1])[3], this.messages[index-1][2]]);
                    }
                    else if(this.isForwardedMessage(index-1)) {
                        this.notifyParentToUpdateLatestMessageInConvo.emit(["You: " + (<string[]>this.messages[index-1][1])[2], this.messages[index-1][2]]);
                    }
                }
                else {
                    if(this.messages[index-1].length>3) {
                        this.notifyParentToUpdateLatestMessageInConvo.emit([this.messages[index-1][1], this.messages[index-1][2]]);
                    }
                    else if(this.isMessageReply(index-1)) {
                        this.notifyParentToUpdateLatestMessageInConvo.emit([(<string[]>this.messages[index-1][1])[3], this.messages[index-1][2]]);
                    }
                    else if(this.isForwardedMessage(index-1)) {
                        this.notifyParentToUpdateLatestMessageInConvo.emit([(<string[]>this.messages[index-1][1])[2], this.messages[index-1][2]]);
                    }
                }
            }
        }
        let messageId:string = "";

        if (Array.isArray(this.messages[index][1])) {
            if((<string[]>this.messages[index][1])[0]==='Reply') {
                messageId = (<string[]>this.messages[index][1])[4];
            }
            else {
                messageId = (<string[]>this.messages[index][1])[3];
            }
        }
        else {
            messageId = <string>this.messages[index][3];
        }

        const response = await fetch('http://localhost:8012/deleteMessage/'+messageId, {
            method: 'DELETE'
        });

        if(!response.ok) {
            throw new Error('Network response not ok');
        }
        
        this.messages.splice(index, 1);
        this.reactions.splice(index, 1);
        this.reactionUsernames.splice(index, 1);
        this.messageFiles.slice(index, 1);
        this.messageFileImages.slice(index, 1);
        this.fileReplies.slice(index, 1);
        this.messageFileReactions.splice(index, 1);
        this.messageFileReactionUsernames.splice(index, 1);
        this.currentlyShownOptionsPanel = -1;
    }

    deleteFile(messageIndex: number, fileIndex: number) {
        this.messageFiles[messageIndex].splice(fileIndex, 1);
        this.messageFileImages[messageIndex].splice(fileIndex, 1);
        this.messageFileReactions[messageIndex].splice(fileIndex, 1);
        this.messageFileReactionUsernames[messageIndex].splice(fileIndex, 1);
    }

    showNewMessagePopup() {
        this.notifyParentToShowNewMessagePopup.emit("show new message popup");
    }

    async startRecordingAudioMessage() {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioContext = new window.AudioContext();
            this.sourceNode = this.audioContext.createMediaStreamSource(mediaStream);
            this.sourceNode.connect(this.audioContext.destination);

            this.mediaRecorder = new MediaRecorder(mediaStream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
            };

            this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
            this.audioUrl = URL.createObjectURL(audioBlob);
            };
    
            this.mediaRecorder.start();
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    }
    
    async toggleAudio() {
        if (!this.audioContext) {
            return;
        }
        if (this.isPaused) {
            await this.audioContext.resume();
            this.mediaRecorder?.resume();
            this.isPaused = false;
        } else {
            await this.audioContext.suspend();
            this.mediaRecorder?.pause();
            this.isPaused = true;
        }
    }

    async stopRecordingAudioMessage() {
        this.mediaRecorder?.stop();
        await this.audioContext?.close();
        this.audioContext = null;
        this.sourceNode = null;
        this.isPaused = false;
    }

    triggerFileInput() {
        this.fileInput.nativeElement.click();
    }

    handleFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0 && this.filesToSend.length<10) {
            const file = input.files[0];
            const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml'];
            if (acceptedTypes.includes(file.type)) {
                this.fileImages.push(URL.createObjectURL(file));
            }
            else {
                this.fileImages.push("default file image");
            }
            this.filesToSend.push(file);
        }
    }

    removeFileToSend(index: number) {
        this.filesToSend.splice(index, 1);
        this.fileImages.splice(index, 1);
    }

    setCurrentlyHoveredFileImage(index: number) {
        this.currentlyHoveredFileImage = index;
    }

    resetCurrentlyHoveredFileImage() {
        this.currentlyHoveredFileImage = -1;
    }

    forwardMessage(index: number) {
        this.notifyParentToShowForwardMessagePopup.emit(String(this.messages[index][1]));
        this.currentlyShownOptionsPanel = -1;
    }

    forwardFile(messageIndex: number, fileIndex: number) {
        this.notifyParentToShowForwardFilePopup.emit([this.messageFiles[messageIndex][fileIndex], this.messageFileImages[messageIndex][fileIndex]]);
        this.currentlyShownOptionsPanelForMessageFiles = [-1, -1];
    }

    onFileImageMouseEnter(messageIndex: number, fileImageIndex: number) {
        this.currentlyHoveredSentMessageAndFileIndices = [messageIndex, fileImageIndex];
    }

    onFileImageMouseLeave() {
        this.currentlyHoveredSentMessageAndFileIndices = [-1, -1];
    }

    downloadFile(infoOnFileToDownload: number[]) {
        const file = this.messageFiles[infoOnFileToDownload[0]][infoOnFileToDownload[1]]
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }


    showReactionPanelForMessageFiles(messageIndex: number, fileIndex: number) {
        if(this.currentlyShownReactionPanelForMessageFiles[0]==messageIndex &&  this.currentlyShownReactionPanelForMessageFiles[1]==fileIndex) {
        this.currentlyShownReactionPanelForMessageFiles = [-1, -1];
        }
        else {
        this.currentlyShownReactionPanelForMessageFiles = [messageIndex, fileIndex];
        }
    }

    onDoubleClickingFile(messageIndex: number, fileIndex: number) {
        this.addFileReaction(messageIndex, fileIndex, "❤️");
    }


    showFileReactionsPopup(messageIndex: number, fileIndex: number) {
        this.notifyParentToShowMessageReactions.emit([this.messageFileReactions[messageIndex][fileIndex], this.messageFileReactionUsernames[messageIndex][fileIndex]]);
    }

    setCurrentlyShownOptionsPanel(messageIndex: number, fileIndex: number) {
        if(this.currentlyShownOptionsPanelForMessageFiles[0]==messageIndex && this.currentlyShownOptionsPanelForMessageFiles[1]==fileIndex) {
            this.currentlyShownOptionsPanelForMessageFiles = [-1, -1]
        }
        else {
            this.currentlyShownOptionsPanelForMessageFiles = [messageIndex, fileIndex];
        }
    
    }

    async startAudioCall() {
        //code for starting audio call
        let newMessageId = uuidv4();
        const responseForStartingAudioCallMessage = await fetch('http://localhost:8012/addMessage', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    messageId: newMessageId,
                    convoId: this.convoId,
                    message: JSON.stringify(["Video-Chat/Audio-Chat", "Audio-Call Started"]),
                    sender: this.authenticatedUsername,
                    messageSentAt: new Date()
                    
                })
            });
            
        if(!responseForStartingAudioCallMessage.ok) {
            throw new Error('Network response not ok');
        }

        let currentDateTime = new Date();
        this.messages.push([this.authenticatedUsername, ["Video-Chat/Audio-Chat", "Audio-Call Started", newMessageId], currentDateTime]);
        this.fileReplies.push([-1, -1]);
        this.reactions.push([]);
        this.reactionUsernames.push([]);
        this.messageFiles.push([]);
        this.messageFileImages.push([]);
        this.messageFileReactions.push([]);
        this.messageFileReactionUsernames.push([]);


        let newDateTime = new Date();
        newDateTime.setHours(currentDateTime.getHours() + 2);
        newMessageId = uuidv4();
        const responseForSendingAudioCallEndedMessage = await fetch('http://localhost:8012/addMessage', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    messageId: newMessageId,
                    convoId: this.convoId,
                    message: JSON.stringify(["Video-Chat/Audio-Chat", "Audio-Call Ended"]),
                    sender: this.authenticatedUsername,
                    messageSentAt: newDateTime
                    
                })
            });
            
        if(!responseForSendingAudioCallEndedMessage.ok) {
            throw new Error('Network response not ok');
        }

        this.messages.push([this.authenticatedUsername, ["Video-Chat/Audio-Chat", "Audio-Call Ended", newMessageId], newDateTime]);
        this.fileReplies.push([-1, -1]);
        this.reactions.push([]);
        this.reactionUsernames.push([]);
        this.messageFiles.push([]);
        this.messageFileImages.push([]);
        this.messageFileReactions.push([]);
        this.messageFileReactionUsernames.push([]);

        this.cdRef.detectChanges();
        this.scrollToBottom();
    }

    async startVideoCall() {
         //code for starting video call
        let newMessageId = uuidv4();
        const responseForStartingVideoCallMessage = await fetch('http://localhost:8012/addMessage', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    messageId: newMessageId,
                    convoId: this.convoId,
                    message: JSON.stringify(["Video-Chat/Audio-Chat", "Video-Chat Started"]),
                    sender: this.authenticatedUsername,
                    messageSentAt: new Date()
                    
                })
            });
            
        if(!responseForStartingVideoCallMessage.ok) {
            throw new Error('Network response not ok');
        }

        let currentDateTime = new Date();
        this.messages.push([this.authenticatedUsername, ["Video-Chat/Audio-Chat", "Video-Chat Started"], currentDateTime]);
        this.fileReplies.push([-1, -1]);
        this.reactions.push([]);
        this.reactionUsernames.push([]);
        this.messageFiles.push([]);
        this.messageFileImages.push([]);
        this.messageFileReactions.push([]);
        this.messageFileReactionUsernames.push([]);

        
        let newDateTime = new Date();
        newDateTime.setHours(currentDateTime.getHours() + 2);

        newMessageId = uuidv4();
        const responseForEndingVideoCallMessage = await fetch('http://localhost:8012/addMessage', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    messageId: newMessageId,
                    convoId: this.convoId,
                    message: JSON.stringify(["Video-Chat/Audio-Chat", "Video-Chat Ended"]),
                    sender: this.authenticatedUsername,
                    messageSentAt: newDateTime
                    
                })
            });
            
        if(!responseForEndingVideoCallMessage.ok) {
            throw new Error('Network response not ok');
        }

        this.messages.push([this.authenticatedUsername, ["Video-Chat/Audio-Chat", "Video-Chat Ended"], newDateTime]);
        this.fileReplies.push([-1, -1]);
        this.reactions.push([]);
        this.reactionUsernames.push([]);
        this.messageFiles.push([]);
        this.messageFileImages.push([]);
        this.messageFileReactions.push([]);
        this.messageFileReactionUsernames.push([]);

        this.cdRef.detectChanges();
        this.scrollToBottom();
    }

    getFullNamesOfAllConvoMembers() {
        let fullNames = this.groupMessageRecipientsInfo[0][1];
        if(this.groupMessageRecipientsInfo.length==2) {
            return fullNames + " & " + this.groupMessageRecipientsInfo[1][1];
        }
        for(let i=1; i<this.groupMessageRecipientsInfo.length-1; i++) {
            fullNames += ", " + this.groupMessageRecipientsInfo[i][1];
        }
        fullNames += ", & " +  this.groupMessageRecipientsInfo[this.groupMessageRecipientsInfo.length-1][1];
        
        return fullNames;
    }

    doesUserHaveConvoPerks() {
        return this.selectedConvoInitator[0]===this.authenticatedUsername;
    }

    getConvoTitleCursorStyle() {
        if((this.promotedUsernames.includes(this.authenticatedUsername)) || (this.doesUserHaveConvoPerks())) {
            return  {
                'cursor': 'pointer'
            }
        }
        return {
            'cursor': 'auto'
        };
    }

    async toggleEditConvoTitle(buttonClickedIfAny: string) {
        if(!this.isEditingConvoTitle && ((this.promotedUsernames.includes(this.authenticatedUsername)) || (this.doesUserHaveConvoPerks()))) {
            this.convoTitleBeforeEditing = this.convoTitle;
            this.isEditingConvoTitle = true;
        }
        else if(this.isEditingConvoTitle && ((this.promotedUsernames.includes(this.authenticatedUsername)) || (this.doesUserHaveConvoPerks()))) {
            if(buttonClickedIfAny==="Cancel") {
                this.convoTitle = this.convoTitleBeforeEditing;
            }
            if(this.convoTitleBeforeEditing!==this.convoTitle) {
                this.notifyParentToUpdateConvoTitle.emit([this.authenticatedUsername, ["Convo-Title", this.convoTitleBeforeEditing + " to " + this.convoTitle], new Date(), this.convoTitle]);
                this.messages.push([this.authenticatedUsername, ["Convo-Title", "You changed the title of this conversation from " + this.convoTitleBeforeEditing + " to " + this.convoTitle], new Date()]);
                this.fileReplies.push([-1, -1]);
                this.reactions.push([]);
                this.reactionUsernames.push([]);
                this.messageFiles.push([]);
                this.messageFileImages.push([]);
                this.messageFileReactions.push([]);
                this.messageFileReactionUsernames.push([]);
            }
            this.isEditingConvoTitle = false;
        }
    }

    isVideoOrAudioMessage(messageIndex: number) {
        return this.messages[messageIndex].length == 3 && (<Array<any>>this.messages)[messageIndex][1][0]==='Video-Chat/Audio-Chat';
    }

    getVideoOrAudioMessage(messageIndex: number) {
        return (<Array<any>>this.messages)[messageIndex][1][1];
    }

    isConvoTitle(messageIndex: number) {
        return this.messages[messageIndex].length == 3 && (<Array<any>>this.messages)[messageIndex][1][0]==='Convo-Title';
    }

    getConvoTitleFromAndTo(messageIndex: number) {
        return (<string>(<Array<any>>this.messages)[messageIndex][1][1]);
    }

    isThisMessageFromABlockedUser(messageIndex: number) {
        return this.blockedUsernames.includes(<string>this.messages[messageIndex][0]);
    }

    isMemberAdditionOrRemoval(messageIndex: number) {
        return this.messages[messageIndex].length == 3 && (<Array<any>>this.messages)[messageIndex][1][0]==='Add-Member/Remove-Member';
    }

    getMemberAdditionOrRemoval(messageIndex: number) {
        return (<string>(<Array<any>>this.messages)[messageIndex][1][1]);
    }

    isMemberPromotionOrDemotion(messageIndex: number) {
        return this.messages[messageIndex].length == 3 && (<Array<any>>this.messages)[messageIndex][1][0]==='Member-Promotion/Member-Demotion';
    }

    getMemberPromotionOrDemotion(messageIndex: number) {
        return (<string>(<Array<any>>this.messages)[messageIndex][1][1]);
    }

    isNoteReply(messageIndex: number) {
        return this.messages[messageIndex].length == 3 && (<Array<any>>this.messages)[messageIndex][1][0]==='Note-Reply';
    }

    getNoteReplyText(messageIndex: number) {
        return (<string>(<Array<any>>this.messages)[messageIndex][1][1][0]);
    }

    getNoteOriginalNoteText(messageIndex: number) {
        return (<string>(<Array<any>>this.messages)[messageIndex][1][1][1]);
    }

    getNoteReplyOriginalUsername(messageIndex: number) {
        return (<string>(<Array<any>>this.messages)[messageIndex][1][1][2]);
    }

    isMessageReply(messageIndex: number) {
        return this.messages[messageIndex].length == 3 && (<Array<any>>this.messages)[messageIndex][1][0]==='Reply';
    }

    getRepliedToText(messageIndex: number) {
        return (<string>(<Array<any>>this.messages)[messageIndex][1][1]);
    }

    getOriginalMessageReplyText(messageIndex: number) {
        return (<string>(<Array<any>>this.messages)[messageIndex][1][2]);
    }

    getMessageReplyText(messageIndex: number) {
        return (<string>(<Array<any>>this.messages)[messageIndex][1][3]);
    }

    isForwardedMessage(messageIndex: number) {
        return this.messages[messageIndex].length == 3 && (<Array<any>>this.messages)[messageIndex][1][0]==='Forward';
    }

    getForwardedMessageFromConvoText(messageIndex: number) {
        return (<string>(<Array<any>>this.messages)[messageIndex][1][1]);
    }

    getForwardedMessage(messageIndex: number) {
        return (<string>(<Array<any>>this.messages)[messageIndex][1][2]);
    }



    



}
