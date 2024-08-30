package springBootBackend3.springBootBackend3;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "userNotes")
public class UserNote {

    @Id
    public String id;

    @Field("poster")
    public String poster;

    @Field("noteText")
    public String noteText;

    @Field("noteCreatedAt")
    public Date noteCreatedAt;

    @Field("noteEditedAt")
    public Date noteEditedAt;

    public String toString() {
        return poster + ": " + noteText + "\n Created at " + noteCreatedAt;
    }


}
