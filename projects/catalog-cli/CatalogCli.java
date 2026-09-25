import java.util.Scanner;
public class CatalogCli {
    public static void main(String[] args) {
        var catalog=new JavaCoreLab.Catalog();var input=new Scanner(System.in);
        System.out.println("Commands: add, list, search, delete, quit");
        while(input.hasNextLine()) {
            String command=input.nextLine().strip();
            if(command.equals("quit"))break;
            try {
                switch(command) {
                    case "add" -> {
                        System.out.println("ID, title, content: enter one field per line");
                        long id=Long.parseLong(input.nextLine());String title=input.nextLine(),content=input.nextLine();
                        catalog.add(new JavaCoreLab.Document(id,title,content));System.out.println("ADDED");
                    }
                    case "list" -> System.out.println(catalog.all());
                    case "search" -> {System.out.println("Keyword:");System.out.println(JavaCoreLab.search(catalog.all(),input.nextLine()));}
                    case "delete" -> {System.out.println("ID:");System.out.println(catalog.remove(Long.parseLong(input.nextLine()))?"DELETED":"NOT_FOUND");}
                    default -> System.out.println("Unknown command");
                }
            }catch(java.util.NoSuchElementException e){System.out.println("Input ended");break;}
            catch(IllegalArgumentException e){System.out.println("ERROR: "+e.getMessage());}
        }
    }
}
