# Fireclient reference
Example of how fireclient is used in a book application.

> [!NOTE]  
> All fireclient-query operations are asynchronous by default. 
> They need to be wrapped around an async function and await the query.

## Initialize fireclient
```ts
// Your Firebase config
const firebaseConfig = {
    apiKey: "xxxxx",
    authDomain: "xxxxx",
    projectId: "xxxxx",
    storageBucket: "xxxxx",
    messagingSenderId: "xxxxx",
    appId: "xxxxx"
};

// Create an instance of fireclient (f)
const f = new FireclientQuery(firebaseConfig);
```

## Get all data
E.g. get all books from the books collection
```ts
interface BookProps {
  id?: string;
  title: string;
  author: string;
}

// Use the f.query(select * from collectionName)
const books = (await f.query("select * from books") as BookProps[]);
```

## Add a data to a collection
E.g. add a book to the books collection
```ts
// Use the f.query(insert into collectionName, object)
await f.query("insert into books", { title, author });
```

## Update data in a collection
E.g. update a book in the books collection
```ts
// Use the f.query(update collectionName where id == documentId, updatedFields)
await f.query(`update books where bookId == ${bookId}`, { author: newAuthor });
```

## Delete a data in a collection
E.g. delete a book in the books collection
```ts
// Use the f.query(delete from collectionName where id == documentId)
await f.query(`delete from books where bookId == ${bookId}`)
```