// fireclient query
// Version 0.0.2
// Author: Kevin
// LICENSE: MIT

/**
 * IMPORTANT NOTE, READ ME !!!:
 * 
 * INTERNAL_xxx: function starting with the prefix "INTERNAL_", should not be called directly.
 * This is a library code. Use it via the query method.
 * 
 * UNSTABLE_xxx: function starting with the prefix "UNSTABLE_", is currently in development,
 * and could potentially break things if used without caution.
 */

import { initializeApp, FirebaseApp } from "firebase/app";
import { 
    getFirestore, Firestore, 
    collection, QuerySnapshot, 
    DocumentData, DocumentSnapshot, DocumentReference,
    getDoc, getDocs, addDoc, doc, updateDoc, deleteDoc, 
} from "firebase/firestore";

interface FirebaseConfigProps {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}

export class FireclientQuery {
    private fireClientQueryVersion: string = "0.0.1";

    private app!: FirebaseApp;
    private db!: Firestore;

    public INTERNAL_getFireClientVersion() {
        return this.fireClientQueryVersion;
    }

    public INTERNAL_getApp() {
        return this.app;
    }

    public INTERNAL_getDb() {
        return this.db;
    }

    /**
        // Sample usage:
        // Connect to fireclient
        const firebaseConfig = {
            apiKey: "xxxxx",
            authDomain: "xxxxx",
            projectId: "xxxxx",
            storageBucket: "xxxxx",
            messagingSenderId: "xxxxx",
            appId: "xxxxx"
        };
        const f = new Fireclient(firebaseConfig);
    */
    constructor(firebaseConfig: FirebaseConfigProps) {
        if (firebaseConfig) {
            this.app = initializeApp(firebaseConfig);
            this.db = getFirestore(this.app);
        } 
        else {
            // throw new Error("Firebase config is required");
            console.error("Firebase config is required");
        }
    }

    // Get a single data from a collection
    /**
        // Sample usage:
        interface BookProps {
            id?: string;
            title: string;
            author: string;
        }
        const book = (await f.getSingleData("books", searchId)) as BookProps | null;
    */
    async INTERNAL_getSingleData<T>(collectionName: string, docId: string): Promise<T|null> {
        const docSnap: DocumentSnapshot<DocumentData, DocumentData> = await getDoc(doc(this.db, collectionName, docId));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as T;
        } 
        else {
            console.error(`Fireclient error: document id ${docId} does not exists`);
            return null;
        }
    }

    // Get all data from a collection as an array
    /**
        // Sample usage:
        async function getBooks() {
            const books = (await f.getAllData("books"));
            if (books) {
                return books;
            }
        }
    */
    async INTERNAL_getAllData<T>(collectionName: string): Promise<T[]> {
        const querySnapshot: QuerySnapshot = await getDocs(collection(this.db, collectionName));
        const data: T[] = [];
        querySnapshot.forEach((doc) => {
            const docData = { id: doc.id, ...doc.data() } as T;
            data.push(docData);
        });
        return data;
    }

    // Get all single field data from a collection as an array
    async UNSTABLE_getAllSingleFieldFromAllData<T>(collectionName: string, fieldName: keyof T): Promise<T[keyof T][]> {
        const querySnapshot: QuerySnapshot = await getDocs(collection(this.db, collectionName));
        const fieldValues: T[keyof T][] = querySnapshot.docs.map((doc) => {
            const docData = doc.data() as T;
            return docData[fieldName];
        });
        return fieldValues;
    }
    
    // Add a data to a collection
    /**
        // Sample usage:
        async function addBook() {
            const book = await f.addData("books", {
                title: "Harry Potter",
                author: "JK Rowling"
            });
            if (book) {
                alert("Book added");
            }
        }
    */
    async INTERNAL_addData(collectionName: string, fields: object): Promise<string> {
        try {
            const docRef: DocumentReference<object, DocumentData> = 
                await addDoc(collection(this.db, collectionName), fields);
            return docRef.id;
        } 
        catch (error) {
            console.error(`Fireclient error: error adding a new document\n${error}`);
            throw error; // Rethrow error after logging
        }
    }

    // Update a data in a collection
    /**
        // Sample usage:
        async function updateAuthor(bookId: string) {
            const newAuthor = window.prompt("Enter new author> ");
            if (newAuthor) {
            await f.updateData("books", bookId, { author: newAuthor })
                .then(() => getBooks());
            }
        }
    */
    async INTERNAL_updateData(collectionName: string, docId: string, updatedFields: object): Promise<void> {
        const docRef: DocumentReference<DocumentData, DocumentData> = doc(this.db, collectionName, docId);
        await updateDoc(docRef, updatedFields);
    }

    // Remove a data from a collection
    /**
        // Sample usage:
        async function removeBook() {
            await f.removeData("books", "4Hvy4Zx4k6uBjn73kPu1")
            .then(() => alert("Book removed"));
        }
    */
    async INTERNAL_removeData(collectionName: string, docId: string): Promise<void> {
        const docRef: DocumentReference<DocumentData, DocumentData> = doc(this.db, collectionName, docId);
        await deleteDoc(docRef);
    }

    // Query
    async query(queryString: string, data?: object) {

        // Holds all of the valid query action keyword
        const validActionKeywords: string[] = ["select", "insert", "update", "delete"];

        const queryStringArray = queryString.split(" ");
        const action = queryStringArray[0].toLowerCase(); // E.g. select / update / delete, etc...
        const collectionName: string = queryStringArray[3]; // target collection

        // Ensure action is valid
        if (validActionKeywords.includes(action)) {
            switch (action) {

                // SELECT action
                // Example usage:
                // const books = (await f.query("select * from books") as BookProps[]);
                case "select":

                    // SELECT one record - 
                    // Example query: select * from books where bookId == 123
                    if (queryStringArray.length > 4) {
                        if (collectionName !== "") {
                            return await this.INTERNAL_getSingleData(queryStringArray[3], queryStringArray[7]);
                        }
                    }
                    else {
                        // SELECT ALL - queryStringArray[1] == *
                        if (queryStringArray[1] == "*") {
                            if (collectionName !== "") {
                                return await this.INTERNAL_getAllData(collectionName);
                            }
                        }
                    }

                    break;
            
                // INSERT action
                // Example usage:
                // const book = await f.query("insert into books",  { title, author });
                case "insert":
                    if (queryStringArray[1] === "into" && collectionName !== "") {
                        return await this.INTERNAL_addData(queryStringArray[2].toLowerCase(), data!);
                    }
                break;
    
                // UPDATE action
                // Example usage:
                // await f.query(`update books where bookId == ${bookId}`, { author: newAuthor })
                case "update":
                    if (queryStringArray[1] !== "" &&  // 1
                        queryStringArray[2].toLowerCase() === "where" && // 2
                        queryStringArray[3].toLowerCase() !== "" && // 3
                        queryStringArray[4] === "==" && // 4
                        queryStringArray[5] !== ""  // 5
                    ) {
                        return await this.INTERNAL_updateData(queryStringArray[1], queryStringArray[5], data!);
                    }
                break;
    
                // DELETE action
                // Example usage:
                // await f.query(`delete from books where bookId == ${bookId}`)
                case "delete":
                    if (queryStringArray[1] === "from" &&  // 1
                        queryStringArray[2] !== "" && // 2
                        queryStringArray[3] === "where" && // 3
                        queryStringArray[4] !== "" && // 4
                        queryStringArray[5] === "==" &&  // 5
                        queryStringArray[6] !== "" // 6
                    ) {
                        return await this.INTERNAL_removeData(queryStringArray[2], queryStringArray[6]);
                    }
                break;
                
                default:
                    break;
            }
        }
        else {
            console.error(`Query error: the keyword "${action}" is not valid`);
        }

    }

}