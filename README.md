# EZ (Goat) 3 
An Amazon S3 like node.js back-end for upload/download of public/private files
![image](https://user-images.githubusercontent.com/43566001/48131798-fc907780-e299-11e8-8f87-8eccefc1fb4c.png)

## TLDR;
1. It does what it needs to (at least I hope so).
2. Clone -> npm i -> node.js index.js
3. \Postman client files contains a JSON with some test requests.
4. If had more time -> a.would use a DB to store the files instead of file system. b. config. c. implement a root route. d. better error handling. e. Run spelling checks on my inline comments

##  IronSource-challenge-s3 - what's it all about
So, this app is a back-end for uploading/downloading of files, which uses **express**, along with some middle-ware packages (**JWT**- authentication, **multer**- file uploading).

Metadata for the files is stored in the cloud Google **Firestore DB** - and there's a package for that as well.

The actual files are stored on the file system under as sub directory - called files.

### Routes
1. Get **api/files/:user/:file**-  for downloading public files. it is possible to provide a metadata=true query parameter to get the metadata of the file instead of the actual file itself. This works for deleted files as well. Will work in a browser as well.
2. **Get api/files/:fileID** - for downloading of private files. access_token query parameters is required. This is a JWT that should be verified to the user who is the owner of the file.it is possible to provide a metadata=true query parameter to get the metadata of the file instead of the actual file itself. This works for deleted files as well. Will work in a browser as well
3. **Post api/files**- for uploading files. x-auth-token header with a JWT (of a user) is required. "isPublic" Boolean body parameters is also required.  It is possible to post the same file over and over again. The file is overwritten and the metadata is updated. 

4. **Put api/files/:id**- for updating the isPublic property. x-auth-token header with a JWT (of a user) is required.

5. **Delete api/files/:id**- for deleting a file.
x-auth-token header with a JWT (of a user) is required.
The file is deleted but the metadata remains forever with a deletedAT timestamp

### Setup
1. EZ3 was developed on node version 8.11.4
2. Clone the reop to your computer
3. on terminal, navigate to the root folder and run **npm i** to get all the required packages
4. in the root folder run **node index.js**
5. By default, express will listen on port 5000. If this is a problem, you may define an environment variable named 

### Tests
There are two predefined users (user1 and user2). JWTs were generated for them using the secret key defined. Here they are:

|User|x-auth-token|
|-|-|
|user1|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlcjEiLCJpZCI6InFBemVmMzJGIiwiaWF0IjoxNTQxNTMwMjMyfQ.XwBVOYy4CUATXKvWBwaU0yqyEkf6LjCftXJP1yxKcOg|
|user2|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlcjIiLCJpZCI6ImhUOUxtZHjigJkiLCJpYXQiOjE1NDE1MzAyMzJ9.y-5_ns9zVX1dijJloI3Jhga7kCcPFyfxx9lZWK8fbb8|

under the root directory, you should find a Postman client files directory with a Postman JSON collection which you may import to Postman for testing.

There are also several files already in the files folder (with metadata in Firestore) which you may test first before uploading your own.

Postman
01. User Get Public - Gets a public image file of user1. You may also toggle on/off the metadata param to get the metadata instead of the actual image

02. User 1 trying to get private file of user2 and fails - since the file is a private file of user2. This also demonstrates the fact that the file name is not unique as this is the same file (name) for both users.

03. Private file download using ID and token - same file from 02 - but now there's access as this is the private route with the right credentials

04. Update the file from request 02 - update the isPublic property of the file of user2. You may toggle the JSON body isPublic prop to "true" - and then go back to query 2 which should now work because the file is public.

05. Delete user2's file - pay attention to the deletedAt that is updated.

Run query 03 again to see that the file was deleted.
Toggle the metadta=true param to see to get the metadata.

06. User 2 upload private - upload the same file again - it doesn't have to be the exact same file - just with the same name. This will demonstrate that the deletedDT is set to null and updatedDT is reset (and the file is uploaded). 


Now, you may upload more file and play them. Keep in mind that in the POST result you can find the file ID - which you need for future PUT,DELETE and private GET requests:

![image](https://user-images.githubusercontent.com/43566001/48154876-52811180-e2d2-11e8-8f9d-8df082f0d40f.png)

## Security Breaches
1. Yes I know - I should never keep JWT secrets in the code (and upload to a public repo...) - but I didn't want to bother anyone with setting up environment variables.
2. same goes for firestore.json which is the key file for accessing the Firestore DB.
You know, I actually received an email from Google that they have detected this! 
Sometimes they just creep me out with what they know..

## Things I would've done if I had more time
1. Research and setup a different cloud DB that would let me store the actual file stream in the database, alongside the metadata, rather than the file system

I think it's probably a better solution because:

 a. There a single way of handling the data - DB

 b. Issues like - what happens if we succeeded in deleting the file but fails with updating the metadata - become none issue. Deleting a file is simply a DB update.

 c. It would eliminate OS issues that might occur -file system permissions and things I still pray to god that will work on MAC (tested only on Windows)

2. Move some stuff to config - like the name of the files folder - etc. Things like this are not something I would approve in a PR:

``` js
`${__dirname}/../files/${metadata.filename}`
```

3. implement a GET root route that would list all the public files and this user's files.

4. Better error handling and messages

5. Run spelling checks on my inline comments
