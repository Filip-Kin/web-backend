## Objects

### Post

```
id: string
title: string
published: Date
content: string
images: Array<string>
```

### Album

```
id: string
name: string
weight: number
images: string[]
```

### User

```
id: string
name: string
email: string
password: string
role: 0 | 1 | 2
reset_password: boolean
```

```
ADMIN_ROLE = 0;
EDITOR_ROLE = 1;
VIEWER_ROLE = 2;
```

## Endpoints

### Public

| Method | Path           | Payload         | Response                                            |
| ------ | -------------- | --------------- | --------------------------------------------------- |
| GET    | `/:fileuuid`   | none            | File from store                                     |
| GET    | `/posts/:s/:e?`| none            | List of post objects from s to e ordered by date    |
| GET    | `/post/:id`    | none            | Single post object                                  |
| GET    | `/gallery`     | none            | List of album objects                               |
| GET    | `/gallery/:id` | none            | Single album object                                 |
| POST   | `/user/login`  | email, password | User object or reset password error or unauthorized |
| POST   | `/user/auth`   | id, password    | User object or reset password error or unauthorized |

### Viewer permission

*All authenticated endpoints need the id and password in the header*

| Method | Path             | Payload  | Response         |
| ------ | ---------------- | -------- | ---------------- |
| POST   | `/user/password` | password | success or error |

### Editor permission

| Method | Path                          | Payload                        | Response                |
| ------ | ----------------------------- | ------------------------------ | ----------------------- |
| post   | `/post/`                      | title, content                 | Post object or error    |
| patch  | `/post/:id`                   | title, content                 | Post object or error    |
| delete | `/post/:id`                   | none                           | success or error        |
| post   | `/gallery`                    | name, weight, images           | Album object or error   |
| delete | `/gallery/:id`                | none                           | success or error        |
| post   | `/gallery/:id/rename/:name`   | none                           | Album object or error   |
| post   | `/gallery/:id/weight/:weight` | none                           | Album object or error   |
| post   | `/gallery/:id/add/:file`      | none                           | Album object or error   |
| post   | `/gallery/:id/remove/:file`   | none                           | Album object or error   |
| post   | `/store/upload`               | file labeled image in formdata | uuid file name or error |

### Admin permission

| Method | Path                      | Payload                     | Response             |
| ------ | ------------------------- | --------------------------- | -------------------- |
| POST   | `/user/`                  | name, email, password, role | User object or error |
| POST   | `/user/:id/resetpassword` | password                    | success or error     |
