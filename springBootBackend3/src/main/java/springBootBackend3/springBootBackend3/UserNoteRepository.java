package springBootBackend3.springBootBackend3;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface UserNoteRepository extends MongoRepository<UserNote, String> {
    List<UserNote> findByPosterOrderByNoteCreatedAtAsc(String poster);
    
    @Query(value = "{ 'poster': ?0 }", sort = "{ 'noteCreatedAt': -1 }")
    List<UserNote> findByPosterOrderByNoteCreatedAtDesc(String poster);

}
