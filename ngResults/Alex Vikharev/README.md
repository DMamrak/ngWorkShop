# Home Work (8 Apr 2016)

This is a homework task for weekly AngularJS workshop. Due date for this task is Thursday 14 Apr 2016 (I need some time to check all your results and make some cocnlusions, remarks, etc), so please get things ready before that date.



## How to start

1. Create an account on BitBucket.
2. Fork this repo.
3. Install Git client. I'd recomment [Git console](https://git-scm.com/download/win) but it's up to you.
4. Clone forked repo to your computer.
5. Install [NodeJS](https://nodejs.org/en).
6. Navigate to `ngHomeWork` folder.
7. Run `npm install` to install the dependancies, listed in `packaje.json`. Wait for installation to be finished.
8. Run `npm start` to start the server.
9. Open `http://localhost:8080/` in your browser.
10. Implement the app.
11. Commit your changes. Push it to the repo. Send me a pull request.



## API

### Get users list

URL: `/api/users?<query params>`

Query params:

| Param             | Default          | Description                                     | Example                             |
| ----------------- | ---------------- | ----------------------------------------------- | ----------------------------------- |
| **start**: Number | 0                | Defines page absolute start offset              | /api/users?start=5                  |
| **end**: Number   | 5                | Defines page absolute end offset                | /api/users?end=20                   |

**/api/users?start=10&end=20** will return items from 10-th to 20-th in items list in JSON format.

### Get user

URL: `/api/users/<id>`

| Param             | Default          | Description                                     | Example                             |
| ----------------- | ---------------- | ----------------------------------------------- | ----------------------------------- |
| **id**: Number    | None             | Unique user ID                                  | /api/users/100                      |

**/api/users/100** will return user data for user with id == 100.



## Homework task

The application should meet the following criteria:

- Load first 10 users on startup and render them as a table.
- Render users list in order of appearance in the server response.
- Change the sort order accordingly when user clicks on column header. Default order should be ascending. Further clicks should toggle the order.
- `Language` and `Role` values come as value codes, not as human readable values. Beautify them, preferably without changing the original model.
- `Created` and `Updated` values come as a timestamp, make them human readable, live the original data intact.
- Load next 10 users after click on `Load more` and append them to previuosly loaded.
- Hide `Load more` button when the end of the list is reached.


## Some hints

### General instructions

Keep things simple and concentrate on functionality, not architecture: this task doesn't require sophisticated solutions. Ideally app should look like [this](https://i.gyazo.com/b803833ad126dfce46a20d83248b3029.png), but, again, don't concentrate on HTML and CSS, main goal is to implement JS part.

### Sort order icon

There's no need to use raster image icon to indicate current corting order, you can use unicode symbol along with `:after` pseudo element:

```
a.asc:after {
	content: "▲";
}

a.desc:after {
	content: "▼";
}

```

### Beautifying timestamps

This may be somewhat complicated, to make this task easier I'd recommend you a great tool [Moment.js](http://momentjs.com/).