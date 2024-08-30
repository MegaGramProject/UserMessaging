package springBootBackend3.springBootBackend3;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class backendController {

    public backendController() {

    }

    @Autowired
    private UserNoteRepository userNoteRepository;

    @GetMapping("/getAllNotesOfUser/{username}")
    @CrossOrigin({"http://localhost:8011"})
    public ResponseEntity<List<UserNote>> getNotesOfUser(@PathVariable String username) {
        List<UserNote> notesOfUser = userNoteRepository.findByPosterOrderByNoteCreatedAtAsc(username);

        return new ResponseEntity<>(notesOfUser, HttpStatus.OK);
    }

    
    @GetMapping("/getUnexpiredNotesOfUser/{username}")
    @CrossOrigin({"http://localhost:8011"})
    public ResponseEntity<List<UserNote>> getUnexpiredNotesOfUser(@PathVariable String username) {
        List<UserNote> notesOfUser = userNoteRepository.findByPosterOrderByNoteCreatedAtAsc(username);
        List<UserNote> output = new ArrayList<>();
        
        for (UserNote userNote : notesOfUser) {
            if (isWithinLast24Hours(userNote.noteCreatedAt)) {
                output.add(userNote);
            }
        }

        return new ResponseEntity<>(output, HttpStatus.OK);
    }

    private static boolean isWithinLast24Hours(Date date) {
        Date now = new Date();

        Calendar calendar = Calendar.getInstance();
        calendar.setTime(now);
        calendar.add(Calendar.HOUR_OF_DAY, -24);
        Date twentyFourHoursAgo = calendar.getTime();

        return date.after(twentyFourHoursAgo);
    }



    @PostMapping("/addUserNote")
    @CrossOrigin({"http://localhost:8011"})
    public ResponseEntity<String> addUserNote(@RequestBody Map<String, String> request) throws Exception {
        if(request.containsKey("poster") && request.containsKey("noteText") && request.containsKey("noteCreatedAt")) {
            String poster = request.get("poster");
            String noteText = request.get("noteText");
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            Date noteCreatedAt = dateFormat.parse(request.get("noteCreatedAt"));
            UserNote newUserNote = new UserNote();
            newUserNote.poster = poster;
            newUserNote.noteText = noteText;
            newUserNote.noteCreatedAt = noteCreatedAt;
            newUserNote.noteEditedAt = null;
            userNoteRepository.save(newUserNote);
            return new ResponseEntity<>(newUserNote.id, HttpStatus.OK);
        }
        return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
    }

    @PatchMapping("/editUserNote/{noteId}")
    @CrossOrigin({"http://localhost:8011"})
    public ResponseEntity<Boolean> editUserNote(@RequestBody Map<String, String> request, @PathVariable String noteId) throws Exception {
        if(request.containsKey("noteText") && request.containsKey("noteEditedAt")) {
            Optional<UserNote> optionalUserNote = userNoteRepository.findById(noteId);
            if (optionalUserNote.isPresent()) {
                UserNote userNote = optionalUserNote.get();
                userNote.noteText = request.get("noteText");
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                Date noteEditedAt = dateFormat.parse(request.get("noteEditedAt"));
                userNote.noteEditedAt = noteEditedAt;
                userNoteRepository.save(userNote);
                return new ResponseEntity<>(true, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(true, HttpStatus.NOT_FOUND);
            }
        }
        return new ResponseEntity<>(false, HttpStatus.BAD_REQUEST);
    }

    @DeleteMapping("/deleteUserNote/{noteId}")
    @CrossOrigin({"http://localhost:8011"})
    public ResponseEntity<Boolean> deleteUserNote(@PathVariable String noteId) {
        Optional<UserNote> optionalUserNote = userNoteRepository.findById(noteId);
        if (optionalUserNote.isPresent()) {
            UserNote userNote = optionalUserNote.get();
            userNoteRepository.delete(userNote);
            return new ResponseEntity<>(true, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/getLatestUnexpiredNotesOfEachUser")
    @CrossOrigin({"http://localhost:8011"})
    public ResponseEntity<List<String>> getLatestUnexpiredNotesOfEachUser(@RequestBody Map<String, String[]> request) {
        if (request.containsKey("listOfUsers")) {
            String[] listOfUsers = request.get("listOfUsers");
            List<String> output = new ArrayList<>();
    
            for (String username : listOfUsers) {
                List<UserNote> userNotes = userNoteRepository.findByPosterOrderByNoteCreatedAtDesc(username);
                if (userNotes.size()>0) {
                    UserNote mostRecentUserNote = userNotes.get(0);
                    if (isWithinLast24Hours(mostRecentUserNote.noteCreatedAt)) {
                        output.add(mostRecentUserNote.noteText);
                    }
                    else {
                        output.add(null);
                    }
                }
                else {
                    output.add(null);
                }
            }
    
            return new ResponseEntity<>(output, HttpStatus.OK);
        }
        return new ResponseEntity<>(new ArrayList<>(), HttpStatus.BAD_REQUEST);
    }
    
    

}
