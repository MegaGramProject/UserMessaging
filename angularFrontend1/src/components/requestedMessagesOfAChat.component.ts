import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'RequestedMessagesOfAChat',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/requestedMessagesOfAChat.component.html',
    styleUrl: '../styles.css'
})
export class RequestedMessagesOfAChat {
    @Input() isExpanded!:boolean;
    @Input() messageRecipientInfo:string[] = [];
    @Input() convoDetailsPanelIsExpanded!: boolean;
    @Output() notifyParentToToggleConvoDetailsPanel:EventEmitter<string> = new EventEmitter();
    @Output() notifyParentToDeleteRequestedConvo:EventEmitter<string> = new EventEmitter();
    @Input() authenticatedUsername!:string;
    messages:Array<Array<Object>> = [
        ["Hey man, how's it going?", new Date(2024, 4, 15, 10, 30, 0), ""],
        ["It's your old friend", new Date(2024, 4, 15, 10, 30, 30), ""],
        ["Oh come on, just accept me already! i am just a frustrated hackeasmdsajdnsajdnjasndajsdnsajdajsndjasdasdjsandjasndjasddasjdnjasdnajsdasjdnasjdnajsdas akdxmnasdxas", new Date(2024, 4, 16, 12, 30, 30), "santaclaus"],
    ];
    currentlyHoveredSentMessageAndFileIndices: Array<number> = [-1, -1];
    currentlyShownOptionsPanelForMessageFiles:number[] = [-1, -1];
    @Output() notifyParentToAcceptRequestedConvo:EventEmitter<string> = new EventEmitter();
    blob = new Blob(['Hello, world!'], { type: 'text/plain' });

    file = new File([this.blob], 'hello.txt', { type: 'text/plain' });
    
    blob2 = new Blob(['Hello, world2!'], { type: 'text/plain' });

    file2 = new File([this.blob2], 'hello2.txt', { type: 'text/plain' });

    blob3 = new Blob(['Hello, world3!'], { type: 'text/plain' });

    file3 = new File([this.blob3], 'hello3.txt', { type: 'text/plain' });

    replies: Array<number> = [
        -1,
        0,
        -1
    ];
    reactions: Array<Array<string>> = [
        ["❤️"],
        [],
        []
    ];
    reactionUsernames: Array<Array<string>> = [
        ["rishavry2"],
        [],
        []
    ];

    messageFiles: Array<Array<File>> = [
        [],
        [],
        [this.file, this.file2, this.file3]
    ];
    messageFileImages: Array<Array<any>> = [
        [],
        [],
        ['default file image', 'default file image', 'default file image']
    ];
    fileReplies: Array<Array<number>> = [
        [-1, -1],
        [-1, -1],
        [-1, -1]
    ];
    @Input() groupMessageRecipientsInfo: string[][] = [];
    @Input() convoTitle:string = "";
    

    getWidthAndHorizontalStartOfSection() {
        if(this.isExpanded && this.convoDetailsPanelIsExpanded) {
            return {
                'width': '70%',
                'left': '7%'
            };
        }
        else if(this.isExpanded && !this.convoDetailsPanelIsExpanded) {
            return {
                'width': '88%',
                'left': '7%'
            };
        }
        else if(!this.isExpanded && this.convoDetailsPanelIsExpanded) {
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

    toggleConvoDetailsPanel() {
        this.notifyParentToToggleConvoDetailsPanel.emit("toggle convo-details panel");
    }


    blockUser() {
        //code for blocking user
        this.deleteRequestedConvo();
    }

    deleteRequestedConvo() {
        this.notifyParentToDeleteRequestedConvo.emit("delete the selected requested convo");
    }

    acceptRequestedConvo() {
        this.notifyParentToAcceptRequestedConvo.emit("accept the selected requested convo");
    }

    isMoreThan60MinutesLater(currentDate: any, previousDate: any): boolean {
        const diffInMilliseconds = currentDate.getTime() - previousDate.getTime();
        const diffInMinutes = diffInMilliseconds / (1000 * 60);
        return diffInMinutes > 60;
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

}