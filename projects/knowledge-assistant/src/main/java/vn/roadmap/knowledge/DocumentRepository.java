package vn.roadmap.knowledge;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.*;
import jakarta.persistence.LockModeType;
import java.util.Optional;
public interface DocumentRepository extends JpaRepository<DocumentEntity,Long> {
    Optional<DocumentEntity> findByIdAndOwnerId(Long id,String ownerId);
    Page<DocumentEntity> findByOwnerId(String ownerId,Pageable pageable);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from DocumentEntity d where d.id=:id and d.ownerId=:owner")
    Optional<DocumentEntity> lockOwned(@Param("id") long id,@Param("owner") String owner);
}
