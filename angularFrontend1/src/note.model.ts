export interface Note {
    text: string;
    createdAt: Date;
    editedAt: any; //can be Date or null
    noteId: string;
}
