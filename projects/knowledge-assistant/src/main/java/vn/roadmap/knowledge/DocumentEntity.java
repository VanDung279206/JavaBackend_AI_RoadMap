package vn.roadmap.knowledge;

import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="document")
public class DocumentEntity {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) Long id;
    @Column(name="owner_id",nullable=false,length=40) String ownerId;
    @Column(nullable=false,length=120) String title;
    @Column(nullable=false,length=20000) String content;
    @Column(name="created_at",nullable=false) Instant createdAt;
    @Version long version;
    protected DocumentEntity() {}
    DocumentEntity(String owner,String title,String content){this.ownerId=owner;this.title=title;this.content=content;this.createdAt=Instant.now();}
}
