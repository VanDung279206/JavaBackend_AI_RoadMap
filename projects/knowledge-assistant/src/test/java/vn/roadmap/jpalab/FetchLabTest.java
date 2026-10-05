package vn.roadmap.jpalab;
import vn.roadmap.knowledge.KnowledgeApplication;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;

import jakarta.persistence.*;
import org.hibernate.SessionFactory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import java.nio.charset.StandardCharsets;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

@ContextConfiguration(classes=KnowledgeApplication.class)
@EntityScan(basePackageClasses={FetchLabTest.class,vn.roadmap.knowledge.DocumentEntity.class})
@DataJpaTest(properties={"spring.jpa.hibernate.ddl-auto=create-drop","spring.flyway.enabled=false","spring.jpa.properties.hibernate.generate_statistics=true"})
class FetchLabTest {
 @Entity(name="LabAuthor") @Table(name="lab_author")
 public static class Author {
  @Id @GeneratedValue Long id;
  @OneToMany(mappedBy="author",cascade=CascadeType.ALL,fetch=FetchType.LAZY) List<Book> books=new ArrayList<>();
  protected Author(){}
 }
 @Entity(name="LabBook") @Table(name="lab_book")
 public static class Book {
  @Id @GeneratedValue Long id;
  @ManyToOne(fetch=FetchType.LAZY) Author author;
  String title;
  protected Book(){}
 }
 @Autowired EntityManager em;
 private void seed(){for(int i=0;i<3;i++){Author a=new Author();Book b=new Book();b.author=a;b.title="book-"+i;a.books.add(b);em.persist(a);}em.flush();em.clear();}
 private long queries(String jpql){
  var stats=em.getEntityManagerFactory().unwrap(SessionFactory.class).getStatistics();stats.clear();
  var authors=em.createQuery(jpql,Author.class).getResultList();assertEquals(3,authors.size());
  var titles=authors.stream().flatMap(a->a.books.stream()).map(b->b.title).sorted().toList();
  assertEquals(List.of("book-0","book-1","book-2"),titles);return stats.getPrepareStatementCount();
 }
 @Test void baselineExposesNPlusOne(){seed();assertEquals(4,queries("select a from LabAuthor a order by a.id"));}
 @Test void learnerFetchAvoidsNPlusOne()throws Exception{
  seed();try(var input=getClass().getResourceAsStream("/lab-fetch.jpql")){
   assertNotNull(input);String jpql=new String(input.readAllBytes(),StandardCharsets.UTF_8).strip();assertEquals(1,queries(jpql),"expected=1 query; actual=N+1 means fetch strategy is missing");
  }
 }
}
