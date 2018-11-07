# EZ (Goat) 3 
An Amazon S3 like node.js back-end for upload/download of public/private files
![image](https://user-images.githubusercontent.com/43566001/48131798-fc907780-e299-11e8-8f87-8eccefc1fb4c.png)


##  IronSource-challenge-s3 - what's it all about
So, this app is a backend for upload/download of files, which uses express, along with some middleware packages (JWT - authentication, multer - file uploadng).

Metadata for the files is stored in the cloud google Firestore DB.

The actual files are stored on the file system under as sub diretory - called files.

### Users

|User|x-auth-token|
|-|-|
|user1|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlcjEiLCJpZCI6InFBemVmMzJGIiwiaWF0IjoxNTQxNTMwMjMyfQ.XwBVOYy4CUATXKvWBwaU0yqyEkf6LjCftXJP1yxKcOg|


http://localhost:5000/api/files/gRvmRaSDqVuX0k6ABkj0?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlcjEiLCJpZCI6InFBemVmMzJGIiwiaWF0IjoxNTQxNTMwMjMyfQ.XwBVOYy4CUATXKvWBwaU0yqyEkf6LjCftXJP1yxKcOg
